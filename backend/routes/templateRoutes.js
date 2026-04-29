import express from 'express';
import {
    createTemplate,
    getAllTemplate,
    getTemplateById,
    editTemplate,
    deleteTemplate
} from '../controllers/templateController.js';

const router = express.Router();

router.post('/', createTemplate);
router.get('/', getAllTemplate);
router.get('/:id', getTemplateById);
router.put('/:id', editTemplate);
router.delete('/:id', deleteTemplate);

export default router;
