import User from '../models/User.js';
import Otp from '../models/Otp.js';
import BusinessProfile from '../models/BusinessProfile.js';
import Contact from '../models/Contact.js';
import mongoose from 'mongoose';
import * as otpService from '../services/otpService.js';
import * as smsService from '../services/smsService.js';
import jwt from 'jsonwebtoken';

const validatePhone = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 91 and is 12 digits, take the last 10
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = cleaned.slice(2);
    }

    // Check if exactly 10 digits
    if (cleaned.length !== 10) return { valid: false, error: "Phone number must be exactly 10 digits" };
    
    // Check if starts with 6, 7, 8, or 9
    if (!/^[6-9]/.test(cleaned)) return { valid: false, error: "Phone number must start with 6, 7, 8, or 9" };
    
    return { valid: true, cleaned };
};

export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: "Phone number is required" });

        const validation = validatePhone(phone);
        if (!validation.valid) return res.status(400).json({ error: validation.error });
        
        const fullPhone = `+91${validation.cleaned}`;
        const otpData = otpService.generateOTP(fullPhone);
        
        // Save to DB
        await Otp.create(otpData);

        // Send via SMS Service (Console)
        await smsService.sendOTP(phone, otpData.otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP are required" });

        const result = await otpService.verifyOTP(phone, otp);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        res.status(200).json({ message: result.message });
    } catch (err) {
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};

export const register = async (req, res) => {
    try {
        let { name, phone, password, businessData } = req.body;
        if (!name || !phone || !password) return res.status(400).json({ error: "All fields are required" });

        // Normalize and Validate Phone
        const validation = validatePhone(phone);
        if (!validation.valid) return res.status(400).json({ error: validation.error });
        phone = `+91${validation.cleaned}`;

        // Check if phone was verified
        const otpRecord = await Otp.findOne({ phone, is_verified: true }).sort({ expires_at: -1 });
        if (!otpRecord) {
            return res.status(400).json({ error: "Phone number not verified. Please verify OTP first." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this phone number" });
        }

        // Create User
        const user = new User({ name, phone, password, is_verified: true });
        await user.save();

        // Create Business Profile if provided
        if (businessData) {
            await BusinessProfile.create({
                user_id: user._id,
                ...businessData
            });
        }

        // Cleanup OTP
        await Otp.deleteMany({ phone });

        // Generate JWT for seamless onboarding
        const token = jwt.sign(
            { user_id: user._id, phone: user.phone, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            message: "User registered successfully", 
            token,
            user: { id: user._id, name: user.name, phone: user.phone } 
        });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", message: err.message, stack: err.stack });
    }
};

export const login = async (req, res) => {
    try {
        let { phone, password } = req.body;
        if (!phone || !password) return res.status(400).json({ error: "Phone and password are required" });

        // Normalize and Validate Phone
        const validation = validatePhone(phone);
        if (!validation.valid) return res.status(400).json({ error: validation.error });
        phone = `+91${validation.cleaned}`;

        const user = await User.findOne({ phone });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign(
            { user_id: user._id, phone: user.phone, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        // Check if onboarding is completed
        let hasProfile = false;
        let profile = null;
        try {
            profile = await BusinessProfile.findOne({ user_id: user._id });
            hasProfile = !!profile;
        } catch (profileErr) {
        }

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                phone: user.phone,
                role: user.role,
                email: profile?.email || ''
            },
            hasProfile
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed", message: err.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: "Phone number is required" });

        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ error: "User with this phone number does not exist" });

        const otpData = otpService.generateOTP(phone);
        await Otp.create(otpData);
        await smsService.sendOTP(phone, otpData.otp);

        res.status(200).json({ message: "OTP sent successfully for password reset" });
    } catch (err) {
        res.status(500).json({ error: "Failed to process forgot password request" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { phone, otp, password } = req.body;
        if (!phone || !otp || !password) {
            return res.status(400).json({ error: "Phone, OTP, and new password are required" });
        }

        // Verify OTP
        const result = await otpService.verifyOTP(phone, otp);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }

        // Update Password
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.password = password;
        await user.save();

        // Cleanup OTP
        await Otp.deleteMany({ phone });

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to reset password" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).select('-password').populate('planId');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const business = await BusinessProfile.findOne({ user_id: user._id });
        
        // Count contacts for Audience Reach
        const contactCount = await Contact.countDocuments({ userId: user._id.toString() });

        // Add calculated stats to user object
        const userObj = user.toObject();
        userObj.contacts_count = contactCount;
        userObj.platform_status = user.whatsapp_connected ? 'Optimal' : 'Disconnected';
        userObj.platform_uptime = '99.9%';

        res.json({ user: userObj, business });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user data", message: err.message });
    }
};
