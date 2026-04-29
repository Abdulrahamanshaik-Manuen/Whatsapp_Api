import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const uploadMediaToMeta = async (file, token, phoneId) => {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
    });
    formData.append('type', file.mimetype);
    formData.append('messaging_product', 'whatsapp');

    const res = await axios.post(
        `https://graph.facebook.com/v20.0/${phoneId}/media`,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        }
    );
    return res.data.id;
};

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
        const files = req.files || [];
        const token = process.env.ACCESSTOKEN;
        const phoneId = process.env.PHONE_NUMBER_ID;
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

        const results = [];

        // 1. Handle Text Message
        if (text && text.trim()) {
            const textMsg = new Message({
                messageId: 'pending_text_' + Date.now(),
                contactId,
                type: 'out',
                text,
                status: 'sent',
                timestamp: Date.now()
            });
            await textMsg.save();

            if (token && phoneId) {
                const metaRes = await axios.post(
                    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
                    {
                        messaging_product: "whatsapp",
                        to: cleanPhoneNumber,
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
                if (metaRes.data?.messages?.[0]) {
                    textMsg.messageId = metaRes.data.messages[0].id;
                    await textMsg.save();
                }
            }
            results.push(textMsg);
        }

        // 2. Handle Media Files
        for (const file of files) {
            const mediaType = file.mimetype.split('/')[0]; // image, video, audio, application (document)
            const waType = ['image', 'video', 'audio', 'document'].includes(mediaType) ? mediaType : 'document';

            const mediaMsg = new Message({
                messageId: 'pending_media_' + Date.now(),
                contactId,
                type: 'out',
                text: waType === 'document' ? file.originalname : '',
                status: 'sent',
                timestamp: Date.now(),
                attachments: [{
                    type: waType,
                    name: file.originalname,
                    size: (file.size / 1024).toFixed(1) + ' KB'
                }]
            });
            await mediaMsg.save();

            if (token && phoneId) {
                try {
                    const mediaId = await uploadMediaToMeta(file, token, phoneId);
                    const mediaPayload = {
                        messaging_product: "whatsapp",
                        to: cleanPhoneNumber,
                        type: waType,
                        [waType]: { id: mediaId }
                    };
                    
                    // Add filename for documents
                    if (waType === 'document') {
                        mediaPayload.document.filename = file.originalname;
                    }

                    const metaRes = await axios.post(
                        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
                        mediaPayload,
                        {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    if (metaRes.data?.messages?.[0]) {
                        mediaMsg.messageId = metaRes.data.messages[0].id;
                        await mediaMsg.save();
                    }
                } catch (mediaErr) {
                    console.error("Error sending media:", mediaErr.response?.data || mediaErr.message);
                    mediaMsg.status = 'failed';
                    await mediaMsg.save();
                }
            }
            results.push(mediaMsg);

            // Clean up local file
            fs.unlink(file.path, (err) => { if (err) console.error("Error deleting local file:", err); });
        }

        // Update contact last message
        await Contact.findByIdAndUpdate(contactId, { lastMessageAt: Date.now() });

        res.status(200).json(results.length === 1 ? results[0] : results);
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("Error sending message:", errorData);
        
        const errorMessage = errorData.error?.message || "Failed to send message";
        res.status(error.response?.status || 500).json({ 
            error: errorMessage,
            details: errorData
        });
    }
};
