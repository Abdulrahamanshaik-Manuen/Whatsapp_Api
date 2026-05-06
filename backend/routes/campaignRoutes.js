import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { previewCampaign, createCampaign, getCampaignStatus, getCampaigns } from '../controllers/campaignController.js';

const router = express.Router();

router.post('/preview', verifyToken, previewCampaign);
router.post('/', verifyToken, createCampaign);
router.get('/', verifyToken, getCampaigns);
router.get('/:id', verifyToken, getCampaignStatus);

export default router;
