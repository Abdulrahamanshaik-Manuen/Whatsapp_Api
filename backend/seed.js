import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from './models/Plan.js';

dotenv.config();

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Plan.deleteMany({}); // Clear existing

        const plans = [
            // Monthly Plans
            {
                name: 'Starter Monthly',
                price: 2499,
                interval: 'monthly',
                message_limit: 5000,
                contact_limit: 1000,
                features: ['5,000 Messages/mo', '1,000 Contacts', 'Basic Templates', 'Direct Chat Support']
            },
            {
                name: 'Growth Monthly',
                price: 5999,
                interval: 'monthly',
                message_limit: 25000,
                contact_limit: 10000,
                features: ['25,000 Messages/mo', '10,000 Contacts', 'Advanced Automation', 'Dynamic Drip Campaigns', 'Priority API Access']
            },
            {
                name: 'Enterprise Monthly',
                price: 19999,
                interval: 'monthly',
                message_limit: 100000,
                contact_limit: 100000,
                features: ['100,000 Messages/mo', '100,000 Contacts', 'Dedicated Node Manager', 'White-label Options', '24/7 Strategic Support']
            },
            // Yearly Plans
            {
                name: 'Starter Yearly',
                price: 23990,
                interval: 'yearly',
                message_limit: 60000,
                contact_limit: 1000,
                features: ['60,000 Messages/yr', '1,000 Contacts', 'Basic Templates', 'Direct Chat Support']
            },
            {
                name: 'Growth Yearly',
                price: 57590,
                interval: 'yearly',
                message_limit: 300000,
                contact_limit: 10000,
                features: ['300,000 Messages/yr', '10,000 Contacts', 'Advanced Automation', 'Dynamic Drip Campaigns', 'Priority API Access']
            },
            {
                name: 'Enterprise Yearly',
                price: 191990,
                interval: 'yearly',
                message_limit: 1200000,
                contact_limit: 100000,
                features: ['1.2M Messages/yr', '100,000 Contacts', 'Dedicated Node Manager', 'White-label Options', '24/7 Strategic Support']
            }
        ];

        await Plan.insertMany(plans);
        process.exit();
    } catch (error) {
        console.error("Error seeding plans:", error);
        process.exit(1);
    }
};

seedPlans();
