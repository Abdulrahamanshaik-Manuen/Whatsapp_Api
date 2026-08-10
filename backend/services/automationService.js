import Automation from '../models/Automation.js';
import AutomationState from '../models/AutomationState.js';
import AutomationLog from '../models/AutomationLog.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import { sendTemplateMessage, sendTextMessage, sendMediaMessage } from './whatsappService.js';
import { calculateMetaCost } from '../utils/pricingEngine.js';
import axios from 'axios';
import { io } from '../server/Server.js';
import logger from '../utils/logger.js';

export const processAutomation = async (userId, fromNumber, messageText) => {
    try {

        // Search for Triggers first - This allows "Restart" keywords like 'hello' to reset the flow
        const automations = await Automation.find({
            $or: [{ clientId: userId }, { createdBy: userId }],
            status: 'active'
        });

        for (const auto of automations) {
            const triggerNode = auto.nodes.find(n => n.type === 'triggerNode');
            if (!triggerNode) continue;

            const isMatched = checkTriggerMatch(triggerNode, messageText);
            if (isMatched) {
                logger.info(`[Automation] Trigger match for "${messageText}". Starting flow for ${fromNumber}`);

                // Update Automation Metrics
                await Automation.findByIdAndUpdate(auto._id, {
                    $inc: { 'metrics.totalExecutions': 1 },
                    $set: { 'metrics.lastTriggered': new Date() }
                });

                if (io) {
                    io.emit('live_event', {
                        type: 'automation_start',
                        from: fromNumber,
                        automationName: auto.name,
                        trigger: messageText,
                        timestamp: new Date()
                    });
                }

                // Clear any existing stuck state for this user/number
                await AutomationState.deleteMany({ phoneNumber: fromNumber, userId });

                // Create new state starting at the trigger
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

        // If no trigger matched, check if we are in the middle of an existing conversation
        let state = await AutomationState.findOne({ phoneNumber: fromNumber, userId });

        if (state) {
            const automation = await Automation.findById(state.automationId);
            if (automation && automation.status === 'active') {
                return await executeWorkflow(automation, state, messageText);
            } else {
                await AutomationState.findByIdAndDelete(state._id);
            }
        }

    } catch (err) {
    }
};

const checkTriggerMatch = (node, messageText) => {
    const config = node.data?.config || {};
    const text = messageText.trim().toLowerCase();
    const type = config.type || 'keyword';

    // console.log(`[Automation] Checking trigger match (Type: ${type}). Input: "${text}"`);

    if (type === 'keyword') {
        const keywords = config.keywords || [];
        return keywords.some(kw => {
            const target = kw.toLowerCase().trim();
            const match = config.matchType === 'exact' ? text === target : text.includes(target);
            // console.log(`[Automation] Comparing "${text}" to "${target}" (Match: ${match})`);
            return match;
        });
    }

    if (type === 'incoming_message') return true;

    return false;
};

const executeWorkflow = async (automation, state, lastMessage) => {
    let keepExecuting = true;

    // If we were waiting for a reply, we must first "finish" the current node
    if (state.waitingForReply) {
        const currentNode = automation.nodes.find(n => n.id === state.currentNodeId);
        if (currentNode) {
            const result = await handleNodeExecution(currentNode, automation, state, lastMessage);

            if (result.pause) {
                // Still waiting? (Shouldn't happen for waitNode but maybe for others)
                return;
            }

            if (!result.success) {
                return;
            }

            // Node finished! Clear waiting state
            state.waitingForReply = false;
            // Now we proceed to outgoing edges from this node
        }
    }

    while (keepExecuting) {
        const currentNodeId = state.currentNodeId;
        const outgoingEdges = automation.edges.filter(e => e.source === currentNodeId);

        if (outgoingEdges.length === 0) {

            // Update Success Metrics
            const updatedAuto = await Automation.findById(automation._id);
            if (updatedAuto) {
                const totalSuccess = (updatedAuto.metrics.totalSuccess || 0) + 1;
                const totalExecutions = updatedAuto.metrics.totalExecutions || 1;
                const successRate = Math.min(100, ((totalSuccess / totalExecutions) * 100).toFixed(1));

                await Automation.findByIdAndUpdate(automation._id, {
                    $set: {
                        'metrics.totalSuccess': totalSuccess,
                        'metrics.successRate': successRate
                    }
                });
            }

            await AutomationState.findByIdAndDelete(state._id);
            break;
        }

        const nextEdge = outgoingEdges[0];
        const nextNode = automation.nodes.find(n => n.id === nextEdge.target);

        if (!nextNode) {
            await AutomationState.findByIdAndDelete(state._id);
            break;
        }

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
            state.currentNodeId = nextNode.id;
            state.waitingForReply = result.waitingForReply || false;
            state.lastActivity = new Date();
            await state.save();
            keepExecuting = false;
        } else if (result.success) {
            state.currentNodeId = nextNode.id;
            // Important: update the local state.currentNodeId for the next loop iteration
            await state.save();
        } else {
            keepExecuting = false;
        }
    }
};

const handleNodeExecution = async (node, automation, state, lastMessage) => {
    const config = node.data?.config || {};
    const user = await User.findById(state.userId);
    const contact = await Contact.findOne({ phoneNumber: state.phoneNumber, userId: state.userId });
    let isInsideWindow = contact ? (contact.customer_service_window_active && contact.window_expires_at > new Date()) : false;

    // Message-based Fallback (Robust check)
    if (!isInsideWindow) {
        const lastIncoming = await Message.findOne({ to: state.phoneNumber, direction: 'incoming', user_id: state.userId }).sort({ created_at: -1 });
        if (lastIncoming) {
            const now = new Date();
            const diff = now - lastIncoming.created_at;
            if (diff < 24 * 60 * 60 * 1000) {
                isInsideWindow = true;
            }
        }
    }

    switch (node.type) {
        case 'messageNode':
            try {
                if (!isInsideWindow) {
                    return { success: false, error: "Customer service window expired. Automation cannot send free-form messages." };
                }

                // Global Limit Check
                if (user.messages_used >= user.message_limit) {
                    return { success: false, error: "Message limit exceeded." };
                }

                let text = config.message || '';
                if (state.context) {
                    state.context.forEach((val, key) => {
                        text = text.replace(new RegExp(`{{${key}}}`, 'g'), val);
                    });
                }

                const userToken = user.access_token;
                const systemToken = process.env.ACCESSTOKEN;
                const phoneId = user.phone_number_id || process.env.PHONE_NUMBER_ID;
                const mediaUrl = config.mediaUrl;
                const mediaType = config.mediaType || 'image';

                let result;

                if (mediaUrl) {
                    result = await sendMediaMessage(phoneId, userToken || systemToken, state.phoneNumber, mediaType, mediaUrl, text);

                    if (!result.success) {
                        const errorStr = JSON.stringify(result.error || '');
                        const isAuthError = errorStr.includes('190') || errorStr.includes('Authentication');

                        if (isAuthError && userToken && systemToken) {
                            result = await sendMediaMessage(phoneId, systemToken, state.phoneNumber, mediaType, mediaUrl, text);
                        }
                    }
                } else {
                    result = await sendTextMessage(phoneId, userToken || systemToken, state.phoneNumber, text);

                    if (!result.success) {
                        const errorStr = JSON.stringify(result.error || '');
                        const isAuthError = errorStr.includes('190') || errorStr.includes('Authentication');

                        if (isAuthError && userToken && systemToken) {
                            result = await sendTextMessage(phoneId, systemToken, state.phoneNumber, text);
                        }
                    }
                }

                if (!result.success) {
                    logger.error(`[Automation] Failed to send message to ${state.phoneNumber}: ${result.error}`);
                    return { success: false, error: result.error };
                }

                if (io) {
                    io.emit('live_event', {
                        type: 'automation_message',
                        from: state.phoneNumber,
                        body: text || `[${mediaType}]`,
                        timestamp: new Date()
                    });
                }

                await Message.create({
                    user_id: user._id,
                    to: state.phoneNumber,
                    direction: 'outgoing',
                    type: mediaUrl ? mediaType : 'text',
                    body: text || `[${mediaType}]`,
                    status: 'sent',
                    meta_message_id: result.data?.messages?.[0]?.id,
                    created_at: new Date()
                });

                user.messages_used += 1;

                if (user.messages_used >= user.message_limit) {
                    user.subscription_status = 'suspended';
                }

                await user.save();

                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }

        case 'condition':
            return { success: true, pause: false };

        case 'templateNode':
            try {
                const { templateName, language = 'en_US', variables = [] } = config;

                // Pricing Calculation
                // Automation templates are typically utility or marketing. Defaulting to utility if not specified.
                const category = config.category || 'utility';
                const meta_cost = calculateMetaCost({ category, isInsideWindow });

                // Global Limit Check
                if (user.messages_used >= user.message_limit) {
                    return { success: false, error: "Message limit exceeded." };
                }

                const userToken = user.access_token;
                const systemToken = process.env.ACCESSTOKEN;
                const phoneId = user.phone_number_id || process.env.PHONE_NUMBER_ID;

                let result = await sendTemplateMessage(
                    phoneId,
                    userToken || systemToken,
                    state.phoneNumber,
                    templateName,
                    language,
                    variables
                );

                if (!result.success && userToken && systemToken) {
                    result = await sendTemplateMessage(phoneId, systemToken, state.phoneNumber, templateName, language, variables);
                }

                if (result.success) {
                    // Log the message and cost
                    await Message.create({
                        user_id: user._id,
                        to: state.phoneNumber,
                        template_name: templateName,
                        template_type: category,
                        direction: 'outgoing',
                        status: 'sent',
                        meta_cost,
                        meta_message_id: result.data?.messages?.[0]?.id,
                        created_at: new Date()
                    });

                    // Update user totals
                    user.messages_used += 1;
                    user.meta_cost_total += meta_cost;

                    if (user.messages_used >= user.message_limit) {
                        user.subscription_status = 'suspended';
                    }

                    await user.save();
                }

                return { success: result.success, error: result.error };
            } catch (e) {
                return { success: false, error: e.message };
            }

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

        case 'notificationNode':
            try {
                await Notification.create({
                    userId: user._id,
                    title: config.title || 'Automation Alert',
                    message: config.message || `Automation "${automation.name}" triggered for ${state.phoneNumber}`,
                    type: config.type || 'info'
                });
                return { success: true };
            } catch (e) {
                return { success: false, error: e.message };
            }

        default:
            return { success: true };
    }
};
