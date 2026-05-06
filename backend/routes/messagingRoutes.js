import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { sendMessage, sendBulkMessages, getUsageDashboard } from '../controllers/messagingController.js';

const router = express.Router();

router.post('/messages/send', verifyToken, sendMessage);
router.post('/messages/send-bulk', verifyToken, sendBulkMessages);
router.get('/dashboard/usage', verifyToken, getUsageDashboard);

export default router;
