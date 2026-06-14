import mongoose from 'mongoose';

// A conversation thread between 2+ users
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['direct', 'group', 'announcement'],
      default: 'direct',
    },
    // For group / announcement threads
    name:       { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course',     default: null },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessage:{
      text:      String,
      sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: Date,
    },
    // Unread counts per participant
    unreadCount: [
      {
        user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text:    { type: String, default: '' },
    type:    { type: String, enum: ['text', 'file', 'image', 'system'], default: 'text' },
    fileUrl: { type: String, default: '' },
    isRead:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
export const Message      = mongoose.model('Message', messageSchema);