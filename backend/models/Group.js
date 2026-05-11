import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    contacts: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    contactCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

// Update contact count and normalize phone numbers before saving
groupSchema.pre('save', function() {
    if (this.contacts && Array.isArray(this.contacts)) {
        // Normalize each phone number
        this.contacts = this.contacts.map(phone => {
            if (typeof phone !== 'string') return phone;
            
            // Remove all non-digits
            let cleaned = phone.replace(/\D/g, '');
            
            // Handle 10-digit Indian numbers
            if (cleaned.length === 10) {
                cleaned = '91' + cleaned;
            }
            
            return cleaned;
        });

        // Deduplicate contacts
        this.contacts = [...new Set(this.contacts)];
        this.contactCount = this.contacts.length;
    }
});

const Group = mongoose.model('Group', groupSchema);
export default Group;
