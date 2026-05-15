import fs from 'fs';
import axios from 'axios';
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
};export const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

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
export const updateTemplateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, meta_rejection_reason } = req.body;

        const template = await Template.findByIdAndUpdate(
            id, 
            { status, meta_rejection_reason }, 
            { new: true }
        );

        if (!template) return res.status(404).json({ error: "Template not found" });

        res.status(200).json({ message: `Template status updated to ${status}`, template });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status", message: error.message });
    }
};

export const getAdminTemplates = async (req, res) => {
    try {
        const templates = await Template.find()
            .populate('created_by', 'name phone waba_id phone_number_id')
            .populate('requested_by', 'name phone waba_id phone_number_id')
            .sort({ _id: -1 });
        
        // Calculate stats
        const stats = {
            total: templates.length,
            pending: templates.filter(t => t.status.includes('pending')).length,
            approved: templates.filter(t => t.status === 'approved').length,
            rejected: templates.filter(t => t.status === 'rejected').length,
            disabled: templates.filter(t => t.status === 'disabled').length
        };

        // Map to flat structure expected by the frontend
        const mappedTemplates = templates.map(t => ({
            id: t._id,
            name: t.name,
            client: t.requested_by?.name || t.created_by?.name || 'Platform Admin',
            category: t.category,
            status: t.status,
            wabaId: t.requested_by?.waba_id || t.created_by?.waba_id || 'System',
            phoneId: t.requested_by?.phone_number_id || t.created_by?.phone_number_id || 'System',
            metaId: t.meta_template_id || '',
            content: t.content,
            header: t.header,
            footer: t.footer,
            buttons: t.buttons
        }));

        res.status(200).json({ templates: mappedTemplates, stats });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch templates", message: error.message });
    }
};

