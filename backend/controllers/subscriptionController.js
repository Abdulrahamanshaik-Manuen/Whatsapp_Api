import Plan from '../models/Plan.js';
import User from '../models/User.js';

export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ is_active: true }).sort({ price: 1 });
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).populate('planId');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            plan: user.planId,
            status: user.subscription_status,
            expiry: user.subscription_expiry,
            usage: {
                messages_used: user.messages_used,
                message_limit: user.planId?.message_limit || user.message_limit,
                contact_limit: user.planId?.contact_limit || 1000
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Subscribe to a plan (Protected)
 */
export const subscribeToPlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (plan.interval === 'yearly' ? 12 : 1));

        const updatedUser = await User.findByIdAndUpdate(
            req.user.user_id,
            {
                planId: plan._id,
                subscription_status: 'active',
                subscription_expiry: expiryDate,
                message_limit: plan.message_limit
            },
            { returnDocument: 'after' }
        ).populate('planId');

        res.status(200).json({
            message: `Successfully subscribed to ${plan.name}`,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Admin: Create a new plan
 */
export const createPlan = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can create plans" });
        }

        const plan = new Plan(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
