import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  broadcastAnnouncement,
} from '../controllers/message.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get  ('/conversations',              getConversations);
router.post ('/conversations/direct',       getOrCreateConversation);
router.post ('/conversations/group',        createGroupConversation);
router.get  ('/conversations/:conversationId', getMessages);
router.post ('/',                           sendMessage);
router.delete('/:messageId',                deleteMessage);
router.post ('/announce', authorize('admin'), broadcastAnnouncement);

export default router;