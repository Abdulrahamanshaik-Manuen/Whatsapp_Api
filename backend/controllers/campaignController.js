import Campaign from '../models/Campaigns.js';
import Contact from '../models/Contact.js';
import axios from 'axios';

export const createCampaign = async (req, res) => {
    try {
        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const executeCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findById(id);
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });

        const token = process.env.ACCESSTOKEN;
        const phoneId = process.env.PHONE_NUMBER_ID;

        console.log("Executing campaign for groups:", campaign.groups);

        // Find contacts in the specified groups or tags
        const targetContacts = await Contact.find({
            $or: [
                { 'details.group': { $in: campaign.groups } },
                { tags: { $in: campaign.groups } } 
            ]
        });

        console.log("Target contacts found:", targetContacts.length);

        if (targetContacts.length === 0) {
            console.log("No contacts found. Check if contact groups match campaign groups.");
            return res.status(400).json({ error: "No contacts found for selected groups/tags" });
        }

        campaign.status = 'active';
        await campaign.save();

        let sentCount = 0;
        let errors = [];

        for (const contact of targetContacts) {
            try {
                // Formatting phone number (must be in E.164 without +)
                const cleanPhone = contact.phoneNumber.replace(/\D/g, '');
                
                // Meta expects specific language codes. 'en_US' is safest for English.
                const langCode = campaign.language === 'English' ? 'en_US' : 'en_US';

                const payload = {
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: "template",
                    template: {
                        name: campaign.templateName,
                        language: { code: langCode }
                    }
                };

                const response = await axios.post(
                    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
                    payload,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                
                sentCount++;
            } catch (err) {
                const errorData = err.response?.data?.error?.message || err.message;
                console.error(`Failed to send to ${contact.phoneNumber}:`, errorData);
                errors.push({ phone: contact.phoneNumber, error: errorData });
            }
        }

        campaign.status = 'completed';
        campaign.metrics.sent = sentCount;
        campaign.metrics.audience = targetContacts.length;
        await campaign.save();

        res.status(200).json({ 
            message: sentCount > 0 ? "Campaign executed" : "Campaign failed to deliver", 
            sentCount,
            totalAudience: targetContacts.length,
            errors: errors.length > 0 ? errors : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
