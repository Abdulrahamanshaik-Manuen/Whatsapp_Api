import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    template_name: {
        type: String,
        required: true
    },
    template_type: {
        type: String,
        enum: ['marketing', 'utility', 'authentication'],
        required: true
    },
    total_contacts: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'running', 'completed', 'failed'],
        default: 'pending'
    },
    scheduled_at: {
        type: Date
    },
    sent_count: {
        type: Number,
        default: 0
    },
    delivered_count: {
        type: Number,
        default: 0
    },
    read_count: {
        type: Number,
        default: 0
    },
    failed_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
