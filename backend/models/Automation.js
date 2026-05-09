import mongoose from 'mongoose';

const AutomationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['auto-reply', 'keyword', 'flow', 'drip'],
    default: 'auto-reply'
  },
  trigger: {
    event: {
      type: String,
      enum: ['incoming_message', 'keyword_match', 'first_interaction', 'tag_added'],
      required: true
    },
    keywords: [String],
    matchType: {
      type: String,
      enum: ['exact', 'contains'],
      default: 'contains'
    }
  },
  action: {
    messageType: {
      type: String,
      enum: ['text', 'template', 'media'],
      default: 'text'
    },
    content: String,
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template'
    },
    mediaUrl: String
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'draft'],
    default: 'active'
  },
  originalTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation'
  },
  metrics: {
    sentCount: { type: Number, default: 0 },
    lastTriggered: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Automation = mongoose.model('Automation', AutomationSchema);
export default Automation;
