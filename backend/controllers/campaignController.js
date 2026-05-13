import Campaign from '../models/Campaign.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import { bulkMessageQueue } from '../workers/campaignQueue.js';

const META_PRICING = {
    marketing: 0.8631,
    utility: 0.1150,
    authentication: 0.1150
};

const resolveContacts = async (contacts, group_ids, userId, template_type, rich_contacts = []) => {
    let finalContacts = [];

    if (rich_contacts && Array.isArray(rich_contacts)) {
        finalContacts.push(...rich_contacts.map(c => ({
            phone: typeof c === 'object' ? c.phone : c,
            variables: c.variables || []
        })));
    }

    if (contacts && Array.isArray(contacts)) {
        finalContacts.push(...contacts.map(phone => ({ phone, variables: [] })));
    }

    if (group_ids && Array.isArray(group_ids) && group_ids.length > 0) {
        const groups = await Group.find({
            _id: { $in: group_ids },
            user_id: userId
        });

        groups.forEach(group => {
            if (group.contacts && Array.isArray(group.contacts)) {
                finalContacts.push(...group.contacts.map(phone => ({ phone, variables: [] })));
            }
        });
    }

    const seen = new Set();
    finalContacts = finalContacts.filter(c => {
        if (!c.phone || seen.has(c.phone)) return false;
        seen.add(c.phone);
        return true;
    });

    if (template_type !== 'authentication' && finalContacts.length > 0) {
        const phones = finalContacts.map(c => c.phone);
        const validContacts = await Contact.find({
            phoneNumber: { $in: phones },
            consent: true,
            userId: userId // Only check consent for this user's contacts
        }).select('phoneNumber -_id');

        const validPhones = new Set(validContacts.map(c => c.phoneNumber));

        // EXCEL BYPASS: If the contact came from a rich_contact (Excel), we trust the user's upload.
        // We only filter for marketing if they are NOT rich contacts.
        if (template_type === 'marketing') {
            const richPhones = new Set((rich_contacts || []).map(rc => typeof rc === 'object' ? rc.phone : rc));

            finalContacts = finalContacts.filter(c => {
                // If it's in the Excel upload, let it pass.
                if (richPhones.has(c.phone)) return true;
                // Otherwise, check for database consent.
                return validPhones.has(c.phone);
            });
        }
    }

    return finalContacts;
};

export const previewCampaign = async (req, res) => {
    try {
        const { contacts, group_ids, template_type, rich_contacts } = req.body;
        const userId = req.user.user_id;

        if (!template_type) {
            return res.status(400).json({ error: "template_type is required." });
        }

        const finalContacts = await resolveContacts(contacts, group_ids, userId, template_type, rich_contacts);

        if (finalContacts.length === 0) {
            return res.status(400).json({ error: "No valid contacts found after merging." });
        }

        const total_contacts = finalContacts.length;
        const estimated_meta_cost = (META_PRICING[template_type] || 1.0) * total_contacts;
        const estimated_platform_cost = 0;
        const estimated_total_cost = estimated_meta_cost + estimated_platform_cost;

        res.json({
            total_contacts,
            estimated_meta_cost,
            estimated_platform_cost,
            estimated_total_cost,
            preview_contacts: finalContacts.slice(0, 5)
        });
    } catch (err) {
        console.error("Preview Campaign Error:", err);
        res.status(500).json({ error: "Failed to generate preview" });
    }
};

export const createCampaign = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { campaign_name, template_id, template_name, template_type, variable_values, contacts, group_ids, scheduled_at, rich_contacts } = req.body;

        if (!campaign_name || (!template_id && (!template_name || !template_type))) {
            return res.status(400).json({ error: "Missing required campaign fields." });
        }

        let template;
        if (template_id) {
            // Users can use any approved template OR any template they created themselves
            template = await Template.findOne({ 
                _id: template_id, 
                $or: [
                    { status: 'approved' },
                    { created_by: userId }
                ]
            });
            if (!template) return res.status(404).json({ error: "Template not found or not approved for use" });
        }

        const t_name = template ? template.name : template_name;
        const t_type = template ? template.category : template_type;

        const finalContacts = await resolveContacts(contacts, group_ids, userId, t_type, rich_contacts);

        if (finalContacts.length === 0) {
            return res.status(400).json({ error: "No valid contacts selected for this campaign" });
        }

        const user = await User.findById(userId);
        if (!user || !user.whatsapp_connected) {
            return res.status(403).json({ error: "WhatsApp not connected" });
        }

        // Create Campaign
        const campaign = await Campaign.create({
            user_id: userId,
            name: campaign_name,
            template_id: template_id || null,
            template_name: t_name,
            template_type: t_type,
            variable_values: variable_values || [],
            total_contacts: finalContacts.length,
            status: scheduled_at ? 'scheduled' : 'running',
            scheduled_at: scheduled_at || null
        });

        // Add to Queue
        await bulkMessageQueue.add('launch-campaign', {
            campaign_id: campaign._id,
            finalContacts, // Now objects: { phone, variables }
            template_id: template_id || null,
            template_name: t_name,
            template_type: t_type,
            variable_values: variable_values || [],
            user_id: userId
        }, {
            delay: scheduled_at ? (new Date(scheduled_at).getTime() - Date.now()) : 0,
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true
        });

        res.status(201).json({ message: "Campaign initialized", campaign });
    } catch (err) {
        console.error("Create Campaign Error:", err);
        res.status(500).json({ error: "Failed to create campaign" });
    }
};

export const getCampaigns = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const campaigns = await Campaign.find({ user_id: userId }).sort({ created_at: -1 });
        res.json(campaigns);
    } catch (err) {
        console.error("Fetch Campaigns Error:", err);
        res.status(500).json({ error: "Failed to fetch campaigns" });
    }
};

export const getCampaignStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        const campaign = await Campaign.findOne({ _id: id, user_id: userId });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        res.json(campaign);
    } catch (err) {
        console.error("Campaign Status Error:", err);
        res.status(500).json({ error: "Failed to fetch campaign status" });
    }
};
