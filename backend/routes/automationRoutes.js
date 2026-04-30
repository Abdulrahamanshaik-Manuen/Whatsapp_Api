import express from 'express';
import {
  createFlow,
  getAllFlows,
  getFlowById,
  updateFlow,
  deleteFlow
} from '../controllers/automationController.js';

const router = express.Router();

router.post('/', createFlow);
router.get('/', getAllFlows);
router.get('/:id', getFlowById);
router.put('/:id', updateFlow);
router.delete('/:id', deleteFlow);

export default router;
