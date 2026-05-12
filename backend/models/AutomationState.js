import mongoose from 'mongoose';

const AutomationStateSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true
  },
  currentNodeId: {
    type: String,
    required: true
  },
  // Store variables collected during the flow (e.g. name, email, order_id)
  context: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // If the flow is waiting for a specific type of input
  waitingForReply: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Document will expire at this specific date
  }
});

const AutomationState = mongoose.model('AutomationState', AutomationStateSchema);
export default AutomationState;
