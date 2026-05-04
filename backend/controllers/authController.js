import User from '../models/User.js';
import Otp from '../models/Otp.js';
import BusinessProfile from '../models/BusinessProfile.js';
import mongoose from 'mongoose';
import * as otpService from '../services/otpService.js';
import * as smsService from '../services/smsService.js';
import jwt from 'jsonwebtoken';

export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: "Phone number is required" });

        const otpData = otpService.generateOTP(phone);
        
        // Save to DB
        await Otp.create(otpData);

        // Send via SMS Service (Console)
        await smsService.sendOTP(phone, otpData.otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Send OTP Error:", err);
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
        console.error("Verify OTP Error:", err);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};

export const register = async (req, res) => {
    try {
        const { name, phone, password, businessData } = req.body;
        if (!name || !phone || !password) return res.status(400).json({ error: "All fields are required" });

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

        res.status(201).json({ 
            message: "User and Business Profile registered successfully", 
            user: { id: user._id, name: user.name, phone: user.phone } 
        });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Registration failed", message: err.message, stack: err.stack });
    }
};

export const login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) return res.status(400).json({ error: "Phone and password are required" });

        const user = await User.findOne({ phone });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign(
            { user_id: user._id, phone: user.phone },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        // Check if onboarding is completed
        let hasProfile = false;
        try {
            const profile = await BusinessProfile.findOne({ user_id: user._id });
            hasProfile = !!profile;
        } catch (profileErr) {
            console.error("Profile Check Error:", profileErr);
        }

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { id: user._id, name: user.name, phone: user.phone },
            hasProfile
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Login failed", message: err.message });
    }
};
