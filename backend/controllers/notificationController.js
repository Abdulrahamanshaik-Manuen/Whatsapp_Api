import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js';

export const notifyAdmins = async (title, message, type = 'info') => {
    try {
        const admins = await Admin.find({});
        const notifications = admins.map(admin => ({
            userId: admin._id,
            title,
            message,
            type
        }));
        await Notification.insertMany(notifications);
    } catch (err) {
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.user_id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notification" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.user_id }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.json({ message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
};
