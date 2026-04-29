import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['Broadcast', 'Sequence'],
    default: 'Broadcast'
  },
  
  // Audience
  audienceType: {
    type: String,
    default: 'Contact Groups'
  },
  groups: [{
    type: String
  }],
  excludeGroups: [{
    type: String
  }],
  tagFilters: [{
    type: String
  }],

  // Template Selection
  templateName: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'English'
  },

  // Scheduling
  sendOption: {
    type: String,
    enum: ['now', 'schedule'],
    default: 'now'
  },
  scheduleDate: {
    type: Date
  },
  scheduleTime: {
    type: String
  },
  timezone: {
    type: String
  },
  recurring: {
    type: String,
    default: 'Does not repeat'
  },

  // Advanced Settings
  senderNumber: {
    type: String
  },
  messageSpeed: {
    type: String,
    default: 'Normal (Recommended)'
  },
  retryFailedMessages: {
    type: Boolean,
    default: true
  },
  campaignPriority: {
    type: String,
    enum: ['Normal', 'High'],
    default: 'Normal'
  },

  // Tracking Options
  trackingOptions: {
    trackDelivery: {
      type: Boolean,
      default: true
    },
    trackRead: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    }
  },

  // Status & Metrics
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed'],
    default: 'draft'
  },
  metrics: {
    audience: {
      type: Number,
      default: 0
    },
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    read: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
