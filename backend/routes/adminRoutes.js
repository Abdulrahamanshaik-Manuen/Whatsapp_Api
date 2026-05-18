import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyToken, isAdmin);

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);

// Template Management
router.get('/templates', adminController.getAllTemplates);
router.post('/templates/sync', adminController.syncTemplatesWithMeta);
router.put('/templates/:id/status', adminController.updateTemplateStatus);

router.get('/automation-requests', adminController.getAutomationRequests);
router.get('/automations/requests', adminController.getAutomationRequests); // Alias for cached clients
router.get('/automations', adminController.getAllAutomations);
router.get('/billing', adminController.getBillingOverview);
router.get('/messages', adminController.getAllMessages);

// Plan Management
router.post('/plans', adminController.createPlan);
router.put('/plans/:id', adminController.updatePlan);
router.delete('/plans/:id', adminController.deletePlan);

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
