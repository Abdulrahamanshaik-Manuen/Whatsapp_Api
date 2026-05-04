import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true,
        index: { expires: '5m' } // TTL Index for automatic deletion
    },
    attempts: {
        type: Number,
        default: 0
    },
    is_verified: {
        type: Boolean,
        default: false
    }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
