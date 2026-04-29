import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import axios from 'axios';

export const getMessages = async (req, res) => {
    try {
        const { contactId } = req.params;
        const messages = await Message.find({ contactId }).sort({ timestamp: 1 });

        // Reset unread count
        await Contact.findByIdAndUpdate(contactId, { unreadCount: 0 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { contactId, text, phoneNumber } = req.body;

        // Save pending message to DB
        const newMessage = new Message({
            messageId: 'pending_' + Date.now(),
            contactId,
            type: 'out',
            text,
            status: 'sent',
            timestamp: Date.now()
        });
        await newMessage.save();

        // Send to Meta API
        const token = process.env.ACCESSTOKEN;
        const phoneId = process.env.PHONENUMBERID;

        if (token && phoneId) {
            const metaRes = await axios.post(
                `https://graph.facebook.com/v20.0/${phoneId}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: phoneNumber,
                    type: "text",
                    text: { body: text }
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            // Update real message ID
            if (metaRes.data && metaRes.data.messages && metaRes.data.messages[0]) {
                newMessage.messageId = metaRes.data.messages[0].id;
                await newMessage.save();
            }
        } else {
            console.warn("WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set in .env. Simulating send.");
        }

        // Update contact last message
        await Contact.findByIdAndUpdate(contactId, { lastMessageAt: Date.now() });

        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to send message" });
    }
};
