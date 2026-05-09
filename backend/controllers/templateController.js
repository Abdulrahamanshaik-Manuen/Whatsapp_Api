import fs from 'fs';
import Template from '../models/Template.js';
import User from '../models/User.js';
import * as whatsappService from '../services/whatsappService.js';
import * as cloudinaryService from '../services/cloudinaryService.js';

// ── ADMIN CONTROLLERS ────────────────────────────────────────────────────────

export const createTemplate = async (req, res) => {
    try {
        const { name, category, language, content, variables } = req.body;
        
        const template = new Template({
            name,
            category,
            language,
            content,
            variables,
            created_by: req.user.user_id,
            status: 'draft'
        });

        await template.save();
        res.status(201).json({ message: "Template created successfully", template });
    } catch (error) {
        res.status(500).json({ error: "Failed to create template", message: error.message });
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If content changes, reset status to draft/pending
        if (updates.content || updates.category || updates.name) {
            updates.status = 'draft';
        }

        const template = await Template.findByIdAndUpdate(id, updates, { new: true });
        if (!template) return res.status(404).json({ error: "Template not found" });

        res.status(200).json({ message: "Template updated successfully", template });
    } catch (error) {
        res.status(500).json({ error: "Failed to update template", message: error.message });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findByIdAndDelete(id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete template", message: error.message });
    }
};

export const getAdminTemplates = async (req, res) => {
    try {
        const templates = await Template.find().populate('created_by', 'name phone').populate('requested_by', 'name phone');
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch templates", message: error.message });
    }
};

export const submitToMeta = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        // Admin needs their WABA details (assuming admin is a user with these details)
        const admin = await User.findById(req.user.user_id);
        if (!admin.waba_id || !admin.access_token) {
            return res.status(400).json({ error: "Admin WhatsApp credentials missing. Please set up WABA ID and Access Token in profile." });
        }

        const result = await whatsappService.submitTemplateToMeta(admin.waba_id, admin.access_token, {
            name: template.name,
            category: template.category.toUpperCase(),
            language: template.language,
            content: template.content
        });

        if (result.success) {
            template.status = 'pending_meta_approval';
            template.meta_template_id = result.data.id;
            await template.save();
            res.status(200).json({ message: "Template submitted to Meta successfully", meta_id: result.data.id });
        } else {
            res.status(400).json({ error: "Meta submission failed", details: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

// ── CLIENT CONTROLLERS ──────────────────────────────────────────────────

export const getClientTemplates = async (req, res) => {
    try {
        // Clients only see approved templates
        const templates = await Template.find({ status: 'approved' });
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch templates", message: error.message });
    }
};

export const uploadSample = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const appId = process.env.APP_ID || process.env.WHATSAPP_APP_ID;
        const accessToken = process.env.ACCESSTOKEN;

        if (!appId || !accessToken) {
            return res.status(400).json({ error: "System credentials missing for media upload" });
        }

        // 1. Upload to Cloudinary for persistent storage and preview
        const cloudinaryResult = await cloudinaryService.uploadToCloudinary(req.file.path);
        
        if (!cloudinaryResult.success) {
            return res.status(400).json({ error: "Cloudinary upload failed", details: cloudinaryResult.error });
        }

        // 2. Upload to Meta for template approval handle
        const fileBuffer = fs.readFileSync(req.file.path);
        const metaResult = await whatsappService.uploadMediaSampleToMeta(
            appId, 
            accessToken, 
            fileBuffer, 
            req.file.originalname, 
            req.file.mimetype
        );

        // Clean up local file
        fs.unlinkSync(req.file.path);

        if (metaResult.success) {
            res.status(200).json({ 
                handle: metaResult.handle,
                message: "Sample uploaded successfully",
                previewUrl: cloudinaryResult.url
            });
        } else {
            res.status(400).json({ error: "Meta upload failed", details: metaResult.error });
        }
    } catch (error) {
        console.error('Upload Sample Error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const requestCustomTemplate = async (req, res) => {
    try {
        const { name, category, language, content, headerType, headerText, footer, buttons, mediaHandle, directSubmit } = req.body;
        
        // Clean up name (Meta only allows lowercase and underscores)
        const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        // Extract variables from content
        const variableMatches = content.match(/\{\{(\d+)\}\}/g) || [];
        const uniqueVariables = [...new Set(variableMatches)];

        const templateData = {
            name: cleanName,
            category: category.toLowerCase(),
            language: language || 'en_US',
            content,
            variables: uniqueVariables,
            header: headerType !== 'NONE' ? { type: headerType, text: headerText, handle: mediaHandle } : null,
            footer: footer || null,
            buttons: buttons || [],
            created_by: req.user.user_id,
            is_custom_request: true,
            requested_by: req.user.user_id,
            status: 'draft'
        };

        const template = new Template(templateData);

        if (directSubmit) {
            const waba_id = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
            const access_token = process.env.ACCESSTOKEN;

            if (!waba_id || !access_token) {
                return res.status(400).json({ error: "System credentials missing for direct submission." });
            }

            // Construct Meta components
            const components = [
                {
                    type: 'BODY',
                    text: content
                }
            ];

            if (headerType !== 'NONE') {
                const header = {
                    type: 'HEADER',
                    format: headerType,
                };
                if (headerType === 'TEXT') {
                    header.text = headerText;
                } else if (mediaHandle) {
                    header.example = {
                        header_handle: [mediaHandle]
                    };
                }
                components.push(header);
            }

            if (footer) {
                components.push({
                    type: 'FOOTER',
                    text: footer
                });
            }

            if (buttons && buttons.length > 0) {
                components.push({
                    type: 'BUTTONS',
                    buttons: buttons.map(btn => {
                        const b = { type: btn.type, text: btn.text };
                        if (btn.type === 'URL') b.url = btn.url;
                        if (btn.type === 'PHONE_NUMBER') b.phone_number = btn.phone_number;
                        return b;
                    })
                });
            }

            const result = await whatsappService.submitTemplateToMeta(waba_id, access_token, {
                name: cleanName,
                category: category.toUpperCase(),
                language: language || 'en_US',
                components
            });

            if (result.success) {
                template.status = 'pending_meta_approval';
                template.meta_template_id = result.data.id;
            } else {
                return res.status(400).json({ error: "Meta submission failed", details: result.error });
            }
        }

        await template.save();
        
        const message = directSubmit 
            ? "Template submitted to Meta successfully! Approval usually takes 24–48 hours."
            : "Template request sent to Admin for review. Approval usually takes 24–48 hours.";

        res.status(201).json({ message, template });
    } catch (error) {
        console.error('Request Template Error:', error);
        res.status(500).json({ error: "Failed to request template", message: error.message });
    }
};

export const syncTemplateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        if (template.status !== 'pending_meta_approval') {
            return res.status(400).json({ error: "Only pending templates can be synced" });
        }

        const admin = await User.findById(req.user.user_id);
        const result = await whatsappService.getTemplateStatusFromMeta(admin.waba_id, admin.access_token, template.name);

        if (result.success) {
            // Map Meta status to our status
            const metaStatus = result.status.toLowerCase();
            if (metaStatus === 'approved') template.status = 'approved';
            else if (metaStatus === 'rejected') template.status = 'rejected';
            
            await template.save();
            res.status(200).json({ message: `Template status synced: ${template.status}`, status: template.status });
        } else {
            res.status(400).json({ error: "Sync failed", details: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

export const syncAllTemplatesFromMeta = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id);
        const waba_id = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || user?.waba_id;
        const access_token = process.env.ACCESSTOKEN || user?.access_token;

        const result = await whatsappService.getAllTemplatesFromMeta(waba_id, access_token);

        if (result.success) {
            const metaTemplates = result.data;
            const syncedTemplates = [];

            for (const mt of metaTemplates) {
                if (!mt.name || !mt.category) continue;
                
                const status = mt.status?.toLowerCase() || 'pending_meta_approval';
                
                // Extract Components (Case-insensitive check)
                const bodyComponent = mt.components?.find(c => c.type?.toUpperCase() === 'BODY');
                const footerComponent = mt.components?.find(c => c.type?.toUpperCase() === 'FOOTER');
                const buttonComponent = mt.components?.find(c => c.type?.toUpperCase() === 'BUTTONS');

                // Try to find a header component OR any component with a media format
                const headerComponent = mt.components?.find(c => c.type?.toUpperCase() === 'HEADER') || 
                                      mt.components?.find(c => ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format?.toUpperCase()));

                const contentText = bodyComponent?.text || 'No content available';
                
                // Extract Header Details
                let header = null;
                const activeHeader = headerComponent || mt.header;

                if (activeHeader) {
                    const format = activeHeader.format || activeHeader.type;
                    // Extract media info from various possible Meta structures
                    let mediaUrl = activeHeader.example?.header_url?.[0] || activeHeader.example?.url?.[0] || activeHeader.header_url || null;
                    
                    // If no URL but has a handle, check if it's already a URL
                    const handle = activeHeader.example?.header_handle?.[0] || 
                                 activeHeader.example?.file_handle?.[0] || 
                                 activeHeader.example?.video_handle?.[0] ||
                                 activeHeader.example?.handle?.[0] ||
                                 activeHeader.mediaHandle; // Support direct mediaHandle string
                    
                    if (!mediaUrl && handle) {
                        if (handle.startsWith('http')) {
                            mediaUrl = handle;
                        } else {
                            mediaUrl = await whatsappService.getMediaUrl(handle, access_token);
                        }
                    }

                    header = {
                        type: format?.toUpperCase() || 'TEXT',
                        text: activeHeader.text || null,
                        media_url: mediaUrl
                    };
                }

                // Extract Footer
                const footer = footerComponent?.text || null;

                // Extract Buttons
                const buttons = buttonComponent?.buttons?.map(b => ({
                    type: b.type,
                    text: b.text,
                    url: b.url,
                    phone_number: b.phone_number
                })) || [];

                const template = await Template.findOneAndUpdate(
                    { name: mt.name },
                    {
                        status: status === 'approved' ? 'approved' : (status === 'rejected' ? 'rejected' : 'pending_meta_approval'),
                        category: mt.category.toLowerCase(),
                        language: mt.language || 'en_US',
                        content: contentText,
                        header,
                        footer,
                        buttons,
                        meta_template_id: mt.id,
                        created_by: req.user.user_id
                    },
                    { upsert: true, returnDocument: 'after' }
                );
                syncedTemplates.push(template);
            }

            return res.status(200).json({ 
                message: `Successfully synced ${syncedTemplates.length} templates.`,
                count: syncedTemplates.length,
                sync_version: "1.2"
            });
        } else {
            console.error('Sync failed. Meta Error:', result.error);
            return res.status(400).json({ error: result.error });
        }
    } catch (error) {
        console.error('Template Sync Exception:', error);
        res.status(500).json({ error: "Internal server error during synchronization." });
    }
};
