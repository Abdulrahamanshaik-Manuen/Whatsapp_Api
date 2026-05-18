import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import Notification from '../models/Notification.js';
import { processAutomation } from '../services/automationService.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';
import SystemLog from '../models/SystemLog.js';

export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WEBHOOKVERIFYTOKEN || 'my_secret_token_2026';

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

export const handleWebhookEvent = async (req, res) => {
    // 1. Verify X-Hub-Signature-256
    const signature = req.headers['x-hub-signature-256'];
    if (signature && process.env.APP_SECRET) {
        const expectedSignature = 'sha256=' + crypto.createHmac('sha256', process.env.APP_SECRET).update(req.rawBody).digest('hex');
        if (signature !== expectedSignature) {
            logger.error('Invalid Webhook Signature');
            
            // Log security event
            await SystemLog.create({
                level: 'warn',
                message: 'Invalid Webhook Signature detected',
                source: 'webhook_security'
            });
            
            return res.sendStatus(403);
        }
    }

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            // Handle Status Updates (sent, delivered, read, failed)
            if (value?.statuses) {
                const statusUpdates = value.statuses || [];
                for (const statusUpdate of statusUpdates) {
                    const { status, id: meta_message_id, recipient_id } = statusUpdate;

                    // CATCH-ALL LOG: See everything Meta sends
                    // console.log(`[Webhook] Incoming Status: "${status}" for Meta ID: ${meta_message_id} to ${recipient_id}`);

                    const message = await Message.findOne({ meta_message_id });

                    // Capture Pricing Info if provided by Meta
                    if (statusUpdate.pricing) {
                        const { billable, category, pricing_model } = statusUpdate.pricing;
                        if (message) {
                            message.pricing = { billable, category, pricing_model };
                            // console.log(`[Webhook] Pricing Info for ${meta_message_id}: ${category} (${billable ? 'Billable' : 'Free'})`);
                        }
                    }

                    // console.log(`[Webhook] Status Update: ${status} for ID ${meta_message_id} (${message ? 'Campaign: ' + message.campaign_id : 'Direct Message'})`);

                    if (status === 'failed') {
                    }

                    // Only update if the status has actually changed to avoid double-counting
                    if (message && message.status !== status) {
                        const oldStatus = message.status;
                        message.status = status;
                        await message.save();

                        // Emit status update to the user
                        req.io.to(message.user_id.toString()).emit('message_status_update', {
                            meta_message_id,
                            status,
                            contactId: message.to
                        });

                        // Update Campaign analytics if linked
                        if (message.campaign_id) {
                            const incField = `${status}_count`;

                            // Security check: ensure the field exists in our Campaign model
                            const campaign = await Campaign.findById(message.campaign_id);
                            if (campaign && campaign[incField] !== undefined) {
                                await Campaign.findByIdAndUpdate(message.campaign_id, {
                                    $inc: { [incField]: 1 }
                                });
                                // Emit campaign progress update
                                req.io.to(message.user_id.toString()).emit('campaign_progress', {
                                    campaignId: message.campaign_id,
                                    status,
                                    recipient: recipient_id
                                });
                            }
                        }
                    }
                }
            }

            // Handle Incoming Messages (2-way chat)
            if (value?.messages) {
                const incoming = value.messages[0];
                const from = incoming.from;
                const meta_message_id = incoming.id;
                const type = incoming.type;
                let bodyText = incoming.text?.body || '';

                // Handle Button Clicks (Quick Replies)
                if (type === 'button') {
                    bodyText = incoming.button?.text || '';
                } else if (type === 'interactive') {
                    bodyText = incoming.interactive?.button_reply?.title || incoming.interactive?.list_reply?.title || '';
                }

                // Identify which user this belongs to
                const phone_number_id = value.metadata?.phone_number_id;
                const user = await User.findOne({ phone_number_id });

                if (user) {
                    const now = new Date();
                    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    const cleanFrom = from.replace(/\D/g, '');

                    // Update/Create Contact and Reset 24-hour window
                    const contact = await Contact.findOneAndUpdate(
                        { phoneNumber: cleanFrom, userId: user._id },
                        {
                            last_customer_message_at: now,
                            window_expires_at: expiresAt,
                            customer_service_window_active: true,
                            phoneNumber: cleanFrom,
                            userId: user._id
                        },
                        { upsert: true, returnDocument: 'after' }
                    );

                    // Check for Opt-Out Keywords (e.g., STOP, UNSUBSCRIBE)
                    const upperText = bodyText.trim().toUpperCase();
                    if (['STOP', 'UNSUBSCRIBE', 'OPT OUT'].includes(upperText)) {
                        await Contact.findOneAndUpdate(
                            { phoneNumber: cleanFrom, userId: user._id },
                            { consent: false, consent_timestamp: now, customer_service_window_active: false },
                            { returnDocument: 'after' }
                        );
                    }

                    // Idempotency check: Don't save if we already have this message
                    const existingMsg = await Message.findOne({ meta_message_id });
                    if (!existingMsg) {
                        const savedMsg = await Message.create({
                            user_id: user._id,
                            to: cleanFrom,
                            direction: 'incoming',
                            type: type,
                            body: bodyText,
                            status: 'delivered',
                            meta_message_id
                        });
                        logger.info(`Incoming from ${cleanFrom}: ${bodyText}`);

                        // Emit new message to user
                        req.io.to(user._id.toString()).emit('new_message', {
                            message: savedMsg,
                            contact: contact
                        });

                        // Also emit to admin if needed (optional)
                        req.io.to('admin_room').emit('admin_stats_update', { type: 'new_message' });
                    }

                    // Trigger Automation Engine
                    processAutomation(user._id, cleanFrom, bodyText);
                }
            }

            // Handle Template Status Updates (Approved/Rejected by Meta)
            if (changes?.field === 'message_template_status_update') {
                const { event, message_template_id, message_template_name, reason } = value;
                const status = event.toLowerCase();

                // Handle all status updates (approved, rejected, flagged, disabled, etc.)
                const updatedTemplate = await Template.findOneAndUpdate(
                    { name: message_template_name },
                    {
                        status: status,
                        meta_template_id: message_template_id,
                        meta_rejection_reason: reason || null
                    },
                    { returnDocument: 'after' }
                );

                if (updatedTemplate) {
                    const notification = await Notification.create({
                        userId: updatedTemplate.user_id,
                        title: `Template ${status.toUpperCase()}`,
                        message: `Your template "${message_template_name}" status has changed to: ${status}.${reason ? ' Reason: ' + reason : ''}`,
                        type: status === 'approved' ? 'success' : (status === 'rejected' || status === 'disabled' ? 'error' : 'warning')
                    });

                    // Emit template update and notification
                    req.io.to(updatedTemplate.user_id.toString()).emit('template_status_update', {
                        templateId: updatedTemplate._id,
                        status: status,
                        name: message_template_name
                    });
                    req.io.to(updatedTemplate.user_id.toString()).emit('new_notification', notification);
                }
            }

            res.status(200).send('EVENT_RECEIVED');
        } catch (err) {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
};
