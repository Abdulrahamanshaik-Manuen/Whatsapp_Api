import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', verifyToken, getDashboardStats);

export default router;
