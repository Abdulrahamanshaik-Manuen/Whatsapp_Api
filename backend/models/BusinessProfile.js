import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    business_name: {
        type: String,
        required: true,
        trim: true
    },
    business_category: {
        type: String,
        required: true
    },
    business_description: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    business_hours: {
        type: Object
    },
    logo_url: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);
export default BusinessProfile;
