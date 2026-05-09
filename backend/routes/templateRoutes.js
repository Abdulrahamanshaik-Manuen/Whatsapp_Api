import express from 'express';
import multer from 'multer';
import * as templateController from '../controllers/templateController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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
router.get('/sync-all', verifyToken, templateController.syncAllTemplatesFromMeta);
router.post('/request', verifyToken, templateController.requestCustomTemplate);
router.post('/upload-sample', verifyToken, upload.single('file'), templateController.uploadSample);

export default router;