export const submitToMeta = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await Template.findById(id);
        if (!template) return res.status(404).json({ error: "Template not found" });

        // Client-Centric: Use the owner's credentials, not the admin's
        const ownerId = template.requested_by || template.created_by;
        const owner = await User.findById(ownerId);

        if (!owner || !owner.waba_id || !owner.access_token) {
            return res.status(400).json({
                error: "Client credentials missing",
                message: `The client (${owner?.name || 'Unknown'}) has not set up their WABA ID or Access Token.`
            });
        }

        let finalMediaHandle = template.header?.handle;
        const appId = process.env.APP_ID || process.env.WHATSAPP_APP_ID;
        const access_token = owner.access_token;

        // Deferred Meta Upload: If we have a preview but no Meta handle yet
        if (!finalMediaHandle && template.header?.media_url && template.header?.type !== 'TEXT') {
            try {
                const response = await axios.get(template.header.media_url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                const fileName = `sample_${Date.now()}`;
                const fileType = template.header.type === 'IMAGE' ? 'image/jpeg' : template.header.type === 'VIDEO' ? 'video/mp4' : 'application/pdf';

                const metaResult = await whatsappService.uploadMediaSampleToMeta(appId, access_token, buffer, fileName, fileType);
                if (metaResult.success) {
                    finalMediaHandle = metaResult.handle;
                    // Update template with the handle for future use
                    template.header.handle = finalMediaHandle;
                }
            } catch (err) {
                console.error('Deferred Meta Upload Error during admin approval:', err.message);
            }
        }

        // Construct Meta components
        const components = [
            {
                type: 'BODY',
                text: template.content
            }
        ];

        if (template.header) {
            const header = {
                type: 'HEADER',
                format: template.header.type,
            };
            if (template.header.type === 'TEXT') {
                header.text = template.header.text;
            } else if (finalMediaHandle) {
                header.example = {
                    header_handle: [finalMediaHandle]
                };
            }
            components.push(header);
        }

        if (template.footer) {
            components.push({ type: 'FOOTER', text: template.footer });
        }

        if (template.buttons && template.buttons.length > 0) {
            components.push({
                type: 'BUTTONS',
                buttons: template.buttons.map(btn => {
                    const b = { type: btn.type, text: btn.text };
                    if (btn.type === 'URL') b.url = btn.url;
                    if (btn.type === 'PHONE_NUMBER') b.phone_number = btn.phone_number;
                    return b;
                })
            });
        }

        const result = await whatsappService.submitTemplateToMeta(owner.waba_id, owner.access_token, {
            name: template.name,
            category: template.category.toUpperCase(),
            language: template.language,
            components
        });

        if (result.success) {
            template.status = 'pending_meta_approval';
            template.meta_template_id = result.data.id;
            await template.save();
            res.status(200).json({ message: "Template submitted to Meta using client credentials", meta_id: result.data.id });
        } else {
            res.status(400).json({ error: "Meta submission failed", details: result.error });
        }
    } catch (error) {
        console.error('Submit to Meta Error:', error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

// ── CLIENT CONTROLLERS ──────────────────────────────────────────────────

export const getClientTemplates = async (req, res) => {
    try {
        // Clients see all approved templates + any template they created themselves (even if pending)
        const templates = await Template.find({
            $or: [
                { status: 'approved' },
                { created_by: req.user.user_id },
                { requested_by: req.user.user_id }
            ]
        }).sort({ createdAt: -1, _id: -1 });
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

        // Clean up local file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (cloudinaryResult.success) {
            res.status(200).json({
                message: "Media uploaded for preview",
                previewUrl: cloudinaryResult.url
            });
        } else {
            res.status(400).json({ error: "Cloudinary upload failed", details: cloudinaryResult.error });
        }
    } catch (error) {
        console.error('Upload Sample Error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const requestCustomTemplate = async (req, res) => {
    try {
        const { name, category, language, content, headerType, headerText, footer, buttons, mediaHandle, previewUrl, directSubmit } = req.body;

        // Clean up name (Meta only allows lowercase and underscores)
        const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        // Extract variables from content
        const variableMatches = content.match(/\{\{(\d+)\}\}/g) || [];
        const uniqueVariables = [...new Set(variableMatches)];

        let finalMediaHandle = mediaHandle;

        // Client-Centric logic: Identify whose account this template belongs to
        const targetUserId = (req.user.role === 'admin' && clientId) ? clientId : req.user.user_id;
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ error: "Target client not found" });

        const appId = process.env.APP_ID || process.env.WHATSAPP_APP_ID;
        const access_token = targetUser.access_token || process.env.ACCESSTOKEN;

        // If direct submission to Meta and we have a media preview but no Meta handle yet
        if (directSubmit && !finalMediaHandle && previewUrl && headerType !== 'NONE') {
            try {
                const response = await axios.get(previewUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                const fileName = `sample_${Date.now()}`;
                const fileType = headerType === 'IMAGE' ? 'image/jpeg' : headerType === 'VIDEO' ? 'video/mp4' : 'application/pdf';

                const metaResult = await whatsappService.uploadMediaSampleToMeta(appId, access_token, buffer, fileName, fileType);
                if (metaResult.success) {
                    finalMediaHandle = metaResult.handle;
                } else {
                    console.error('Deferred Meta Upload Error:', metaResult.error);
                }
            } catch (err) {
                console.error('Error fetching media for Meta upload:', err.message);
            }
        }

        const templateData = {
            name: cleanName,
            category: category.toLowerCase(),
            language: language || 'en_US',
            content,
            variables: uniqueVariables,
            header: headerType !== 'NONE' ? { type: headerType, text: headerText, handle: finalMediaHandle, media_url: previewUrl } : null,
            footer: footer || null,
            buttons: buttons || [],
            created_by: targetUserId,
            is_custom_request: req.user.role !== 'admin',
            requested_by: targetUserId,
            status: directSubmit ? 'pending_meta_approval' : 'pending_admin_approval'
        };

        const template = new Template(templateData);

        if (directSubmit) {
            const waba_id = targetUser.waba_id || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

            if (!waba_id || !access_token) {
                return res.status(400).json({ error: `Credentials missing for client ${targetUser.name}.` });
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
                } else if (finalMediaHandle) {
                    header.example = {
                        header_handle: [finalMediaHandle]
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
        const userId = req.user.user_id;
        const template = await Template.findOne({ _id: id, created_by: userId });
        if (!template) return res.status(404).json({ error: "Template not found or unauthorized" });

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
