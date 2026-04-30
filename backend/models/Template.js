import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'English',
  },
  components: {
    type: Array,
    required: true
  },
  status: {
    type: String,
    default: 'Pending Approval',
  }
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
export default Template;
