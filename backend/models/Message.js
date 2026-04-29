import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true // Meta WhatsApp message ID
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  type: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  text: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'received'],
    default: 'sent'
  },
  attachments: [{
    type: {
      type: String, // 'image', 'document', 'video', etc.
    },
    url: String,
    name: String,
    size: String,
    mediaId: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
