import express from 'express';
import authRoutes from './authRoutes.js';
import businessRoutes from './businessRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import messagingRoutes from './messagingRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import contactRoutes from './contactRoutes.js';
import groupRoutes from './groupRoutes.js';
import templateRoutes from './templateRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import automationRoutes from './automationRoutes.js';

const router = express.Router();

// Root route for API health check
router.get('/', (req, res) => {
  res.json({ message: 'WhatsApp API Core is running' });
});

// Authentication and Business Routes
router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/webhook', webhookRoutes);
router.use('/contacts', contactRoutes);
router.use('/groups', groupRoutes);
router.use('/messages', messagingRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/templates', templateRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/automations', automationRoutes);

export default router;
