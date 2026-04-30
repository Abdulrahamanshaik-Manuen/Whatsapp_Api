import express from 'express';
import { createCampaign, getCampaigns, executeCampaign } from '../controllers/campaignController.js';

const router = express.Router();

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.post('/:id/execute', executeCampaign);

export default router;
