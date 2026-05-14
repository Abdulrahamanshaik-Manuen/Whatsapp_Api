import axios from 'axios';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import Template from '../models/Template.js';
import * as whatsappService from '../services/whatsappService.js';
import { calculateMetaCost } from '../utils/pricingEngine.js';

// Use calculateMetaCost from ../utils/pricingEngine.js

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        let { to, template_id, template_name, template_type, variable_values } = req.body;

        if (to) to = to.replace(/\D/g, '');

        if (!to || (!template_id && (!template_name || !template_type))) {
            return res.status(400).json({ error: "Missing required fields. Provide template_id or name/type." });
        }

        let template;
        if (template_id) {
            template = await Template.findById(template_id);
            if (!template) return res.status(404).json({ error: "Template not found" });
            if (template.status !== 'approved') return res.status(403).json({ error: "Template is not approved by Meta yet." });

            // Validate variables count
            const requiredVars = template.variables?.length || 0;
            const providedVars = variable_values?.length || 0;
            if (requiredVars !== providedVars) {
                return res.status(400).json({ error: `Template "${template.name}" requires ${requiredVars} variables, but ${providedVars} were provided.` });
            }
        }

        const t_name = template ? template.name : template_name;
        const t_type = template ? template.category : template_type;
        const t_lang = template ? template.language : "en_US";

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.whatsapp_connected || !user.phone_number_id || !user.access_token) {
            return res.status(403).json({ error: "WhatsApp not connected or missing credentials" });
        }

        // Check window status
        const contact = await Contact.findOne({ phoneNumber: to, userId });
        let isInsideWindow = contact ? (contact.customer_service_window_active && contact.window_expires_at > new Date()) : false;

        // Message-based Fallback (Robust check)
        if (!isInsideWindow) {
            const lastIncoming = await Message.findOne({ to, direction: 'incoming', user_id: userId }).sort({ created_at: -1 });
            if (lastIncoming) {
                const now = new Date();
                const diff = now - lastIncoming.created_at;
                if (diff < 24 * 60 * 60 * 1000) {
                    isInsideWindow = true;
                }
            }
        }

        // Consent Validation
        if (t_type !== 'authentication') {
            if (!contact || !contact.consent) {
                return res.status(403).json({ error: "Recipient has not provided consent." });
            }
        }

        // Pricing Calculation
        const meta_cost = calculateMetaCost({ category: t_type, isInsideWindow });
        let platform_cost = 0;

        if (user.messages_used >= user.message_limit) {
            return res.status(403).json({
                error: "Message limit exceeded",
                upgrade_required: true,
                message: "You have exceeded your message limit. Please upgrade your subscription to continue sending messages."
            });
        }

        const total_cost = meta_cost + platform_cost;

        // Call Meta API via Service
        const result = await whatsappService.sendTemplateMessage(
            user.phone_number_id,
            user.access_token,
            to,
            t_name,
            t_lang,
            variable_values || []
        );

        let meta_message_id = null;
        let status = 'failed';

        if (result.success) {
            meta_message_id = result.data?.messages?.[0]?.id;
            status = 'sent';
        }

        // Construct preview body (Rendered version)
        let previewBody = t_name;
        try {
            const templateDoc = template || await Template.findOne({ name: t_name, user_id: userId });
            if (templateDoc) {
                previewBody = templateDoc.content;
                if (variable_values && Array.isArray(variable_values)) {
                    variable_values.forEach((val, i) => {
                        previewBody = previewBody.replace(`{{${i + 1}}}`, val);
                    });
                }
            }
        } catch (err) {
            console.error("Failed to construct preview body:", err.message);
        }

        // Save Message Log
        const messageLog = await Message.create({
            user_id: user._id,
            to,
            template_id: template_id || null,
            template_name: t_name,
            template_type: t_type,
            body: previewBody,
            variable_values: variable_values || [],
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
            return res.status(500).json({ error: "Failed to send message via Meta API", details: result.error, data: messageLog });
        }

    } catch (err) {
        console.error("Send Message Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendBulkMessages = async (req, res) => {
    try {
        const userId = req.user.user_id;
        let { to, template_id, template_name, template_type, variable_values } = req.body;

        if (to && Array.isArray(to)) {
            to = to.map(p => p.replace(/\D/g, ''));
        }

        if (!to || !Array.isArray(to) || to.length === 0 || (!template_id && (!template_name || !template_type))) {
            return res.status(400).json({ error: "Missing required fields. Provide phone numbers array and template." });
        }

        let template;
        if (template_id) {
            template = await Template.findById(template_id);
            if (!template) return res.status(404).json({ error: "Template not found" });
            if (template.status !== 'approved') return res.status(403).json({ error: "Template is not approved by Meta." });

            // Validate variables count
            const requiredVars = template.variables?.length || 0;
            const providedVars = variable_values?.length || 0;
            if (requiredVars !== providedVars) {
                return res.status(400).json({ error: `Template "${template.name}" requires ${requiredVars} variables, but ${providedVars} were provided.` });
            }
        }

        const t_name = template ? template.name : template_name;
        const t_type = template ? template.category : template_type;
        const t_lang = template ? template.language : "en_US";

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.whatsapp_connected || !user.phone_number_id || !user.access_token) {
            return res.status(403).json({ error: "WhatsApp not connected" });
        }

        // Consent Validation
        let validContacts = [...new Set(to)];
        if (t_type !== 'authentication') {
            const consentedContacts = await Contact.find({
                phoneNumber: { $in: validContacts },
                user_id: userId,
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
                message: `Limit exceeded. You need ${validContacts.length} messages, but have ${user.message_limit - user.messages_used} left.`
            });
        }

        // Bulk messages are templates. For Utility, we'd ideally check window per user.
        // For simplicity in bulk, we'll assume outside window (isInsideWindow: false).
        const meta_cost_default = calculateMetaCost({ category: t_type, isInsideWindow: false });
        const platform_cost = 0;
        const total_cost_per_msg = meta_cost_default + platform_cost;

        const results = {
            successful: 0,
            failed: 0,
            logs: []
        };

        let total_meta_cost_incurred = 0;
        let total_platform_cost_incurred = 0;
        let total_cost_incurred = 0;

        for (const phone of validContacts) {
            const result = await whatsappService.sendTemplateMessage(
                user.phone_number_id,
                user.access_token,
                phone,
                t_name,
                t_lang,
                variable_values || []
            );

            let meta_message_id = null;
            let status = 'failed';

            if (result.success) {
                meta_message_id = result.data?.messages?.[0]?.id;
                status = 'sent';
                results.successful++;
                total_meta_cost_incurred += meta_cost;
                total_platform_cost_incurred += platform_cost;
                total_cost_incurred += total_cost_per_msg;
            } else {
                results.failed++;
            }

            // Construct preview body (Rendered version)
            let previewBody = t_name;
            try {
                const templateDoc = template || await Template.findOne({ name: t_name, user_id: userId });
                if (templateDoc) {
                    previewBody = templateDoc.content;
                    if (variable_values && Array.isArray(variable_values)) {
                        variable_values.forEach((val, i) => {
                            previewBody = previewBody.replace(`{{${i + 1}}}`, val);
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to construct bulk preview body:", err.message);
            }

            results.logs.push({
                user_id: user._id,
                to: phone,
                template_id: template_id || null,
                template_name: t_name,
                template_type: t_type,
                body: previewBody,
                variable_values: variable_values || [],
                meta_cost,
                platform_cost,
                total_cost: total_cost_per_msg,
                status,
                meta_message_id
            });
        }

        if (results.logs.length > 0) {
            await Message.insertMany(results.logs);
        }

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
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { page = 1, limit = 50, search = '', status } = req.query;

        const query = { user_id: userId };
        if (search) {
            query.to = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        const messages = await Message.find(query)
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Message.countDocuments(query);

        const statsData = await Message.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statsMap = {};
        statsData.forEach(s => { statsMap[s._id] = s.count; });

        res.status(200).json({
            messages,
            stats: {
                total,
                delivered: statsMap['delivered'] || 0,
                read: statsMap['read'] || 0,
                failed: statsMap['failed'] || 0,
                sent: statsMap['sent'] || 0
            },
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Fetch Messages Error:", err);
        res.status(500).json({ error: "Failed to fetch message logs" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.user_id);

        // Group by 'to' and get the latest message and last incoming message
        const conversations = await Message.aggregate([
            { $match: { user_id: userId } },
            { $sort: { created_at: -1 } },
            {
                $group: {
                    _id: "$to",
                    lastMessage: { $first: "$$ROOT" },
                    lastIncomingMessageAt: {
                        $max: {
                            $cond: [{ $eq: ["$direction", "incoming"] }, "$created_at", null]
                        }
                    },
                    unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$direction", "incoming"] }, { $ne: ["$status", "read"] }] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "contacts",
                    localField: "_id",
                    foreignField: "phoneNumber",
                    as: "contactInfo"
                }
            },
            { $unwind: { path: "$contactInfo", preserveNullAndEmptyArrays: true } },
            { $sort: { "lastMessage.created_at": -1 } }
        ]);

        res.status(200).json(conversations);
    } catch (err) {
        console.error("Fetch Conversations Error:", err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
};

export const getMessagesByContact = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.user_id);
        const { phone } = req.params;

        const messages = await Message.find({
            user_id: userId,
            to: phone
        }).sort({ created_at: 1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error("Fetch Thread Error:", err);
        res.status(500).json({ error: "Failed to fetch message thread" });
    }
};

export const sendReply = async (req, res) => {
    try {
        const userId = req.user.user_id;
        let { to, text, type, mediaUrl } = req.body;
        if (!type) type = 'text';

        if (to) to = to.replace(/\D/g, '');

        if (!to || (!text && !mediaUrl)) {
            return res.status(400).json({ error: "Recipient and content are required" });
        }

        const user = await User.findById(userId);
        if (!user || !user.whatsapp_connected) {
            return res.status(403).json({ error: "WhatsApp not connected" });
        }

        // Window Enforcement
        const contact = await Contact.findOne({ phoneNumber: to, userId });
        let isInsideWindow = contact ? (contact.customer_service_window_active && contact.window_expires_at > new Date()) : false;

        // Message-based Fallback (Robust check)
        if (!isInsideWindow) {
            const lastIncoming = await Message.findOne({ to, direction: 'incoming', user_id: userId }).sort({ created_at: -1 });
            if (lastIncoming) {
                const now = new Date();
                const diff = now - lastIncoming.created_at;
                if (diff < 24 * 60 * 60 * 1000) {
                    isInsideWindow = true;
                }
            }
        }

        if (!isInsideWindow) {
            return res.status(403).json({
                error: "Customer service window expired",
                message: "You can only send free-form messages within 24 hours of the customer's last message. Please use a template to re-engage."
            });
        }

        // Pricing for Service messages (FREE inside window)
        const meta_cost = calculateMetaCost({ category: 'text', isInsideWindow });
        const platform_cost = 0;
        const total_cost = meta_cost + platform_cost;

        let result;
        if (type === 'text') {
            result = await whatsappService.sendTextMessage(
                user.phone_number_id,
                user.access_token,
                to,
                text
            );
        } else {
            result = await whatsappService.sendMediaMessage(
                user.phone_number_id,
                user.access_token,
                to,
                type,
                mediaUrl,
                text // caption
            );
        }

        if (result.success) {
            const messageLog = await Message.create({
                user_id: user._id,
                to,
                direction: 'outgoing',
                type: type,
                body: text || `[${type}]`,
                status: 'sent',
                meta_cost,
                platform_cost,
                total_cost,
                meta_message_id: result.data?.messages?.[0]?.id
            });
            return res.status(200).json(messageLog);
        } else {
            return res.status(500).json({ error: result.error });
        }
    } catch (err) {
        console.error("Send Reply Error:", err);
        res.status(500).json({ error: "Internal server error" });
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
