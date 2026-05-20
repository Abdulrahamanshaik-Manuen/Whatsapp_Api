import BusinessProfile from '../models/BusinessProfile.js';
import User from '../models/User.js';

const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const createProfile = async (req, res) => {
    try {
        const { 
            business_name, business_category, business_description, email, 
            address, city, state, country, business_hours, logo_url,
            bank_name, account_number, ifsc_code, account_holder_name 
        } = req.body;
        const user_id = req.user.user_id;

        // Check if profile already exists
        const existing = await BusinessProfile.findOne({ user_id });
        if (existing) return res.status(400).json({ error: "Business profile already exists for this user" });

        if (email && !validateEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const profile = new BusinessProfile({
            user_id,
            business_name,
            business_category,
            business_description,
            email,
            address,
            city,
            state,
            country,
            business_hours,
            logo_url,
            bank_name,
            account_number,
            ifsc_code,
            account_holder_name
        });

        await profile.save();
        res.status(201).json({ message: "Business profile created successfully", profile });
    } catch (err) {
        console.error("Create Profile Error:", err);
        res.status(500).json({ error: "Failed to create business profile", message: err.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({ user_id: req.user.user_id });
        if (!profile) return res.status(404).json({ error: "Business profile not found" });
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch business profile" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        if (req.body.email && !validateEmail(req.body.email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (!req.body.business_name) {
            const user = await User.findById(req.user.user_id);
            req.body.business_name = user?.name || 'My Business';
        }
        if (!req.body.business_category) {
            req.body.business_category = 'Other';
        }

        let updated = await BusinessProfile.findOneAndUpdate(
            { user_id: req.user.user_id },
            req.body,
            { new: true }
        );
        if (!updated) {
            updated = new BusinessProfile({
                user_id: req.user.user_id,
                ...req.body
            });
            await updated.save();
        }
        res.status(200).json({ message: "Profile updated successfully", profile: updated });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ error: "Failed to update business profile", message: err.message });
    }
};
