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
        type: String, // This will store the BODY text
        required: true
    },
    header: {
        format: {
            type: String, // TEXT, IMAGE, VIDEO, DOCUMENT
            enum: ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"]
        },
        text: String,
        media_url: String, // For previewing images
        handle: String
    },
    footer: {
        type: String
    },
    buttons: [{
        type: { type: String }, // QUICK_REPLY, CALL_TO_ACTION
        text: String,
        url: String,
        phone_number: String
    }],
    variables: [{
        type: String
    }],
    status: {
        type: String,
        enum: ["draft", "pending_admin_approval", "pending_meta_approval", "approved", "rejected"],
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
    }
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
export default Template;
