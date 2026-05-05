import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    userId: {
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
    contactCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

// Update contact count before saving
groupSchema.pre('save', function(next) {
    if (this.contacts) {
        // Deduplicate contacts
        this.contacts = [...new Set(this.contacts)];
        this.contactCount = this.contacts.length;
    }
    next();
});

const Group = mongoose.model('Group', groupSchema);
export default Group;
