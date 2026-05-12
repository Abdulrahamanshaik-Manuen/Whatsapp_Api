import express from 'express';
import { 
  getAutomations, 
  createAutomation, 
  getAutomationById, 
  updateAutomation, 
  deleteAutomation 
} from '../controllers/automationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(verifyToken, getAutomations)
  .post(verifyToken, createAutomation);

router.route('/:id')
  .get(verifyToken, getAutomationById)
  .put(verifyToken, updateAutomation)
  .delete(verifyToken, deleteAutomation);

export default router;
