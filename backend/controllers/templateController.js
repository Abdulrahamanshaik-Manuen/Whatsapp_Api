import Template from '../models/Template.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Upload media to Meta to get a handle
export const uploadMediaToMeta = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const token = process.env.ACCESSTOKEN;
        const appId = process.env.APP_ID;

        if (!token || !appId) {
            return res.status(400).json({ error: "Missing ACCESSTOKEN or APP_ID in .env" });
        }

        const fileBuffer = req.file.buffer;
        const fileSize = fileBuffer.length;
        const fileType = req.file.mimetype;

        // 1. Start session
        console.log("Starting Meta media session...");
        const sessionRes = await axios.post(
            `https://graph.facebook.com/v20.0/${appId}/uploads`,
            null,
            {
                params: {
                    file_length: fileSize,
                    file_type: fileType,
                    access_token: token
                }
            }
        );

        const uploadSessionId = sessionRes.data.id;

        // 2. Upload file content
        console.log("Uploading file content to Meta...");
        const uploadRes = await axios.post(
            `https://graph.facebook.com/v20.0/${uploadSessionId}`,
            fileBuffer,
            {
                headers: {
                    "Authorization": `OAuth ${token}`,
                    "file_type": fileType
                }
            }
        );

        res.status(200).json({ 
            handle: uploadRes.data.h,
            message: "Media uploaded to Meta successfully"
        });

    } catch (error) {
        console.error("Meta Media Upload Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to upload media to Meta", details: error.response?.data || error.message });
    }
};

export const createTemplate = async (req, res) => {
    try {
        const { name, category, language, components } = req.body;
        const newTemplate = new Template({ name, category, language, components });
        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (err) {
        console.error("Create Template Error:", err);
        res.status(500).json({ error: "Failed to create template" });
    }
};

export const getAllTemplate = async (req, res) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch templates" });
    }
};

export const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.status(200).json(template);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch template" });
    }
};

export const editTemplate = async (req, res) => {
    try {
        const updated = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update template" });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await Template.findByIdAndDelete(id);
        res.status(200).json({ message: "Template deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete template" });
    }
};

export const submitTemplateToMeta = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        const token = process.env.ACCESSTOKEN;
        const phoneId = process.env.PHONE_NUMBER_ID;
        let wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WABA_ID;

        if (!token) return res.status(400).json({ error: "Missing ACCESSTOKEN in .env" });
        if (!phoneId && !wabaId) return res.status(400).json({ error: "Missing PHONE_NUMBER_ID or WABA_ID in .env" });

        if (!wabaId) {
            try {
                const phoneRes = await axios.get(
                    `https://graph.facebook.com/v20.0/${phoneId}?fields=whatsapp_business_account`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                );
                wabaId = phoneRes.data.whatsapp_business_account?.id;
            } catch (err) {
                return res.status(400).json({ error: "Failed to fetch WABA ID automatically." });
            }
        }

        if (!template.category) return res.status(400).json({ error: "Template category is missing." });
        const metaCategory = template.category.toUpperCase(); 

        const metaComponents = template.components.map(comp => {
            if (comp.type === 'HEADER' && comp.format === 'TEXT') {
                return { type: 'HEADER', format: 'TEXT', text: comp.text || "Header" };
            }
            if (comp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)) {
                return { type: 'HEADER', format: comp.format, example: { header_handle: [comp.mediaHandle || ""] } };
            }
            if (comp.type === 'BODY') return { type: 'BODY', text: comp.text };
            if (comp.type === 'FOOTER') return { type: 'FOOTER', text: comp.text };
            if (comp.type === 'BUTTONS') {
                return {
                    type: 'BUTTONS',
                    buttons: comp.buttons.map(btn => {
                        const base = {
                            type: btn.type === 'PHONE_NUMBER' ? 'PHONE_NUMBER' : 'URL',
                            text: btn.text
                        };
                        if (btn.type === 'PHONE_NUMBER') {
                            let cleanPhone = btn.phoneNumber.replace(/[^\d+]/g, '');
                            if (!cleanPhone.startsWith('+')) cleanPhone = `+${cleanPhone}`;
                            base.phone_number = cleanPhone;
                        } else {
                            base.url = btn.url;
                        }
                        return base;
                    })
                };
            }
            return comp;
        });

        const sanitizedName = template.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const metaPayload = {
            name: sanitizedName,
            category: metaCategory,
            language: template.language === 'English' ? 'en_US' : 'en_US',
            components: metaComponents
        };

        const submitRes = await axios.post(
            `https://graph.facebook.com/v20.0/${wabaId}/message_templates`,
            metaPayload,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        template.status = 'PENDING';
        await template.save();

        res.status(200).json({ message: "Template submitted to Meta successfully", data: submitRes.data });

    } catch (error) {
        console.error("Meta Submission Error Detail:", JSON.stringify(error.response?.data || error.message, null, 2));
        const metaError = error.response?.data?.error || {};
        res.status(500).json({ 
            error: "Meta Submission Failed", 
            message: metaError.message || error.message,
            details: metaError
        });
    }
};

export const syncMetaStatuses = async (req, res) => {
    try {
        const token = process.env.ACCESSTOKEN;
        const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WABA_ID;

        if (!token || !wabaId) return res.status(400).json({ error: "Missing Token or WABA ID" });

        const metaRes = await axios.get(
            `https://graph.facebook.com/v20.0/${wabaId}/message_templates`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );

        const metaTemplates = metaRes.data.data;
        const metaNames = metaTemplates.map(t => t.name);

        for (const metaT of metaTemplates) {
            await Template.findOneAndUpdate(
                { name: metaT.name }, 
                { status: metaT.status, category: metaT.category, language: metaT.language },
                { upsert: true }
            );
        }

        // Delete EVERY local template that is NOT in the Meta list
        await Template.deleteMany({
            name: { $nin: metaNames }
        });

        res.status(200).json({ message: "Statuses synced and cleaned successfully" });
    } catch (error) {
        res.status(500).json({ error: "Meta Sync Failed" });
    }
};

export const sendTemplateById = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };
