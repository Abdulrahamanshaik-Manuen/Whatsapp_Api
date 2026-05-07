import Template from '../models/Template.js';
import User from '../models/User.js';
import * as whatsappService from '../services/whatsappService.js';

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

export const requestCustomTemplate = async (req, res) => {
    try {
        const { name, category, content, variables } = req.body;
        
        const template = new Template({
            name,
            category,
            language: 'en_US', // Default
            content,
            variables,
            created_by: req.user.user_id,
            is_custom_request: true,
            requested_by: req.user.user_id,
            status: 'draft'
        });

        await template.save();
        res.status(201).json({ 
            message: "Custom templates require Meta approval and may take up to 24–48 hours.", 
            template 
        });
    } catch (error) {
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
