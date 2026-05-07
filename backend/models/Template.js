import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ["marketing", "utility", "authentication"],
        required: true
    },
    language: {
        type: String,
        required: true,
        default: 'en_US'
    },
    content: {
        type: String,
        required: true
    },
    variables: [{
        type: String
    }],
    status: {
        type: String,
        enum: ["draft", "pending_meta_approval", "approved", "rejected"],
        default: "draft"
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    is_custom_request: {
        type: Boolean,
        default: false
    },
    requested_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    meta_template_id: {
        type: String
    },
    meta_rejection_reason: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Template = mongoose.model('Template', templateSchema);
export default Template;
