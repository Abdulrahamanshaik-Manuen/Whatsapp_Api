import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'Unknown Contact'
  },
  email: {
    type: String
  },
  location: {
    type: String
  },
  profilePicture: {
    type: String
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String
  }],
  details: {
    joined: String,
    group: String
  }
}, { timestamps: true });

contactSchema.pre('save', function(next) {
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.replace(/\D/g, '');
  }
  next();
});

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
