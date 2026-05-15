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
router.get('/automations', adminController.getAllAutomations);
router.get('/billing', adminController.getBillingOverview);

export default router;
