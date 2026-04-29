import express from 'express';
import {
    getMessages,
    sendMessage
} from '../controllers/messageController.js';

import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/:contactId', getMessages);
router.post('/send', upload.array('files'), sendMessage);

export default router;
