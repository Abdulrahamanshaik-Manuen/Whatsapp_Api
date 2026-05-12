import mongoose from 'mongoose';

const AutomationLogSchema = new mongoose.Schema({
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  nodeId: {
    type: String,
    required: true
  },
  nodeType: String,
  status: {
    type: String,
    enum: ['success', 'error', 'paused'],
    default: 'success'
  },
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  errorMessage: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AutomationLog = mongoose.model('AutomationLog', AutomationLogSchema);
export default AutomationLog;
