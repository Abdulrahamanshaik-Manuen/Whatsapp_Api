import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  walletBalance: {
    type: Number,
    default: 0,
  },
  currentPlan: {
    type: String,
    enum: ['Free', 'Business Pro', 'Enterprise'],
    default: 'Free',
  },
  monthlyUsage: {
    type: Number,
    default: 0,
  },
  billingHistory: [{
    invoiceId: { type: String },
    date: { type: Date, default: Date.now },
    amount: { type: Number },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'] },
    method: { type: String }
  }],
  paymentMethods: [{
    cardType: { type: String },
    lastFour: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Billing = mongoose.model('Billing', billingSchema);
export default Billing;
