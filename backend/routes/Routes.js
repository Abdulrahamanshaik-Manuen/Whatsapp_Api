import express from 'express';
import contactRoutes from './contactRoutes.js';
import templateRoutes from './templateRoutes.js';
import messageRoutes from './messageRoutes.js';
import webhookRoutes from './webhookRoutes.js';

const router = express.Router();

router.use('/contacts', contactRoutes);
router.use('/templates', templateRoutes);
router.use('/messages', messageRoutes);
router.use('/webhook', webhookRoutes);

export default router;
