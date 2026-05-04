import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
