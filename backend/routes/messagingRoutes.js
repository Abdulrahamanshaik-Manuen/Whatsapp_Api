import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireActiveSubscription } from '../middlewares/subscriptionMiddleware.js';
import { 
    sendMessage, 
    sendBulkMessages, 
    getUsageDashboard, 
    getMessages, 
    getConversations, 
    getMessagesByContact, 
    sendReply 
} from '../controllers/messagingController.js';
import Message from '../models/Message.js';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/send', verifyToken, requireActiveSubscription, sendMessage);
router.post('/send-bulk', verifyToken, requireActiveSubscription, sendBulkMessages);
router.post('/reply', verifyToken, requireActiveSubscription, sendReply);
router.get('/', verifyToken, getMessages);
router.get('/conversations', verifyToken, getConversations);
router.get('/conversations/:phone', verifyToken, getMessagesByContact);
router.post('/read/:phone', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const phone = req.params.phone;
        
        await Message.updateMany(
            { user_id: userId, to: phone, direction: 'incoming', status: { $ne: 'read' } },
            { $set: { status: 'read' } }
        );
        
        res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        console.error("Read error:", error);
        res.status(500).json({ error: "Failed to mark as read" });
    }
});
router.get('/dashboard/usage', verifyToken, getUsageDashboard);

import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

// New Upload Route (using Cloudinary)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // 1. Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.path, 'whatsapp_api/inbox');
        
        // 2. Delete local temp file
        fs.unlink(req.file.path, (err) => { 
            if (err) console.error("Error deleting temp file:", err); 
        });

        // 3. Return Cloudinary URL
        res.status(200).json({ url: result.secure_url });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ error: "Failed to upload file to cloud" });
    }
});

export default router;
