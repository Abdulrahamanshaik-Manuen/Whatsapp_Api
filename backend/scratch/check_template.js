import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const checkTemplate = async () => {
    const accessToken = process.env.ACCESSTOKEN;
    const waba_id = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!accessToken || !waba_id) {
        console.error("Missing ACCESSTOKEN or WHATSAPP_BUSINESS_ACCOUNT_ID in .env");
        return;
    }

    try {
        console.log(`Checking Template "interior_design" for WABA: ${waba_id}`);

        const templateURL = `https://graph.facebook.com/v21.0/${waba_id}/message_templates?name=interior_design`;
        const tResponse = await axios.get(templateURL, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        console.log("Template Details:", JSON.stringify(tResponse.data, null, 2));
    } catch (err) {
        console.error("Error checking template:", err.response?.data || err.message);
    }
};

checkTemplate();
