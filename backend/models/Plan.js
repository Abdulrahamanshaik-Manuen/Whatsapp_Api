import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    interval: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    message_limit: {
        type: Number,
        required: true
    },
    contact_limit: {
        type: Number,
        required: true,
        default: 1000
    },
    features: [{
        type: String
    }],
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
