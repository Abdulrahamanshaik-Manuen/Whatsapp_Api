import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { sendMessage, sendBulkMessages, getUsageDashboard, getMessages, getConversations, getMessagesByContact, sendReply } from '../controllers/messagingController.js';

const router = express.Router();

router.post('/messages/send', verifyToken, sendMessage);
router.post('/messages/send-bulk', verifyToken, sendBulkMessages);
router.post('/messages/reply', verifyToken, sendReply);
router.get('/messages', verifyToken, getMessages);
router.get('/conversations', verifyToken, getConversations);
router.get('/conversations/:phone', verifyToken, getMessagesByContact);
router.get('/dashboard/usage', verifyToken, getUsageDashboard);

export default router;
