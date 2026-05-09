import Campaign from '../models/Campaign.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Template from '../models/Template.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const { range = '7d' } = req.query;

        // 1. KPI Stats
        const stats = await Message.aggregate([
            { $match: { user_id: userObjectId } },
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: 1 },
                    totalDelivered: {
                        $sum: { $cond: [{ $in: ['$status', ['delivered', 'read']] }, 1, 0] }
                    },
                    totalCost: { $sum: '$total_cost' }
                }
            }
        ]);

        const kpi = stats[0] || { totalSent: 0, totalDelivered: 0, totalCost: 0 };
        const user = await User.findById(userId);

        // 2. Performance Chart
        const performance = [];
        let daysToFetch = range === '30d' ? 30 : (range === '24h' ? 24 : 7);

        if (range === '24h') {
            // Hourly grouping for last 24 hours
            for (let i = 23; i >= 0; i--) {
                const d = new Date();
                d.setHours(d.getHours() - i, 0, 0, 0);
                const hourStr = d.getHours() + ':00';
                
                const startOfHour = new Date(d);
                const endOfHour = new Date(d);
                endOfHour.setMinutes(59, 59, 999);

                const hourStats = await Message.aggregate([
                    { $match: { user_id: userObjectId, created_at: { $gte: startOfHour, $lte: endOfHour } } },
                    { $group: { _id: null, sent: { $sum: 1 }, delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'read']] }, 1, 0] } } } }
                ]);
                const s = hourStats[0] || { sent: 0, delivered: 0 };
                performance.push({ name: hourStr, sent: s.sent, delivered: s.delivered });
            }
        } else {
            // Daily grouping
            for (let i = daysToFetch - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                
                const startOfDay = new Date(d);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(d);
                endOfDay.setHours(23, 59, 59, 999);

                const dayStats = await Message.aggregate([
                    { $match: { user_id: userObjectId, created_at: { $gte: startOfDay, $lte: endOfDay } } },
                    { $group: { _id: null, sent: { $sum: 1 }, delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'read']] }, 1, 0] } } } }
                ]);
                const s = dayStats[0] || { sent: 0, delivered: 0 };
                performance.push({ name: dateStr, sent: s.sent, delivered: s.delivered });
            }
        }

        // 3. Recent Campaigns
        const recentCampaigns = await Campaign.find({ user_id: userObjectId })
            .sort({ created_at: -1 })
            .limit(3);

        // 4. Top Templates
        const topTemplates = await Message.aggregate([
            { $match: { user_id: userObjectId, template_name: { $ne: null } } },
            {
                $group: {
                    _id: "$template_name",
                    usage: { $sum: 1 },
                    type: { $first: "$template_type" }
                }
            },
            { $sort: { usage: -1 } },
            { $limit: 4 }
        ]);

        // 5. Usage Overview

        res.json({
            kpi: {
                messagesSent: kpi.totalSent,
                delivered: kpi.totalDelivered,
                deliveryRate: kpi.totalSent > 0 ? ((kpi.totalDelivered / kpi.totalSent) * 100).toFixed(1) + '%' : '0%',
                totalSpend: '₹' + kpi.totalCost.toFixed(2),
                activeContacts: user.messages_used // Placeholder or fetch actual contact count
            },
            performance,
            recentCampaigns,
            topTemplates: topTemplates.map(t => ({
                name: t._id,
                type: t.type || 'utility',
                usage: t.usage >= 1000 ? (t.usage / 1000).toFixed(1) + 'K' : t.usage.toString()
            })),
            usage: {
                used: user.messages_used,
                limit: user.message_limit,
                percentage: user.message_limit > 0 ? Math.round((user.messages_used / user.message_limit) * 100) : 0,
                remaining: user.message_limit - user.messages_used
            },
            connection: {
                connected: user.whatsapp_connected,
                phoneNumber: user.phone_number || 'Not connected',
                wabaId: user.waba_id
            }
        });

    } catch (err) {
        console.error("Dashboard Analytics Error:", err);
        res.status(500).json({ error: "Failed to fetch dashboard analytics" });
    }
};
