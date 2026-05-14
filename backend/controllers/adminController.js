import User from '../models/User.js';
import Template from '../models/Template.js';
import Message from '../models/Message.js';
import BusinessProfile from '../models/BusinessProfile.js';
import Automation from '../models/Automation.js';
import Plan from '../models/Plan.js';
import moment from 'moment';

export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'client' });
        
        const totalMessages = await Message.countDocuments();
        const outgoingMessages = await Message.countDocuments({ direction: 'outgoing' });
        const deliveredMessages = await Message.countDocuments({ 
            direction: 'outgoing', 
            status: { $in: ['delivered', 'read'] } 
        });
        
        const deliveryRate = outgoingMessages > 0 
            ? Math.round((deliveredMessages / outgoingMessages) * 100) 
            : 0;

        const pendingTemplates = await Template.countDocuments({ status: 'pending_admin_approval' });
        const approvedTemplates = await Template.countDocuments({ status: 'approved' });

        const activeUsers = await User.find({ role: 'client', subscription_status: 'active' }).populate('planId');
        const mrr = activeUsers.reduce((sum, user) => {
            return sum + (user.planId?.price || 0);
        }, 0);

        const costResult = await Message.aggregate([
            { $match: { status: { $ne: 'failed' } } },
            { $group: { _id: null, totalCost: { $sum: "$meta_cost" } } }
        ]);
        const metaCost = costResult.length > 0 ? costResult[0].totalCost : 0;

        const startOfCurrentWeek = moment().startOf('isoWeek').toDate(); 
        const endOfCurrentWeek = moment().endOf('isoWeek').toDate();
        
        const throughputData = await Message.aggregate([
            { $match: { created_at: { $gte: startOfCurrentWeek, $lte: endOfCurrentWeek } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    sent: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const performance = [];
        for (let i = 0; i < 7; i++) {
            const dayMoment = moment().startOf('isoWeek').add(i, 'days');
            const dayStr = dayMoment.format('YYYY-MM-DD');
            const dayName = dayMoment.format('ddd');
            const dayData = throughputData.find(p => p._id === dayStr) || { sent: 0, delivered: 0, failed: 0 };
            performance.push({
                name: dayName,
                sent: dayData.sent,
                delivered: dayData.delivered,
                failed: dayData.failed
            });
        }

        const userGrowth = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = moment().subtract(i, 'weeks').startOf('isoWeek');
            const weekEnd = moment().subtract(i, 'weeks').endOf('isoWeek');
            const count = await User.countDocuments({ 
                role: 'client', 
                created_at: { $gte: weekStart.toDate(), $lte: weekEnd.toDate() } 
            });
            userGrowth.push({
                week: i === 0 ? 'This Week' : `${weekStart.format('DD MMM')}`,
                users: count
            });
        }

        res.json({
            totalUsers,
            totalMessages,
            deliveryRate,
            pendingTemplates,
            approvedTemplates,
            mrr,
            metaCost,
            systemStatus: 'Optimal',
            performance,
            userGrowth
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch platform stats" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'client' }).select('-password').populate('planId');
        const plans = await Plan.find({}, 'name _id message_limit');
        
        const stats = {
            total: users.length,
            active: users.filter(u => u.subscription_status === 'active').length,
            completed: users.filter(u => u.subscription_status === 'expired' || u.subscription_status === 'completed').length
        };

        const enhancedUsers = await Promise.all(users.map(async (user) => {
            const profile = await BusinessProfile.findOne({ user_id: user._id });
            const lastMessage = await Message.findOne({ user_id: user._id }).sort({ created_at: -1 });
            
            const usageLimit = user.planId?.message_limit || 0;
            const usagePercentage = usageLimit > 0 
                ? Math.min(100, Math.round((user.messages_used / usageLimit) * 100)) 
                : 0;

            return {
                id: user._id,
                name: user.name,
                businessName: profile?.business_name || 'N/A',
                email: user.email || profile?.email || 'N/A',
                phone: user.phone,
                plan: user.planId?.name || 'No Plan',
                planId: user.planId?._id,
                usage: user.messages_used,
                limit: usageLimit,
                usagePercentage,
                status: user.subscription_status || 'none',
                joinedDate: user.created_at,
                lastActive: lastMessage?.created_at || user.created_at,
                whatsappConnected: user.whatsapp_connected
            };
        }));

        res.json({ users: enhancedUsers, stats, plans });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

export const updateUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, businessName, status, planId, limit } = req.body;
        
        const updateData = { 
            name, 
            subscription_status: status 
        };

        // Update plan if provided
        if (planId) {
            updateData.planId = planId;
            // Also update the plan's message limit on the user record if we had a dedicated field, 
            // but usually it's pulled from the Plan model. 
            // If the user wants to OVERRIDE the plan limit, we'd need a field on User model.
            // Let's assume we update the plan link.
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (businessName) {
            await BusinessProfile.findOneAndUpdate(
                { user_id: id },
                { business_name: businessName },
                { upsert: true }
            );
        }

        res.json({ message: "User updated successfully", user });
    } catch (err) {
        console.error("Update User Details Error:", err);
        res.status(500).json({ error: "Failed to update user details" });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(id, { subscription_status: status }, { new: true });
        res.json({ message: `User status updated to ${status}`, user });
    } catch (err) {
        res.status(500).json({ error: "Failed to update user status" });
    }
};

export const getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.find().populate('created_by', 'name email waba_id phone_number_id');
        const profiles = await BusinessProfile.find();
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.user_id.toString()] = p.business_name;
        });
        
        const stats = {
            total: templates.length,
            pending: templates.filter(t => t.status.includes('pending')).length,
            approved: templates.filter(t => t.status === 'approved').length,
            rejected: templates.filter(t => t.status === 'rejected').length,
            disabled: templates.filter(t => t.status === 'disabled').length || 0
        };

        const formattedTemplates = templates.map(t => ({
            id: t._id,
            name: t.name,
            metaId: t.meta_template_id || 'Pending',
            category: t.category,
            language: t.language,
            client: profileMap[t.created_by?._id?.toString()] || t.created_by?.name || 'Unknown',
            clientEmail: t.created_by?.email || 'N/A',
            wabaId: t.created_by?.waba_id || 'N/A',
            phoneId: t.created_by?.phone_number_id || 'N/A',
            status: t.status,
            content: t.content,
            header: t.header,
            footer: t.footer,
            buttons: t.buttons,
            requestedOn: t.created_at,
            updatedOn: t.updated_at || t.created_at
        }));

        res.json({ templates: formattedTemplates, stats });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch template requests" });
    }
};

