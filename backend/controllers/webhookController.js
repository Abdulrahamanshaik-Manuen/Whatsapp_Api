import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import crypto from 'crypto';

// Verify Webhook from Meta
export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WEBHOKVERIFYTOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

// Handle incoming messages from Meta
export const handleWebhook = async (req, res) => {
    // Verify Webhook Signature
    const signature = req.headers['x-hub-signature-256'];
    const appSecret = process.env.APP_SECRET;

    if (signature && appSecret && req.rawBody) {
        const hmac = crypto.createHmac('sha256', appSecret);
        hmac.update(req.rawBody);
        const expectedSignature = 'sha256=' + hmac.digest('hex');

        if (signature !== expectedSignature) {
            console.error("Webhook signature mismatch!");
            return res.sendStatus(403);
        }
    } else if (!signature && appSecret) {
        console.warn("No Webhook signature provided!");
    }

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            for (const entry of body.entry) {
                const changes = entry.changes[0];
                const value = changes.value;

                if (value.messages && value.messages[0]) {
                    const msg = value.messages[0];
                    const contactInfo = value.contacts && value.contacts[0] ? value.contacts[0] : { profile: { name: 'Unknown' } };

                    const phone = msg.from;
                    const name = contactInfo.profile.name;
                    const msgText = msg.type === 'text' ? msg.text.body : (msg.type === 'image' ? 'Image received' : 'Media received');

                    // 1. Find or create contact
                    let contact = await Contact.findOne({ phoneNumber: phone });
                    if (!contact) {
                        contact = new Contact({
                            phoneNumber: phone,
                            name: name,
                            status: 'online',
                            unreadCount: 1,
                            details: {
                                location: 'Unknown',
                                joined: new Date().toLocaleDateString(),
                                tags: ['New Lead']
                            }
                        });
                    } else {
                        contact.unreadCount += 1;
                        contact.lastMessageAt = Date.now();
                        contact.status = 'online';
                    }
                    await contact.save();

                    // 2. Save Message
                    const newMessage = new Message({
                        messageId: msg.id,
                        contactId: contact._id,
                        type: 'in',
                        text: msgText,
                        status: 'received',
                        timestamp: msg.timestamp ? new Date(msg.timestamp * 1000) : Date.now()
                    });
                    await newMessage.save();

                    // 3. Emit via socket to frontend
                    if (req.io) {
                        req.io.emit('new_message', { contact, message: newMessage });
                    }
                }

                // Handle message status updates (sent, delivered, read)
                if (value.statuses && value.statuses[0]) {
                    const status = value.statuses[0];
                    await Message.findOneAndUpdate(
                        { messageId: status.id },
                        { status: status.status }
                    );

                    if (req.io) {
                        req.io.emit('message_status', {
                            messageId: status.id,
                            status: status.status,
                            recipientId: status.recipient_id
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Webhook processing error:", error);
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
};
