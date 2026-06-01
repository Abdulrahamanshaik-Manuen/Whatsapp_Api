import express from 'express';
import { 
  getAutomations, 
  createAutomation, 
  getAutomationById, 
  updateAutomation, 
  deleteAutomation 
} from '../controllers/automationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireActiveSubscription } from '../middlewares/subscriptionMiddleware.js';

const router = express.Router();

router.route('/')
  .get(verifyToken, getAutomations)
  .post(verifyToken, requireActiveSubscription, createAutomation);

router.route('/:id')
  .get(verifyToken, getAutomationById)
  .put(verifyToken, requireActiveSubscription, updateAutomation)
  .delete(verifyToken, deleteAutomation);

export default router;
