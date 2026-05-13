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
    // Bank Details
    bank_name: {
        type: String,
        trim: true
    },
    account_number: {
        type: String,
        trim: true
    },
    ifsc_code: {
        type: String,
        trim: true
    },
    account_holder_name: {
        type: String,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);
export default BusinessProfile;
