import express from 'express';
import { 
  getAutomations, 
  createAutomation, 
  updateAutomationStatus, 
  deleteAutomation,
  getGlobalTemplates,
  createGlobalTemplate,
  cloneAutomation,
  seedTemplates
} from '../controllers/automationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAutomations);
router.get('/templates', verifyToken, getGlobalTemplates);
router.post('/', verifyToken, createAutomation);
router.post('/templates', verifyToken, createGlobalTemplate);
router.post('/clone/:id', verifyToken, cloneAutomation);
router.post('/seed', verifyToken, seedTemplates);
router.patch('/:id/status', verifyToken, updateAutomationStatus);
router.delete('/:id', verifyToken, deleteAutomation);

export default router;
