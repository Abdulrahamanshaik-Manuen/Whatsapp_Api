import mongoose from 'mongoose';

const automationFlowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'draft'],
    default: 'draft',
  },
  triggers: [{
    type: String,
  }],
  nodes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metrics: {
    interactions: { type: Number, default: 0 },
    avgResponseTimeMs: { type: Number, default: 0 }
  }
}, { timestamps: true });

const AutomationFlow = mongoose.model('AutomationFlow', automationFlowSchema);
export default AutomationFlow;
