import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Utility', 'Marketing', 'Authentication'],
    required: true,
  },
  language: {
    type: String,
    default: 'English',
  },
  header: {
    type: {
      type: String,
      enum: ['Text', 'Image', 'Video', 'Audio', 'Document'],
      default: 'Text'
    },
    mediaUrl: { type: String }
  },
  body: {
    type: String,
    required: true,
  },
  footer: {
    type: String,
  },
  buttons: [{
    type: {
      type: String,
      enum: ['reply', 'url', 'call']
    },
    text: { type: String },
    url: { type: String },
    phone: { type: String }
  }],
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
    default: 'Draft',
  }
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
export default Template;
