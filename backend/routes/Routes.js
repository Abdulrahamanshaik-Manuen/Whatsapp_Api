import express from 'express';
import authRoutes from './authRoutes.js';
import businessRoutes from './businessRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';
import webhookRoutes from './webhookRoutes.js';

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

export default router;
