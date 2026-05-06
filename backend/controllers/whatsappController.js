import axios from 'axios';
import User from '../models/User.js';

/**
 * Step 1: Redirect user to Meta OAuth URL
 */
export const connectWhatsApp = async (req, res) => {
    try {
        const userId = req.user.user_id; // From authMiddleware
        
        const appId = process.env.APP_ID;
        const redirectUri = process.env.META_REDIRECT_URI;
        const scopes = 'whatsapp_business_management,whatsapp_business_messaging';
        
        const oauthUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${userId}&response_type=code`;
        
        res.json({ url: oauthUrl });
    } catch (err) {
        res.status(500).json({ error: "Failed to initiate WhatsApp connection" });
    }
};

/**
 * Step 2: OAuth Callback - Exchange code for token and fetch IDs
 */
export const oauthCallback = async (req, res) => {
    const { code, state } = req.query; // state contains userId
    const userId = state;

    if (!code) {
        return res.status(400).json({ error: "Authorization code missing" });
    }

    try {
        // 1. Exchange code for Access Token
        const tokenResponse = await axios.get('https://graph.facebook.com/v22.0/oauth/access_token', {
            params: {
                client_id: process.env.APP_ID,
                client_secret: process.env.APP_SECRET,
                redirect_uri: process.env.META_REDIRECT_URI,
                code
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. Fetch WhatsApp Business Accounts (WABA ID)
        const wabaResponse = await axios.get(`https://graph.facebook.com/v22.0/me?fields=whatsapp_business_accounts`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const wabaData = wabaResponse.data.whatsapp_business_accounts?.data?.[0];
        if (!wabaData) throw new Error("No WhatsApp Business Account found");

        const wabaId = wabaData.id;

        // 3. Fetch Phone Number ID for this WABA
        const phoneResponse = await axios.get(`https://graph.facebook.com/v22.0/${wabaId}/phone_numbers`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const phoneData = phoneResponse.data.data?.[0];
        if (!phoneData) throw new Error("No phone numbers found in this WABA");

        const phoneNumberId = phoneData.id;

        // 4. Update User in DB
        await User.findOneAndUpdate({ user_id: userId }, {
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
            access_token: accessToken,
            whatsapp_connected: true
        });

        // Redirect back to frontend dashboard
        res.redirect(`${process.env.FRONTEND_URL}/user?status=whatsapp_connected`);
    } catch (err) {
        console.error("OAuth Callback Error:", err.response?.data || err.message);
        res.status(500).json({ error: "OAuth flow failed", details: err.message });
    }
};

/**
 * Step 3: Get Connection Status
 */
export const getStatus = async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.user.user_id });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            connected: user.whatsapp_connected,
            phone_number_id: user.phone_number_id,
            waba_id: user.waba_id
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch status" });
    }
};
/**
 * Step 4: Fetch Message Templates from Meta
 */
export const getTemplates = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id);
        if (!user || !user.whatsapp_connected || !user.waba_id || !user.access_token) {
            return res.status(403).json({ error: "WhatsApp not connected" });
        }

        const response = await axios.get(`https://graph.facebook.com/v19.0/${user.waba_id}/message_templates`, {
            headers: { Authorization: `Bearer ${user.access_token}` }
        });

        // Filter for APPROVED templates
        const templates = response.data.data.filter(t => t.status === 'APPROVED');

        res.json(templates);
    } catch (err) {
        console.error("Fetch Templates Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch templates" });
    }
};
