import express from 'express';
import {
    getContacts,
    saveContact,
    searchContacts,
    getContactDetails,
    updateContact,
    deleteContact
} from '../controllers/contactController.js';

const router = express.Router();

router.get('/', getContacts);
router.post('/', saveContact);
router.get('/search/:query', searchContacts);
router.get('/:id', getContactDetails);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
