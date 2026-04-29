import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Revoked'],
    default: 'Active',
  },
  scope: {
    type: String,
    enum: ['Full Access', 'Read Only', 'Write Only'],
    default: 'Full Access',
  }
}, { timestamps: true });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
export default ApiKey;
