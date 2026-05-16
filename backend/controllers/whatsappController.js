import axios from 'axios';
import User from '../models/User.js';

/**
 * Step 1: Redirect user to Meta OAuth URL
 */
export const connectWhatsApp = async (req, res) => {
    try {
        const userId = req.user.user_id; // From authMiddleware
        
        const appId = process.env.APP_ID;
        const redirectUri = encodeURIComponent(process.env.META_REDIRECT_URI.trim());
        const scopes = 'whatsapp_business_management,whatsapp_business_messaging,business_management';
        
        const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${userId}&response_type=code`;
        

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
        console.error("❌ ERROR: Authorization code missing");
        return res.status(400).json({ error: "Authorization code missing" });
    }

    try {
        // 1. Exchange code for Access Token
        const tokenResponse = await axios.post('https://graph.facebook.com/v20.0/oauth/access_token', null, {
            params: {
                client_id: process.env.APP_ID?.trim(),
                client_secret: process.env.APP_SECRET?.trim(),
                redirect_uri: process.env.META_REDIRECT_URI?.trim(),
                code: code.trim()
            }
        });


        // 2. DIAGNOSTIC: Fetch User Identity and Permissions
        const diagnosticRes = await axios.get('https://graph.facebook.com/v20.0/me?fields=id,name,email,permissions', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });


        // 3. Directly Fetch WhatsApp Business Accounts
        let wabaId = null;
        try {
            const wabaResponse = await axios.get('https://graph.facebook.com/v20.0/me/owned_whatsapp_business_accounts', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            wabaId = wabaResponse.data.data?.[0]?.id;
        } catch (e) {
            try {
                const clientRes = await axios.get('https://graph.facebook.com/v20.0/me/client_whatsapp_business_accounts', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                wabaId = clientRes.data.data?.[0]?.id;
            } catch (e2) {
                try {
                    const accountsRes = await axios.get('https://graph.facebook.com/v20.0/me/accounts?fields=whatsapp_business_accounts', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    wabaId = accountsRes.data.data?.[0]?.whatsapp_business_accounts?.data?.[0]?.id;
                } catch (e3) {
                    const wabaResponse = await axios.get('https://graph.facebook.com/v20.0/me?fields=whatsapp_business_accounts', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    wabaId = wabaResponse.data.whatsapp_business_accounts?.data?.[0]?.id;
                }
            }
        }

        if (!wabaId) {
            console.error("❌ ERROR: No WhatsApp Business Account found");
            throw new Error("No WhatsApp Business Account found. Make sure you have a WABA linked to your Business Manager.");
        }


        // 3. Fetch Phone Number ID for this WABA
        const phoneResponse = await axios.get(`https://graph.facebook.com/v20.0/${wabaId}/phone_numbers`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const phoneData = phoneResponse.data.data?.[0];
        if (!phoneData) {
            console.error("❌ ERROR: No phone numbers found in this WABA");
            throw new Error("No phone numbers found in this WABA");
        }

        const phoneNumberId = phoneData.id;

        // 4. Update User in DB
        const updatedUser = await User.findByIdAndUpdate(userId, {
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
            access_token: accessToken,
            whatsapp_connected: true
        }, { returnDocument: 'after' });


        // Redirect back to frontend dashboard
        const redirectUrl = `${process.env.FRONTEND_URL}/setup?status=whatsapp_connected`;
        res.redirect(redirectUrl);
    } catch (err) {
        console.error("❌ OAUTH CALLBACK ERROR DETAILS:");
        console.error(JSON.stringify(err.response?.data || err.message, null, 2));
        res.status(500).json({ error: "OAuth flow failed", details: err.message });
    }
};

/**
 * Step 3: Get Connection Status
 */
export const getStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const webhookUrl = `${process.env.FRONTEND_URL}/api/webhook`;

        res.json({
            whatsapp_connected: user.whatsapp_connected,
            phone_number_id: user.phone_number_id,
            waba_id: user.waba_id,
            access_token: user.access_token,
            webhook_url: webhookUrl,
            verify_token: "whatsapp_token"
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to get status" });
    }
};

/**
 * Step 3.5: Manual Save Settings
 */
export const saveSettings = async (req, res) => {
    try {
        const { phone_number_id, waba_id, access_token } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.user_id,
            { 
                phone_number_id, 
                waba_id, 
                access_token,
                whatsapp_connected: !!(phone_number_id && access_token)
            },
            { returnDocument: 'after' }
        );
        res.json({ message: "Settings saved successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Failed to save settings" });
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
