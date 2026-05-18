import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    whatsapp_connected: {
        type: Boolean,
        default: false
    },
    waba_id: {
        type: String
    },
    phone_number_id: {
        type: String
    },
    access_token: {
        type: String
    },
    message_limit: {
        type: Number,
        default: 50
    },
    messages_used: {
        type: Number,
        default: 0
    },
    platform_cost_total: {
        type: Number,
        default: 0
    },
    meta_cost_total: {
        type: Number,
        default: 0
    },
    total_cost: {
        type: Number,
        default: 0
    },
    extra_message_cost: {
        type: Number,
        default: 1.2
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    subscription_status: {
        type: String,
        enum: ['active', 'expired', 'none'],
        default: 'none'
    },
    subscription_expiry: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
