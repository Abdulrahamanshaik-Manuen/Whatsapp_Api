import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import { processAutomation } from '../services/automationService.js';

export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WEBHOOKVERIFYTOKEN || 'my_secret_token_2026';

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

export const handleWebhookEvent = async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            // Handle Status Updates (sent, delivered, read, failed)
            if (value?.statuses) {
                const statusUpdate = value.statuses[0];
                const meta_message_id = statusUpdate.id;
                const status = statusUpdate.status;

                const message = await Message.findOne({ meta_message_id });
                console.log(`[Webhook] Status Update: ${status} for ID ${meta_message_id} (${message ? 'Campaign: ' + message.campaign_id : 'Direct Message'})`);
                
                if (status === 'failed') {
                    console.error(`[Webhook] ❌ Delivery Failed! Reason:`, JSON.stringify(statusUpdate.errors || 'Unknown Meta Error', null, 2));
                }

                if (message) {
                    message.status = status;
                    await message.save();

                    // Update Campaign analytics if linked
                    if (message.campaign_id) {
                        const incField = `${status}_count`;
                        const update = { $inc: { [incField]: 1 } };

                        await Campaign.findByIdAndUpdate(message.campaign_id, update);
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
                    // Check for Opt-Out Keywords (e.g., STOP, UNSUBSCRIBE)
                    const upperText = bodyText.trim().toUpperCase();
                    if (['STOP', 'UNSUBSCRIBE', 'OPT OUT'].includes(upperText)) {
                        await Contact.findOneAndUpdate(
                            { phoneNumber: from, userId: user._id },
                            { consent: false, consent_timestamp: new Date() }
                        );
                        console.log(`User ${from} opted out. Consent revoked.`);
                    }

                    await Message.create({
                        user_id: user._id,
                        to: from,
                        direction: 'incoming',
                        type: type,
                        body: bodyText,
                        status: 'delivered',
                        meta_message_id
                    });
                    console.log(`Saved incoming message/button from ${from}: ${bodyText}`);

                    // Trigger Automation Engine
                    processAutomation(user._id, from, bodyText);
                }
            }

            // Handle Template Status Updates (Approved/Rejected by Meta)
            if (changes?.field === 'message_template_status_update') {
                const { event, message_template_id, message_template_name, reason } = value;
                const status = event.toLowerCase();

                if (['approved', 'rejected'].includes(status)) {
                    await Template.findOneAndUpdate(
                        { name: message_template_name },
                        {
                            status: status,
                            meta_template_id: message_template_id,
                            meta_rejection_reason: reason || null
                        }
                    );
                    console.log(`Template "${message_template_name}" status updated to: ${status}`);
                }
            }

            res.status(200).send('EVENT_RECEIVED');
        } catch (err) {
            console.error('Error processing webhook:', err.message);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
};
