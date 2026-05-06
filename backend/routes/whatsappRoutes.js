import express from 'express';
import { connectWhatsApp, oauthCallback, getStatus, getTemplates } from '../controllers/whatsappController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Middleware: Ensure user has connected WhatsApp
 */
export const checkWhatsAppConnected = async (req, res, next) => {
    try {
        const user = await User.findOne({ user_id: req.user.user_id });
        if (!user || !user.whatsapp_connected) {
            return res.status(403).json({ error: "WhatsApp not connected. Please complete OAuth flow first." });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: "Internal server error in connection check" });
    }
};

// --- Routes ---

// 1. Initiate OAuth (User must be logged in)
router.get('/connect', verifyToken, connectWhatsApp);

// 2. OAuth Callback (Public - hit by Meta)
router.get('/callback', oauthCallback);

// 3. Get Status
router.get('/status', verifyToken, getStatus);

// 4. Get Templates
router.get('/templates', verifyToken, getTemplates);

export default router;
