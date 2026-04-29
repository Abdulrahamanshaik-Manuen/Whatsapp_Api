import express from 'express';
import {
    getMessages,
    sendMessage
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/:contactId', getMessages);
router.post('/send', sendMessage);

export default router;
