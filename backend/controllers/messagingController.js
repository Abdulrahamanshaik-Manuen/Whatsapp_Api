import axios from 'axios';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Contact from '../models/Contact.js';

const META_PRICING = {
    marketing: 1.0,
    utility: 0.25,
    authentication: 0.15
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { to, template_name, template_type } = req.body;

        if (!to || !template_name || !template_type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (!META_PRICING[template_type]) {
            return res.status(400).json({ error: "Invalid template_type. Must be marketing, utility, or authentication" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.whatsapp_connected || !user.phone_number_id || !user.access_token) {
            return res.status(403).json({ error: "WhatsApp not connected or missing credentials" });
        }

        // Consent Validation
        if (template_type !== 'authentication') {
            const contact = await Contact.findOne({ phoneNumber: to, consent: true });
            if (!contact) {
                return res.status(403).json({ error: "Recipient has not provided consent." });
            }
        }

        // Pricing Calculation
        const meta_cost = META_PRICING[template_type];
        let platform_cost = 0;

        if (user.messages_used >= user.message_limit) {
            return res.status(403).json({
                error: "Message limit exceeded",
                upgrade_required: true,
                message: "You have exceeded your message limit. Please upgrade your subscription to continue sending messages."
            });
        }

        const total_cost = meta_cost + platform_cost;

        // Call Meta API
        let meta_message_id = null;
        let status = 'failed';

        try {
            const metaResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${user.phone_number_id}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: to,
                    type: "template",
                    template: {
                        name: template_name,
                        language: { code: "en_US" }
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            meta_message_id = metaResponse.data?.messages?.[0]?.id;
            status = 'sent';
        } catch (metaErr) {
            console.error("Meta API Error:", metaErr.response?.data || metaErr.message);
            status = 'failed';
        }

        // Save Message Log
        const messageLog = await Message.create({
            user_id: user._id,
            to,
            template_name,
            template_type,
            meta_cost,
            platform_cost,
            total_cost,
            status,
            meta_message_id
        });

        // Update User Usage if sent successfully
        if (status === 'sent') {
            user.messages_used += 1;
            user.meta_cost_total += meta_cost;
            user.platform_cost_total += platform_cost;
            user.total_cost += total_cost;
            await user.save();

            return res.status(200).json({ message: "Message sent successfully", data: messageLog });
        } else {
            return res.status(500).json({ error: "Failed to send message via Meta API", data: messageLog });
        }

    } catch (err) {
        console.error("Send Message Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendBulkMessages = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { to, template_name, template_type } = req.body;

        if (!to || !Array.isArray(to) || to.length === 0 || !template_name || !template_type) {
            return res.status(400).json({ error: "Missing required fields. 'to' must be a non-empty array of phone numbers." });
        }

        if (!META_PRICING[template_type]) {
            return res.status(400).json({ error: "Invalid template_type. Must be marketing, utility, or authentication" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.whatsapp_connected || !user.phone_number_id || !user.access_token) {
            return res.status(403).json({ error: "WhatsApp not connected or missing credentials" });
        }

        // Consent Validation
        let validContacts = [...new Set(to)];
        if (template_type !== 'authentication') {
            const consentedContacts = await Contact.find({
                phoneNumber: { $in: validContacts },
                consent: true
            }).select('phoneNumber -_id');
            validContacts = consentedContacts.map(c => c.phoneNumber);
        }

        if (validContacts.length === 0) {
            return res.status(403).json({ error: "None of the recipients have provided consent." });
        }

        if (user.messages_used + validContacts.length > user.message_limit) {
            return res.status(403).json({
                error: "Message limit exceeded",
                upgrade_required: true,
                message: `This bulk send requires ${validContacts.length} messages, but you only have ${user.message_limit - user.messages_used} left. Please upgrade your subscription.`
            });
        }

        const meta_cost = META_PRICING[template_type];
        let platform_cost = 0; // Assuming hard limit is enforced, no extra cost
        const total_cost_per_msg = meta_cost + platform_cost;

        const results = {
            successful: 0,
            failed: 0,
            logs: []
        };

        let total_meta_cost_incurred = 0;
        let total_platform_cost_incurred = 0;
        let total_cost_incurred = 0;

        // Process sequentially to respect basic rate limits
        for (const phone of validContacts) {
            let meta_message_id = null;
            let status = 'failed';

            try {
                const metaResponse = await axios.post(
                    `https://graph.facebook.com/v19.0/${user.phone_number_id}/messages`,
                    {
                        messaging_product: "whatsapp",
                        to: phone,
                        type: "template",
                        template: {
                            name: template_name,
                            language: { code: "en_US" }
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                meta_message_id = metaResponse.data?.messages?.[0]?.id;
                status = 'sent';

                results.successful++;
                total_meta_cost_incurred += meta_cost;
                total_platform_cost_incurred += platform_cost;
                total_cost_incurred += total_cost_per_msg;
            } catch (metaErr) {
                console.error(`Meta API Error for ${phone}:`, metaErr.response?.data || metaErr.message);
                status = 'failed';
                results.failed++;
            }

            results.logs.push({
                user_id: user._id,
                to: phone,
                template_name,
                template_type,
                meta_cost,
                platform_cost,
                total_cost: total_cost_per_msg,
                status,
                meta_message_id
            });
        }

        // Bulk insert logs
        if (results.logs.length > 0) {
            await Message.insertMany(results.logs);
        }

        // Update User Usage if any succeeded
        if (results.successful > 0) {
            user.messages_used += results.successful;
            user.meta_cost_total += total_meta_cost_incurred;
            user.platform_cost_total += total_platform_cost_incurred;
            user.total_cost += total_cost_incurred;
            await user.save();
        }

        return res.status(200).json({
            message: "Bulk messaging completed",
            summary: {
                total_attempted: validContacts.length,
                successful: results.successful,
                failed: results.failed,
                total_cost_incurred
            }
        });

    } catch (err) {
        console.error("Bulk Send Error:", err);
        res.status(500).json({ error: "Internal server error during bulk sending" });
    }
};

export const getUsageDashboard = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: "User not found" });

        const usage_percent = user.message_limit > 0 ? (user.messages_used / user.message_limit) * 100 : 100;

        const upgrade_warning = usage_percent >= 80 && usage_percent < 100;
        const upgrade_required = usage_percent >= 100;

        res.status(200).json({
            message_limit: user.message_limit,
            messages_used: user.messages_used,
            usage_percent: parseFloat(usage_percent.toFixed(2)),
            meta_cost_total: parseFloat(user.meta_cost_total.toFixed(2)),
            platform_cost_total: parseFloat(user.platform_cost_total.toFixed(2)),
            total_cost: parseFloat(user.total_cost.toFixed(2)),
            upgrade_warning,
            upgrade_required
        });
    } catch (err) {
        console.error("Dashboard Usage Error:", err);
        res.status(500).json({ error: "Internal server error fetching usage" });
    }
};
