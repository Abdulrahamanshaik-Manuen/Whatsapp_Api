import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireActiveSubscription } from '../middlewares/subscriptionMiddleware.js';
import { previewCampaign, createCampaign, getCampaignStatus, getCampaigns } from '../controllers/campaignController.js';

const router = express.Router();

router.post('/preview', verifyToken, requireActiveSubscription, previewCampaign);
router.post('/', verifyToken, requireActiveSubscription, createCampaign);
router.get('/', verifyToken, getCampaigns);
router.get('/:id', verifyToken, getCampaignStatus);

export default router;
