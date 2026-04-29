import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
    // WhatsApp Setup
    profilePhoto:
    {
        type: String
    },
    phoneNumber:
    {
        type: String,
        required: true
    },
    businessName:
    {
        type: String,
        required: true
    },
    businessCategory:
    {
        type: String,
        required: true
    },
    businessHours:
    {
        type: String
    },
    address:
    {
        type: String
    },
    description:
    {
        type: String
    },
    email:
    {
        type: String
    },

    // Business Details
    companyName:
    {
        type: String
    },
    businessWebsite:
    {
        type: String
    },
    primaryContactPerson:
    {
        type: String
    },
    contactEmail:
    {
        type: String
    },
    contactPhone:
    {
        type: String
    },

    // Meta Account Details
    metaBusinessManagerId:
    {
        type: String
    },
    whatsappBusinessAccountId:
    {
        type: String
    },
    facebookPageId:
    {
        type: String
    },
    instagramHandle:
    {
        type: String
    },
    adAccountId:
    {
        type: String
    },

    // Messaging Requirements
    useCase:
    {
        type: String
    }, // support, marketing, OTP, notifications
    expectedMonthlyVolume:
    {
        type: String
    },
    templateRequirements:
    {
        type: String
    },
    preferredLanguages:
        [
            String
        ],
    optInMethod:
    {
        type: String
    },
    automationNeeds:
    {
        type: String
    },
    crmIntegrationDetails:
    {
        type: String
    },

    // Access and Permissions
    adminAccess:
    {
        type: Boolean,
        default: false
    },
    systemUserAccess:
    {
        type: Boolean,
        default: false
    },
    accessToken:
    {
        type: String
    },
    appId:
    {
        type: String
    },
    appSecret:
    {
        type: String
    },
    webhookVerifyToken:
    {
        type: String
    },
    webhookCallbackUrl:
    {
        type: String
    },

    // Checklist
    privacyPolicyUrl:
    {
        type: String
    },
    termsAndConditionsUrl:
    {
        type: String
    },
    customerConsentProof:
    {
        type: String
    },
    billingContactPerson:
    {
        type: String
    },
    escalationContact:
    {
        type: String
    },

    // Status
    status: {
        type: String,
        enum:
            [
                'pending',
                'in-review',
                'approved',
                'rejected'
            ],
        default: 'pending'
    }
}, { timestamps: true });

const Data = mongoose.model('Data', dataSchema);
export default Data;



