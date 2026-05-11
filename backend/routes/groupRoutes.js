import express from 'express';
import * as groupController from '../controllers/groupController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post('/', groupController.createGroup);
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Sub-routes for contact management within groups
router.post('/:id/contacts', groupController.addContactsToGroup);
router.get('/:id/contacts', groupController.getGroupContacts);
router.delete('/:id/contacts', groupController.removeContactFromGroup);
router.post('/:id/consent', groupController.grantGroupConsent);

export default router;
