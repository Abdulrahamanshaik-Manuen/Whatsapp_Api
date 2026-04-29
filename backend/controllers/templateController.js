import Template from '../models/Template.js';

export const createTemplate = async (req, res) => {
    try {
        const template = new Template(req.body);
        await template.save();
        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

export const sendTemplate = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };
export const sendTemplateById = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };
