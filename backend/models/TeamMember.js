import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Owner', 'Admin', 'Editor', 'Viewer'],
    default: 'Viewer',
  },
  status: {
    type: String,
    enum: ['Active', 'Pending'],
    default: 'Pending',
  },
  avatar: {
    type: String,
  }
}, { timestamps: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;
