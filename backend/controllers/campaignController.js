import Campaign from '../models/Campaign.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Contact from '../models/Contact.js';
import { bulkMessageQueue } from '../workers/campaignQueue.js';

const META_PRICING = {
    marketing: 1.0,
    utility: 0.25,
    authentication: 0.15
};

const resolveContacts = async (contacts, group_ids, userId, template_type) => {
    let finalContacts = [];

    // Step 2: Add direct contacts
    if (contacts && Array.isArray(contacts)) {
        finalContacts.push(...contacts);
    }

    // Step 3: Fetch group contacts
    if (group_ids && Array.isArray(group_ids) && group_ids.length > 0) {
        const groups = await Group.find({
            _id: { $in: group_ids },
            user_id: userId
        });

        groups.forEach(group => {
            if (group.contacts && Array.isArray(group.contacts)) {
                finalContacts.push(...group.contacts);
            }
        });
    }

    // Step 4 & 5: Deduplicate
    finalContacts = [...new Set(finalContacts)]
        .filter(phone => phone && typeof phone === 'string' && phone.trim() !== '');

    // Step 6: Consent Validation
    if (template_type !== 'authentication' && finalContacts.length > 0) {
        const validContacts = await Contact.find({
            phoneNumber: { $in: finalContacts },
            consent: true
        }).select('phoneNumber -_id');
        
        finalContacts = validContacts.map(c => c.phoneNumber);
    }

    return finalContacts;
};

export const previewCampaign = async (req, res) => {
    try {
        const { contacts, group_ids, template_type } = req.body;
        const userId = req.user.user_id;
        
        if (!template_type) {
            return res.status(400).json({ error: "template_type is required." });
        }

        const finalContacts = await resolveContacts(contacts, group_ids, userId, template_type);

        if (finalContacts.length === 0) {
            return res.status(400).json({ error: "No valid contacts found after merging." });
        }

        const total_contacts = finalContacts.length;
        const estimated_meta_cost = (META_PRICING[template_type] || 1.0) * total_contacts;
        const estimated_platform_cost = 0; // Since hard limits apply
        const estimated_total_cost = estimated_meta_cost + estimated_platform_cost;

        res.json({
            total_contacts,
            estimated_meta_cost,
            estimated_platform_cost,
            estimated_total_cost,
            preview_contacts: finalContacts.slice(0, 5) // Send a small preview
        });
    } catch (err) {
        console.error("Preview Campaign Error:", err);
        res.status(500).json({ error: "Failed to generate preview" });
    }
};

export const createCampaign = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { campaign_name, template_name, template_type, contacts, group_ids, scheduled_at } = req.body;

        if (!campaign_name || !template_name || !template_type) {
            return res.status(400).json({ error: "Missing required campaign fields" });
        }

        const finalContacts = await resolveContacts(contacts, group_ids, userId, template_type);

        if (finalContacts.length === 0) {
            return res.status(400).json({ error: "No valid contacts selected for this campaign" });
        }

        const user = await User.findById(userId);
        if (!user || !user.whatsapp_connected) {
            return res.status(403).json({ error: "WhatsApp not connected" });
        }

        if (user.messages_used + finalContacts.length > user.message_limit) {
            return res.status(403).json({ 
                error: "Message limit exceeded",
                upgrade_required: true,
                message: `This campaign requires ${finalContacts.length} messages, but you only have ${user.message_limit - user.messages_used} left.`
            });
        }

        // Determine Campaign Status and Schedule
        let status = 'running';
        let delay = 0;
        if (scheduled_at) {
            const scheduledTime = new Date(scheduled_at).getTime();
            const now = Date.now();
            if (scheduledTime > now) {
                status = 'scheduled';
                delay = scheduledTime - now;
            } else {
                return res.status(400).json({ error: "Scheduled time must be in the future" });
            }
        }

        // Create Campaign
        const campaign = await Campaign.create({
            user_id: userId,
            name: campaign_name,
            template_name,
            template_type,
            total_contacts: finalContacts.length,
            status,
            scheduled_at: scheduled_at || null
        });

        // Add a single 'launch-campaign' job to the Queue
        await bulkMessageQueue.add('launch-campaign', {
            campaign_id: campaign._id,
            finalContacts,
            template_name,
            template_type,
            user_id: userId
        }, {
            delay, // This is the magic for scheduling
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true
        });

        res.status(201).json({ 
            message: status === 'scheduled' ? "Campaign scheduled successfully" : "Campaign started successfully", 
            total_recipients: finalContacts.length,
            campaign 
        });
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
        const campaign = await Campaign.findById(id);
        
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        res.json(campaign);
    } catch (err) {
        console.error("Campaign Status Error:", err);
        res.status(500).json({ error: "Failed to fetch campaign status" });
    }
};
