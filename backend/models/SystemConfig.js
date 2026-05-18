import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    category: {
        type: String,
        enum: ['meta', 'security', 'infrastructure', 'webhooks'],
        required: true
    },
    description: {
        type: String
    },
    is_secret: {
        type: Boolean,
        default: false
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export default SystemConfig;
