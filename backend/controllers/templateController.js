import Template from '../models/Template.js';
import axios from 'axios';

export const createTemplate = async (req, res) => {
    try {
        console.log("Received template data:", JSON.stringify(req.body, null, 2));
        const template = new Template(req.body);
        await template.save();
        console.log("Template saved successfully");
        res.status(201).json(template);
    } catch (error) {
        console.error("Detailed Error creating template:", error);
        res.status(500).json({ 
            error: "Internal Server Error", 
            message: error.message,
            stack: error.stack
        });
    }
};

export const uploadMediaToMeta = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const token = process.env.ACCESSTOKEN;
        const appId = process.env.APP_ID;
        const file = req.file;

        // 1. Start Upload Session with Meta
        const sessionRes = await axios.post(
            `https://graph.facebook.com/v20.0/${appId}/uploads`,
            null,
            {
                params: {
                    file_length: file.size,
                    file_type: file.mimetype,
                    access_token: token
                }
            }
        );

        const uploadSessionId = sessionRes.data.id;

        // 2. Upload the file content
        const uploadRes = await axios.post(
            `https://graph.facebook.com/v20.0/${uploadSessionId}`,
            file.buffer,
            {
                headers: {
                    "Authorization": `OAuth ${token}`,
                    "file_offset": 0,
                    "Content-Type": "application/octet-stream"
                }
            }
        );

        res.status(200).json({ 
            handle: uploadRes.data.h,
            message: "Media uploaded to Meta successfully" 
        });
    } catch (error) {
        console.error("Meta Media Upload Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Failed to upload media to Meta", 
            message: error.response?.data?.error?.message || error.message 
        });
    }
};

export const submitTemplateToMeta = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        const token = process.env.ACCESSTOKEN;
        const phoneId = process.env.PHONE_NUMBER_ID;

        // 1. Try to get WABA ID from env or fetch it using Phone ID
        let wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WABA_ID;
        if (!wabaId) {
            console.log("WABA_ID not found in env, attempting to fetch using Phone ID...");
            const phoneRes = await axios.get(
                `https://graph.facebook.com/v20.0/${phoneId}?fields=whatsapp_business_account`,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            wabaId = phoneRes.data.whatsapp_business_account?.id;
            if (!wabaId) throw new Error("Could not retrieve WhatsApp Business Account ID automatically.");
            console.log("Successfully retrieved WABA ID:", wabaId);
        }

        // 2. Format components for Meta API
        const metaComponents = template.components.map(comp => {
            if (comp.type === 'HEADER' && comp.format === 'TEXT') {
                return { type: 'HEADER', format: 'TEXT', text: comp.text || "Header" };
            }
            if (comp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)) {
                return { type: 'HEADER', format: comp.format, example: { header_handle: [comp.mediaHandle || ""] } };
            }
            if (comp.type === 'BODY') {
                return { type: 'BODY', text: comp.text };
            }
            if (comp.type === 'FOOTER') {
                return { type: 'FOOTER', text: comp.text };
            }
            if (comp.type === 'BUTTONS') {
                return {
                    type: 'BUTTONS',
                    buttons: comp.buttons.map(btn => {
                        const base = {
                            type: btn.type === 'CALL' ? 'PHONE_NUMBER' : btn.type === 'REPLY' ? 'QUICK_REPLY' : btn.type,
                            text: btn.text
                        };
                        if (base.type === 'URL') {
                            base.url = btn.url.startsWith('http') ? btn.url : `https://${btn.url}`;
                        }
                        if (base.type === 'PHONE_NUMBER') {
                            // Ensure phone number starts with + and has no non-numeric chars except +
                            let cleanPhone = btn.phoneNumber.replace(/[^\d+]/g, '');
                            if (!cleanPhone.startsWith('+')) cleanPhone = `+${cleanPhone}`;
                            base.phone_number = cleanPhone;
                        }
                        return base;
                    })
                };
            }
            return comp;
        });

        // 3. Submit to Meta
        const metaPayload = {
            name: template.name,
            category: template.category.toUpperCase(),
            language: template.language === 'English' ? 'en_US' : 'en_US',
            components: metaComponents
        };

        console.log("Submitting to Meta with payload:", JSON.stringify(metaPayload, null, 2));

        const submitRes = await axios.post(
            `https://graph.facebook.com/v20.0/${wabaId}/message_templates`,
            metaPayload,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        template.status = 'Pending Approval';
        await template.save();

        res.status(200).json({ 
            message: "Template submitted to Meta successfully", 
            metaResponse: submitRes.data 
        });
    } catch (error) {
        const metaError = error.response?.data?.error || {};
        console.error("Meta Submission Error Detail:", JSON.stringify(metaError, null, 2));
        res.status(500).json({ 
            error: "Meta API Error", 
            message: metaError.message || error.message,
            details: metaError
        });
    }
};

export const getAllTemplate = async (req, res) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const editTemplate = async (req, res) => {
    try {
        const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findByIdAndDelete(req.params.id);
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const syncMetaStatuses = async (req, res) => {
    try {
        const token = process.env.ACCESSTOKEN;
        const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WABA_ID;

        if (!wabaId) throw new Error("WABA ID not found");

        // 1. Fetch all templates from Meta
        const metaRes = await axios.get(
            `https://graph.facebook.com/v20.0/${wabaId}/message_templates`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        const metaTemplates = metaRes.data.data; // Array of templates from Meta

        // 2. Update local templates
        let updateCount = 0;
        for (const metaT of metaTemplates) {
            const result = await Template.findOneAndUpdate(
                { name: metaT.name },
                { status: metaT.status },
                { new: true }
            );
            if (result) updateCount++;
        }

        res.status(200).json({ 
            message: "Statuses synced successfully", 
            syncedCount: updateCount,
            totalFromMeta: metaTemplates.length
        });
    } catch (error) {
        console.error("Meta Sync Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to sync with Meta", details: error.response?.data || error.message });
    }
};

export const sendTemplate = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };
export const sendTemplateById = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };
