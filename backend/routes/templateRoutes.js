import express from 'express';
import multer from 'multer';
import {
    createTemplate,
    getAllTemplate,
    getTemplateById,
    editTemplate,
    deleteTemplate,
    submitTemplateToMeta,
    uploadMediaToMeta,
    syncMetaStatuses
} from '../controllers/templateController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/', createTemplate);
router.post('/upload-media', upload.single('file'), uploadMediaToMeta);
router.post('/sync-meta-status', syncMetaStatuses);
router.post('/:id/submit-to-meta', submitTemplateToMeta);
router.get('/', getAllTemplate);
router.get('/:id', getTemplateById);
router.put('/:id', editTemplate);
router.delete('/:id', deleteTemplate);

export default router;
