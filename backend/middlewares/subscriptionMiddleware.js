import User from '../models/User.js';

/**
 * requireActiveSubscription
 * Blocks any send/create action if the user's subscription is:
 *  - status !== 'active'
 *  - OR expiry date has passed
 *
 * This check is intentionally independent of message_limit so that
 * leftover quota from a previous subscription cannot be used after expiry.
 */
export const requireActiveSubscription = async (req, res, next) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }

        const user = await User.findById(userId).select('subscription_status subscription_expiry');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const now = new Date();
        const isActive = user.subscription_status === 'active';
        const notExpired = user.subscription_expiry && user.subscription_expiry > now;

        if (!isActive || !notExpired) {
            return res.status(403).json({
                error: 'Subscription required',
                subscription_required: true,
                message: user.subscription_expiry && user.subscription_expiry <= now
                    ? 'Your subscription has expired. Please renew your plan to continue sending messages.'
                    : 'You do not have an active subscription. Please subscribe to a plan to continue.',
            });
        }

        next();
    } catch (err) {
        console.error('[subscriptionMiddleware] Error:', err);
        res.status(500).json({ error: 'Internal server error checking subscription.' });
    }
};
