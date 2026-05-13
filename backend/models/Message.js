import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaign_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },
    to: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        enum: ['outgoing', 'incoming'],
        default: 'outgoing'
    },
    type: {
        type: String,
        enum: ['template', 'text', 'image', 'video', 'document', 'location'],
        default: 'template'
    },
    body: {
        type: String
    },
    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
    },
    template_name: {
        type: String
    },
    template_type: {
        type: String,
        enum: ['marketing', 'utility', 'authentication']
    },
    variable_values: [{
        type: String
    }],
    meta_cost: {
        type: Number,
        default: 0
    },
    platform_cost: {
        type: Number,
        default: 0
    },
    total_cost: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
        required: true
    },
    meta_message_id: {
        type: String,
        unique: true,
        sparse: true
    },
    pricing: {
        billable: { type: Boolean },
        category: { type: String },
        pricing_model: { type: String }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
