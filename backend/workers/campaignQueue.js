import Queue from 'bull';
import axios from 'axios';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Campaign from '../models/Campaign.js';
import Template from '../models/Template.js';
import * as whatsappService from '../services/whatsappService.js';
import mongoose from 'mongoose';

// Ensure .env is loaded before reading process.env
dotenv.config();

const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

// Initialize Bull Queue with TLS options if needed
const queueOptions = {};
if (redisUrl.startsWith('rediss://')) {
    queueOptions.redis = {
        tls: { rejectUnauthorized: false }
    };
}

export const bulkMessageQueue = new Queue('bulkMessageQueue', redisUrl, queueOptions);

bulkMessageQueue.on('error', (error) => {
    console.error('Bull Queue Redis Error:', error.message);
});

bulkMessageQueue.on('waiting', (jobId) => {
    console.log(`Job ${jobId} is waiting...`);
});

bulkMessageQueue.on('active', (jobId) => {
    console.log(`Job ${jobId} is now active...`);
});

const META_PRICING = {
    marketing: 1.0,
    utility: 0.25,
    authentication: 0.15
};

// Process jobs
bulkMessageQueue.process('send-message', 5, async (job) => { // concurrency of 5
    const { to, template_id, template_name, template_type, variable_values, user_id, campaign_id, header_image } = job.data;
    
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

        // Resolve dynamic variables if any
        let resolvedVariables = [...(variable_values || [])];
        if (resolvedVariables.some(v => typeof v === 'string' && v.includes('{{contact.'))) {
            const contact = await Contact.findOne({ phoneNumber: to, user_id });
            if (contact) {
                resolvedVariables = resolvedVariables.map(v => {
                    if (typeof v === 'string' && v.includes('{{contact.')) {
                        if (v.includes('{{contact.name}}')) return contact.name || '';
                        if (v.includes('{{contact.phone}}')) return contact.phoneNumber || '';
                        return v; // Fallback
                    }
                    return v;
                });
            }
        }

        // Use tokens from .env if available, otherwise fallback to database
        const phone_number_id = process.env.PHONE_NUMBER_ID || user.phone_number_id;

        // DEBUG: Identifying which token source is being used
        const envToken = process.env.ACCESSTOKEN || process.env.META_ACCESS_TOKEN;
        const dbToken = user.access_token;
        
        const accessToken = envToken || dbToken; // Prioritize the one in .env since we just verified it
        
        console.log(`[Worker] Using Token Source: ${envToken ? '.env' : 'Database'}`);
        console.log(`[Worker] Token Snippet: ${accessToken ? accessToken.substring(0, 15) + '...' : 'MISSING'}`);

        if (!phone_number_id || !accessToken) {
            throw new Error('WhatsApp configuration missing (phone_number_id or access_token)');
        }

        // Handle Image Header Logic
        let finalHeaderImage = header_image;

        // If no image provided in job, try to fetch from the Template database entry
        if (!finalHeaderImage) {
            try {
                const templateDoc = await Template.findOne({ name: template_name });
                if (templateDoc && templateDoc.header && templateDoc.header.media_url && !templateDoc.header.media_url.includes('scontent.whatsapp.net')) {
                    finalHeaderImage = templateDoc.header.media_url;
                    console.log(`[Worker] Using database-saved image for ${template_name}: ${finalHeaderImage}`);
                } else if (template_name === 'interior_design') {
                    // Fallback to the recovered permanent Cloudinary link for this specific template
                    finalHeaderImage = 'https://res.cloudinary.com/dcsfxv6g1/image/upload/v1778567550/whatsapp_templates/interior_design_approved.jpg';
                    console.log(`[Worker] Using permanent Cloudinary link for interior_design`);
                }
            } catch (err) {
                console.warn(`[Worker] Failed to fetch template media for ${template_name}:`, err.message);
            }
        }

        // Use whatsappService
        console.log(`[Worker] Attempting to send template "${template_name}" to ${to} with image ${finalHeaderImage}...`);
        let result = await whatsappService.sendTemplateMessage(
            phone_number_id,
            accessToken,
            to,
            template_name,
            'en_US',
            resolvedVariables,
            finalHeaderImage
        );

        // Fallback to 'en' if 'en_US' fails (common Meta issue)
        if (!result.success && result.error?.includes('language')) {
            console.log(`[Worker] Retrying with language "en" for ${to}...`);
            result = await whatsappService.sendTemplateMessage(
                phone_number_id,
                accessToken,
                to,
                template_name,
                'en',
                resolvedVariables,
                finalHeaderImage
            );
        }

        if (result.success) {
            console.log(`[Worker] ✅ Successfully handed to Meta for ${to}. Meta ID: ${result.data?.messages?.[0]?.id}`);
            meta_message_id = result.data?.messages?.[0]?.id;
            status = 'pending'; // Set to pending, webhook will update to 'sent' and increment count

            // ONLY update User Usage if Meta accepted the message
            try {
                await User.findByIdAndUpdate(user_id, {
                    $inc: {
                        messages_used: 1,
                        meta_cost_total: meta_cost,
                        platform_cost_total: platform_cost,
                        total_cost: total_cost
                    }
                });
            } catch (usageErr) {
                console.error(`[Worker] Failed to update usage for ${user_id}:`, usageErr.message);
            }
        } else {
            console.error(`[Worker] ❌ Meta Rejection for ${to}:`, result.error);
            status = 'failed';
            // Save the last error to the campaign for dashboard visibility
            if (campaign_id) {
                await Campaign.findByIdAndUpdate(campaign_id, { last_error: result.error });
            }
            throw new Error(result.error);
        }

        // Log success
        try {
            // Fetch template content for preview
            let previewBody = template_name;
            if (template_id) {
                try {
                    const template = await Template.findById(template_id);
                    if (template) {
                        previewBody = template.content;
                        if (resolvedVariables && Array.isArray(resolvedVariables)) {
                            resolvedVariables.forEach((val, i) => {
                                previewBody = previewBody.replace(`{{${i + 1}}}`, val);
                            });
                        }
                    }
                } catch (tempErr) {
                    console.warn(`[Worker] Could not fetch template ${template_id} for preview:`, tempErr.message);
                }
            }

            const cleanTo = to.replace(/\D/g, '');
            const logEntry = {
                user_id: new mongoose.Types.ObjectId(user_id),
                campaign_id: campaign_id ? new mongoose.Types.ObjectId(campaign_id) : null,
                to: cleanTo,
                template_id: template_id ? new mongoose.Types.ObjectId(template_id) : null,
                template_name,
                template_type,
                body: previewBody,
                variable_values: variable_values || [],
                status,
                meta_cost,
                platform_cost,
                total_cost,
                meta_message_id
            };
            
            const newMessage = await Message.create(logEntry);
            console.log(`[Worker] 📝 Log created for ${cleanTo}. ID: ${newMessage._id}`);

        } catch (logErr) {
            console.error(`[Worker] ❌ Failed to create message log for ${to}:`, logErr.message);
        }

        // Update Campaign stats - We now rely on the WEBHOOK to increment sent_count 
        // to avoid double-counting (Worker API Success + Meta Sent Webhook).
        if (campaign_id) {
            console.log(`[Worker] Campaign ${campaign_id} message handed to Meta. Waiting for webhook confirmation.`);
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
    const { campaign_id, finalContacts, template_id, template_name, template_type, variable_values, user_id, header_image } = job.data;
    
    try {
        console.log(`Launching Campaign: ${campaign_id}`);
        
        // Mark campaign as running
        await Campaign.findByIdAndUpdate(campaign_id, { status: 'running' });

        // Add individual message jobs
        const jobs = finalContacts.map(c => {
            const phone = typeof c === 'object' ? c.phone : c;
            const contactVars = (typeof c === 'object' && c.variables) ? c.variables : [];
            
            // Merge variables: contact-specific ones override global ones if they are present
            const finalVars = contactVars.length > 0 ? contactVars : variable_values;

            return {
                to: phone,
                template_id,
                template_name,
                template_type,
                variable_values: finalVars,
                user_id,
                campaign_id,
                header_image // Pass the header image to individual jobs
            };
        });

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
