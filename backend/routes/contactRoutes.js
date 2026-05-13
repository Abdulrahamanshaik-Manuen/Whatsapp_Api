import express from 'express';
import multer from 'multer';
import {
    getContacts,
    saveContact,
    searchContacts,
    getContactDetails,
    updateContact,
    deleteContact,
    getGroups,
    uploadContacts,
    captureQRConsent
} from '../controllers/contactController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes (No auth required)
router.post('/consent/qr', captureQRConsent);

// Authentication middleware for all subsequent routes
router.use(verifyToken);

// Protected routes (Auth required)
router.get('/groups', getGroups);
router.get('/', getContacts);
router.post('/', saveContact);
router.post('/upload', upload.single('file'), uploadContacts);
router.get('/search/:query', searchContacts);
router.get('/:id', getContactDetails);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
