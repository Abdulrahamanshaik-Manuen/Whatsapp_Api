import Queue from 'bull';
import axios from 'axios';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';
import * as whatsappService from '../services/whatsappService.js';

// Ensure .env is loaded before reading process.env
dotenv.config();

const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

// Initialize Bull Queue
export const bulkMessageQueue = new Queue('bulkMessageQueue', redisUrl);

bulkMessageQueue.on('error', (error) => {
    console.error('Bull Queue Redis Error:', error.message);
});

const META_PRICING = {
    marketing: 1.0,
    utility: 0.25,
    authentication: 0.15
};

// Process jobs
bulkMessageQueue.process('send-message', 5, async (job) => { // concurrency of 5
    const { to, template_id, template_name, template_type, variable_values, user_id, campaign_id } = job.data;
    
    try {
        const user = await User.findById(user_id);
        if (!user || !user.whatsapp_connected) {
            throw new Error('User not found or WhatsApp not connected');
        }

        // Limit Check
        if (user.messages_used >= user.message_limit) {
            // Log as failed immediately
            await Message.create({
                user_id,
                campaign_id,
                to,
                template_id: template_id || null,
                template_name,
                template_type,
                variable_values: variable_values || [],
                status: 'failed',
                meta_cost: 0,
                platform_cost: 0,
                total_cost: 0
            });

            if (campaign_id) {
                await Campaign.findByIdAndUpdate(campaign_id, { $inc: { failed_count: 1 } });
            }
            throw new Error('Message limit exceeded');
        }

        const meta_cost = META_PRICING[template_type] || 1.0;
        const platform_cost = 0;
        const total_cost = meta_cost + platform_cost;

        let meta_message_id = null;
        let status = 'failed';

        // Use whatsappService
        const result = await whatsappService.sendTemplateMessage(
            user.phone_number_id,
            user.access_token,
            to,
            template_name,
            'en_US',
            variable_values || []
        );

        if (result.success) {
            meta_message_id = result.data?.messages?.[0]?.id;
            status = 'sent';
        } else {
            status = 'failed';
            throw new Error(result.error);
        }

        // Log success
        await Message.create({
            user_id,
            campaign_id,
            to,
            template_id: template_id || null,
            template_name,
            template_type,
            variable_values: variable_values || [],
            status,
            meta_cost,
            platform_cost,
            total_cost,
            meta_message_id
        });

        // Update User Usage safely
        await User.findByIdAndUpdate(user_id, {
            $inc: {
                messages_used: 1,
                meta_cost_total: meta_cost,
                platform_cost_total: platform_cost,
                total_cost: total_cost
            }
        });

        // Update Campaign Sent Count
        if (campaign_id) {
            await Campaign.findByIdAndUpdate(campaign_id, { $inc: { sent_count: 1 } });
        }

        return { status: 'sent', to };
    } catch (err) {
        // If it fails (even after retries), ensure we log a failed message
        if (job.attemptsMade >= job.opts.attempts - 1) {
             await Message.create({
                user_id,
                campaign_id,
                to,
                template_id: template_id || null,
                template_name,
                template_type,
                variable_values: variable_values || [],
                status: 'failed',
                meta_cost: 0,
                platform_cost: 0,
                total_cost: 0
            });

            if (campaign_id) {
                await Campaign.findByIdAndUpdate(campaign_id, { $inc: { failed_count: 1 } });
            }
        }
        throw err;
    }
});

/**
 * Handle Campaign Launching (especially for scheduled ones)
 */
bulkMessageQueue.process('launch-campaign', async (job) => {
    const { campaign_id, finalContacts, template_id, template_name, template_type, variable_values, user_id } = job.data;
    
    try {
        console.log(`Launching Campaign: ${campaign_id}`);
        
        // Mark campaign as running
        await Campaign.findByIdAndUpdate(campaign_id, { status: 'running' });

        // Add individual message jobs
        const jobs = finalContacts.map(phone => ({
            to: phone,
            template_id,
            template_name,
            template_type,
            variable_values,
            user_id,
            campaign_id
        }));

        for (const jobData of jobs) {
            await bulkMessageQueue.add('send-message', jobData, {
                attempts: 3,
                backoff: 5000,
                removeOnComplete: true
            });
        }

        return { status: 'launched', count: finalContacts.length };
    } catch (err) {
        console.error(`Launch Campaign Error for ${campaign_id}:`, err.message);
        throw err;
    }
});

// Update Campaign status based on queue completion
bulkMessageQueue.on('global:completed', async (jobId) => {
    const job = await bulkMessageQueue.getJob(jobId);
    if (job?.data?.campaign_id) {
        // We can check if all jobs for this campaign are done, 
        // but for simplicity, global:drained is better for finishing the campaign status.
    }
});

bulkMessageQueue.on('global:drained', async () => {
    // Note: In a production multi-tenant app, you'd want to track which campaign just finished.
    // Since jobs are added in bulk, we can look for 'running' campaigns and check if their counts match.
    console.log("Queue drained. Updating active campaigns to completed.");
    await Campaign.updateMany({ status: 'running' }, { status: 'completed' });
});
