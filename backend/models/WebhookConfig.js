import mongoose from 'mongoose';

const webhookConfigSchema = new mongoose.Schema({
  payloadUrl: {
    type: String,
    required: true,
  },
  secretToken: {
    type: String,
    required: true,
  },
  isLive: {
    type: Boolean,
    default: true,
  },
  activeEvents: [{
    type: String,
  }],
  deliveryLogs: [{
    eventId: { type: String },
    event: { type: String },
    status: { type: String, enum: ['Success', 'Failed'] },
    code: { type: Number },
    latency: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const WebhookConfig = mongoose.model('WebhookConfig', webhookConfigSchema);
export default WebhookConfig;
