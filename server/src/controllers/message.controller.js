import { Conversation, Message } from '../models/index.js';
import { User }        from '../models/index.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { io }          from '../index.js';

// ─── Get all conversations for current user ───────────────────────────────────
export const getConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name email avatar role')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });

  // Attach unread count for current user
  const result = conversations.map(conv => {
    const unread = conv.unreadCount.find(
      u => u.user.toString() === req.user._id.toString()
    );
    return { ...conv.toObject(), myUnread: unread?.count || 0 };
  });

  res.status(200).json(new ApiResponse(200, result, 'Conversations fetched'));
};

// ─── Get or create direct conversation ───────────────────────────────────────
export const getOrCreateConversation = async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) throw new ApiError(400, 'recipientId is required');

  const recipient = await User.findById(recipientId);
  if (!recipient) throw new ApiError(404, 'Recipient not found');

  // Check if direct conversation already exists
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.user._id, recipientId], $size: 2 },
  }).populate('participants', 'name email avatar role');

  if (!conversation) {
    conversation = await Conversation.create({
      type:         'direct',
      participants: [req.user._id, recipientId],
      createdBy:    req.user._id,
      unreadCount:  [
        { user: req.user._id,  count: 0 },
        { user: recipientId,   count: 0 },
      ],
    });
    conversation = await conversation.populate('participants', 'name email avatar role');
  }

  res.status(200).json(new ApiResponse(200, conversation, 'Conversation ready'));
};

// ─── Create group / announcement conversation ─────────────────────────────────
export const createGroupConversation = async (req, res) => {
  const { name, type, participantIds, departmentId, courseId } = req.body;

  if (!name || !participantIds?.length) {
    throw new ApiError(400, 'name and participantIds are required');
  }

  // Only admin can create announcements
  if (type === 'announcement' && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admin can create announcement threads');
  }

  const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

  const conversation = await Conversation.create({
    name,
    type:        type || 'group',
    participants: allParticipants,
    department:  departmentId || null,
    course:      courseId     || null,
    createdBy:   req.user._id,
    unreadCount: allParticipants.map(uid => ({ user: uid, count: 0 })),
  });

  await conversation.populate('participants', 'name email avatar role');

  // Notify all participants
  participantIds.forEach(uid => {
    io.to(`user:${uid}`).emit('conversation:new', {
      conversation,
      message: `You were added to "${name}"`,
    });
  });

  res.status(201).json(new ApiResponse(201, conversation, 'Group created'));
};

// ─── Get messages in a conversation ──────────────────────────────────────────
export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isMember = conversation.participants.some(
    p => p.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Message.countDocuments({
    conversation: conversationId,
    isDeletedFor: { $ne: req.user._id },
  });

  const messages = await Message.find({
    conversation: conversationId,
    isDeletedFor: { $ne: req.user._id },
  })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Mark all as read for current user
  await Message.updateMany(
    { conversation: conversationId, isRead: { $ne: req.user._id } },
    { $addToSet: { isRead: req.user._id } }
  );

  // Reset unread count
  await Conversation.updateOne(
    { _id: conversationId, 'unreadCount.user': req.user._id },
    { $set: { 'unreadCount.$.count': 0 } }
  );

  res.status(200).json(
    new ApiResponse(200, {
      messages: messages.reverse(),
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    }, 'Messages fetched')
  );
};

// ─── Send message ─────────────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  const { conversationId, text, type, fileUrl } = req.body;

  if (!conversationId) throw new ApiError(400, 'conversationId is required');
  if (!text && !fileUrl) throw new ApiError(400, 'text or fileUrl is required');

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isMember = conversation.participants.some(
    p => p.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'Not a member of this conversation');

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text:    text    || '',
    type:    type    || 'text',
    fileUrl: fileUrl || '',
    isRead: [req.user._id],
  });

  await message.populate('sender', 'name avatar role');

  // Update conversation lastMessage + increment unread for others
  const otherParticipants = conversation.participants.filter(
    p => p.toString() !== req.user._id.toString()
  );

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: {
      text:      text || '📎 File',
      sender:    req.user._id,
      createdAt: new Date(),
    },
    $inc: Object.fromEntries(
      otherParticipants.map((_, i) => [`unreadCount.${i}.count`, 1])
    ),
  });

  // Emit to conversation room
  io.to(`conv:${conversationId}`).emit('message:new', message);

  // Also emit to each participant's personal room for notification badge
  otherParticipants.forEach(uid => {
    io.to(`user:${uid}`).emit('message:notification', {
      conversationId,
      sender:    { name: req.user.name, avatar: req.user.avatar },
      text:      text || '📎 File',
      createdAt: new Date(),
    });
  });

  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
};

// ─── Delete message for self ──────────────────────────────────────────────────
export const deleteMessage = async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Cannot delete someone else\'s message');
  }

  message.isDeletedFor.push(req.user._id);
  await message.save();

  io.to(`conv:${message.conversation}`).emit('message:deleted', {
    messageId: message._id,
    deletedBy: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, null, 'Message deleted'));
};

// ─── Broadcast announcement (admin only) ─────────────────────────────────────
export const broadcastAnnouncement = async (req, res) => {
  const { title, text, targetRole, departmentId } = req.body;
  if (!title || !text) throw new ApiError(400, 'title and text are required');

  // Find all target users
  const filter = { isActive: true };
  if (targetRole)   filter.role       = targetRole;
  if (departmentId) filter.department = departmentId;

  const users = await User.find(filter).select('_id');
  const userIds = users.map(u => u._id);

  // Add notification to each user's array
  await User.updateMany(
    { _id: { $in: userIds } },
    {
      $push: {
        notifications: {
          $each: [{ title, message: text, type: 'info' }],
          $position: 0,
          $slice: 50, // keep last 50 notifications
        },
      },
    }
  );

  // Emit real-time announcement
  const payload = { title, text, from: req.user.name, createdAt: new Date() };

  if (departmentId) {
    io.to(`dept:${departmentId}`).emit('announcement', payload);
  } else if (targetRole) {
    io.to(`role:${targetRole}`).emit('announcement', payload);
  } else {
    io.emit('announcement', payload); // everyone
  }

  res.status(200).json(
    new ApiResponse(200, { notified: userIds.length }, 'Announcement broadcast')
  );
};