import express from 'express';
import { getPlans, getSubscriptionStatus, subscribeToPlan, createPlan } from '../controllers/subscriptionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to view plans
router.get('/plans', getPlans);

// Protected routes
router.get('/status', verifyToken, getSubscriptionStatus);
router.post('/subscribe', verifyToken, subscribeToPlan);

// Admin routes
router.post('/plans', verifyToken, createPlan);

export default router;
