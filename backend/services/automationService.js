import Automation from '../models/Automation.js';
import AutomationState from '../models/AutomationState.js';
import AutomationLog from '../models/AutomationLog.js';
import User from '../models/User.js';
import { sendTemplateMessage, sendTextMessage } from './whatsappService.js';
import axios from 'axios';

/**
 * Main Entry Point for Automation
 */
export const processAutomation = async (userId, fromNumber, messageText) => {
    try {
        console.log(`[Automation] Processing message for ${fromNumber}: "${messageText}" (UserID: ${userId})`);
        
        // 1. Check for active conversation state
        let state = await AutomationState.findOne({ phoneNumber: fromNumber, userId });

        if (state) {
            console.log(`[Automation] Found existing state for ${fromNumber}. Resuming flow...`);
            const automation = await Automation.findById(state.automationId);
            if (automation && automation.status === 'active') {
                return await executeWorkflow(automation, state, messageText);
            } else {
                console.log(`[Automation] Workflow ${state.automationId} is no longer active. Deleting state.`);
                await AutomationState.findByIdAndDelete(state._id);
            }
        }

        // 2. Search for Triggers in active automations
        const automations = await Automation.find({ 
            $or: [{ clientId: userId }, { createdBy: userId }], 
            status: 'active' 
        });

        console.log(`[Automation] Found ${automations.length} active automations for this user.`);

        for (const auto of automations) {
            const triggerNode = auto.nodes.find(n => n.type === 'triggerNode');
            if (!triggerNode) {
                console.log(`[Automation] Workflow "${auto.name}" has no trigger node.`);
                continue;
            }

            const isMatched = checkTriggerMatch(triggerNode, messageText);
            if (isMatched) {
                console.log(`[Automation] Match found! Triggering "${auto.name}" for ${fromNumber}`);
                
                // Create new state
                const newState = await AutomationState.create({
                    phoneNumber: fromNumber,
                    userId,
                    automationId: auto._id,
                    currentNodeId: triggerNode.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h session
                });

                return await executeWorkflow(auto, newState, messageText);
            }
        }
        console.log(`[Automation] No matching triggers found for "${messageText}"`);
    } catch (err) {
        console.error("[Automation Engine Error]:", err);
    }
};

/**
 * Check if a trigger node matches the incoming message
 */
const checkTriggerMatch = (node, messageText) => {
    const config = node.data?.config || {};
    const text = messageText.trim().toLowerCase();
    const type = config.type || 'keyword';

    console.log(`[Automation] Checking trigger match (Type: ${type}). Input: "${text}"`);

    if (type === 'keyword') {
        const keywords = config.keywords || [];
        console.log(`[Automation] Keywords to check: ${JSON.stringify(keywords)}`);
        return keywords.some(kw => {
            const target = kw.toLowerCase().trim();
            const match = config.matchType === 'exact' ? text === target : text.includes(target);
            console.log(`[Automation] Comparing "${text}" to "${target}" (Match: ${match})`);
            return match;
        });
    }
    
    if (type === 'incoming_message') return true;

    return false;
};

/**
 * Recursive/Loop based Workflow Executor
 */
const executeWorkflow = async (automation, state, lastMessage) => {
    let currentNodeId = state.currentNodeId;
    let keepExecuting = true;

    while (keepExecuting) {
        // Find outgoing edges from current node
        const outgoingEdges = automation.edges.filter(e => e.source === currentNodeId);
        
        if (outgoingEdges.length === 0) {
            console.log(`[Automation] Workflow "${automation.name}" ended for ${state.phoneNumber}`);
            await AutomationState.findByIdAndDelete(state._id);
            break;
        }

        // For now, take the first edge (simple flows)
        // Multi-branching (Conditions) will pick specific edges
        const nextEdge = outgoingEdges[0];
        const nextNode = automation.nodes.find(n => n.id === nextEdge.target);

        if (!nextNode) {
            await AutomationState.findByIdAndDelete(state._id);
            break;
        }

        console.log(`[Automation] Executing Node: ${nextNode.type} (${nextNode.id})`);

        const result = await handleNodeExecution(nextNode, automation, state, lastMessage);

        // Log the execution
        await AutomationLog.create({
            automationId: automation._id,
            clientId: automation.clientId || state.userId,
            phoneNumber: state.phoneNumber,
            nodeId: nextNode.id,
            nodeType: nextNode.type,
            status: result.success ? 'success' : 'error',
            output: result.output,
            errorMessage: result.error
        });

        if (result.pause) {
            // Node requested to wait (e.g. "Wait for Reply" or "Delay")
            state.currentNodeId = nextNode.id;
            state.waitingForReply = result.waitingForReply || false;
            state.lastActivity = new Date();
            await state.save();
            keepExecuting = false;
        } else if (result.success) {
            currentNodeId = nextNode.id;
            state.currentNodeId = currentNodeId;
            await state.save();
        } else {
            // Error occurred
            keepExecuting = false;
        }
    }
};

/**
 * Node Logic Dispatcher
 */
const handleNodeExecution = async (node, automation, state, lastMessage) => {
    const config = node.data?.config || {};
    const user = await User.findById(state.userId);

    switch (node.type) {
        case 'messageNode':
            try {
                // Replace variables in text
                let text = config.message || '';
                if (state.context) {
                    state.context.forEach((val, key) => {
                        text = text.replace(new RegExp(`{{${key}}}`, 'g'), val);
                    });
                }

                // Attempt with user token first, fallback to system if it fails
                const userToken = user.access_token;
                const systemToken = process.env.ACCESSTOKEN;
                const phoneId = user.phone_number_id || process.env.PHONE_NUMBER_ID;

                console.log(`[Automation] Attempting message with user token...`);
                let result = await sendTextMessage(phoneId, userToken || systemToken, state.phoneNumber, text);

                if (!result.success) {
                    const errorStr = JSON.stringify(result.error || '');
                    const isAuthError = errorStr.includes('190') || errorStr.includes('Authentication');
                    
                    if (isAuthError && userToken && systemToken) {
                        console.log(`[Automation] User token invalid (190). Retrying with system token...`);
                        result = await sendTextMessage(phoneId, systemToken, state.phoneNumber, text);
                    }
                }

                if (!result.success) {
                    return { success: false, error: result.error };
                }

                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }

        case 'condition':
            // Logic for branching
            // Returns the handle ID to follow
            return { success: true, pause: false };

        case 'waitNode':
            // If we are currently "waiting", and we got a message, it means the wait is over
            if (state.waitingForReply) {
                // Store the reply in context if needed
                if (config.variableName) {
                    state.context.set(config.variableName, lastMessage);
                }
                return { success: true, pause: false };
            } else {
                // First time hitting this node, start waiting
                return { success: true, pause: true, waitingForReply: true };
            }

        case 'ai_reply':
            // Integration with Gemini
            return { success: true };

        default:
            return { success: true };
    }
};
