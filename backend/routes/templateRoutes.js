import express from 'express';
import * as templateController from '../controllers/templateController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── ADMIN ROUTES ─────────────────────────────────────────────────────────────
// All routes starting with /admin require admin role
router.post('/admin', verifyToken, isAdmin, templateController.createTemplate);
router.get('/admin', verifyToken, isAdmin, templateController.getAdminTemplates);
router.put('/admin/:id', verifyToken, isAdmin, templateController.updateTemplate);
router.delete('/admin/:id', verifyToken, isAdmin, templateController.deleteTemplate);
router.post('/admin/:id/submit', verifyToken, isAdmin, templateController.submitToMeta);
router.get('/admin/:id/sync', verifyToken, isAdmin, templateController.syncTemplateStatus);

// ── CLIENT ROUTES ───────────────────────────────────────────────────────
router.get('/', verifyToken, templateController.getClientTemplates);
router.post('/request', verifyToken, templateController.requestCustomTemplate);

export default router;
