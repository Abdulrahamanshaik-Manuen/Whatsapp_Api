import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['error', 'warn', 'info'],
        default: 'error'
    },
    message: {
        type: String,
        required: true
    },
    stack: {
        type: String
    },
    source: {
        type: String,
        default: 'internal'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const SystemLog = mongoose.model('SystemLog', systemLogSchema);
export default SystemLog;
