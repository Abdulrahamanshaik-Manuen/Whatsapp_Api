import express from 'express';
import * as businessController from '../controllers/businessController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/profile', verifyToken, businessController.createProfile);
router.get('/profile', verifyToken, businessController.getProfile);
router.put('/profile', verifyToken, businessController.updateProfile);

export default router;
