export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WEBHOOKVERIFYTOKEN || 'my_secret_token_2026';

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

export const handleWebhookEvent = (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            console.log('Incoming WhatsApp Event:', JSON.stringify(body, null, 2));

            res.status(200).send('EVENT_RECEIVED');
        } catch (err) {
            console.error('Error processing webhook:', err.message);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
};