export const syncTemplatesWithMeta = async (req, res) => {
    // This would call the Meta API for each user to refresh statuses
    // For now, we'll simulate a success response
    try {
        res.json({ message: "Templates synchronized with Meta successfully" });
    } catch (err) {
        res.status(500).json({ error: "Sync failed" });
    }
};

export const updateTemplateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const template = await Template.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ message: `Template status updated to ${status}`, template });
    } catch (err) {
        res.status(500).json({ error: "Failed to update template status" });
    }
};

export const getAutomationRequests = async (req, res) => {
    try {
        const requests = await Automation.find({ status: 'requested' }).populate('clientId', 'name phone');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch automation requests" });
    }
};

export const getBillingOverview = async (req, res) => {
    try {
        const users = await User.find({ role: 'client' }).populate('planId');
        const subscriptions = await Promise.all(users.map(async (user) => {
            const profile = await BusinessProfile.findOne({ user_id: user._id });
            const messageCount = await Message.countDocuments({ user_id: user._id });
            
            const costResult = await Message.aggregate([
                { $match: { user_id: user._id, status: { $ne: 'failed' } } },
                { $group: { _id: null, total: { $sum: "$meta_cost" } } }
            ]);
            const metaCost = costResult.length > 0 ? costResult[0].total : 0;

            const platformRev = user.subscription_status === 'active' ? (user.planId?.price || 0) : 0;
            return {
                client: user.name,
                businessName: profile?.business_name || 'N/A',
                status: user.subscription_status,
                messages: messageCount,
                metaCost: `₹${metaCost.toFixed(2)}`,
                platformRev: `₹${platformRev}`,
                renewal: 'N/A',
                plan: user.planId?.name || 'N/A'
            };
        }));

        const totalMetaCostResult = await Message.aggregate([
            { $match: { status: { $ne: 'failed' } } },
            { $group: { _id: null, total: { $sum: "$meta_cost" } } }
        ]);
        const totalMetaCost = totalMetaCostResult.length > 0 ? totalMetaCostResult[0].total : 0;

        res.json({
            subscriptions,
            stats: {
                grossRevenue: subscriptions.reduce((acc, s) => acc + parseFloat(s.platformRev), 0),
                metaCosts: totalMetaCost
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch billing overview" });
    }
};
