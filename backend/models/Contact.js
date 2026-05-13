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

  location: {
    type: String
  },

  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  tags: [{
    type: String
  }],
  details: {
    joined: String,
    group: String
  },
  consent: {
    type: Boolean,
    default: false
  },
  consent_source: {
    type: String,
    enum: ['qr', 'store', 'web', 'csv'],
    required: false
  },
  consent_status: {
    type: String,
    enum: ['verified', 'unverified'],
    default: 'unverified'
  },
  consent_timestamp: {
    type: Date,
    default: null
  },
  email: {
    type: String,
    required: false
  },
  userId: {
    type: String,
    required: false
  },
  last_customer_message_at: {
    type: Date,
    default: null
  },
  window_expires_at: {
    type: Date,
    default: null
  },
  customer_service_window_active: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


contactSchema.pre('save', function () {
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.replace(/\D/g, '');
  }
});

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
