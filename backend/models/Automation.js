import mongoose from 'mongoose';

const AutomationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Link to the specific client using this automation
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Admin who created it
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'paused', 'draft', 'requested'],
    default: 'active'
  },
  // React Flow Structure
  nodes: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  },
  metrics: {
    totalExecutions: { type: Number, default: 0 },
    totalSuccess: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    lastTriggered: Date
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

AutomationSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

const Automation = mongoose.model('Automation', AutomationSchema);
export default Automation;
