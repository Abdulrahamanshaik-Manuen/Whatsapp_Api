import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function manualFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Campaign = mongoose.model('Campaign', new mongoose.Schema({ name: String, sent_count: Number, status: String, user_id: mongoose.Schema.Types.ObjectId, template_name: String }));
        const Message = mongoose.model('Message', new mongoose.Schema({ 
            to: String, 
            campaign_id: mongoose.Schema.Types.ObjectId,
            user_id: mongoose.Schema.Types.ObjectId,
            body: String,
            template_name: String,
            type: String,
            direction: String,
            status: String
        }, { timestamps: true }));

        const campaign = await Campaign.findOne({ name: 'Offers' });
        if (!campaign) {
            console.log('Campaign "Offers" not found.');
            process.exit(1);
        }

        console.log(`Fixing campaign: ${campaign.name} (${campaign._id})`);
        
        // 1. Update Campaign Stats
        campaign.sent_count = 1;
        campaign.status = 'completed';
        await campaign.save();
        console.log('Campaign stats updated to Sent: 1');

        // 2. Create Dummy Message Log if not exists
        const phone = '918501920633'; // The phone number the user mentioned
        const existing = await Message.findOne({ to: phone, campaign_id: campaign._id });
        
        if (!existing) {
            await Message.create({
                user_id: campaign.user_id,
                campaign_id: campaign._id,
                to: phone,
                body: "Template: " + campaign.template_name,
                template_name: campaign.template_name,
                type: 'template',
                direction: 'outgoing',
                status: 'sent'
            });
            console.log(`Manual message log created for ${phone}`);
        } else {
            console.log(`Message log already exists for ${phone}`);
        }

        console.log('Manual fix completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Manual fix failed:', err);
        process.exit(1);
    }
}

manualFix();
