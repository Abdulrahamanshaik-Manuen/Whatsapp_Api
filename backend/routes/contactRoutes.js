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

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/groups', getGroups);
router.get('/', getContacts);
router.post('/', saveContact);
router.post('/upload', upload.single('file'), uploadContacts);
router.post('/consent/qr', captureQRConsent);
router.get('/search/:query', searchContacts);
router.get('/:id', getContactDetails);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
