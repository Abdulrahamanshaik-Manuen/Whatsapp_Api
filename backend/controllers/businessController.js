import BusinessProfile from '../models/BusinessProfile.js';

export const createProfile = async (req, res) => {
    try {
        const { business_name, business_category, business_description, email, address, city, state, country, business_hours, logo_url } = req.body;
        const user_id = req.user.user_id;

        // Check if profile already exists
        const existing = await BusinessProfile.findOne({ user_id });
        if (existing) return res.status(400).json({ error: "Business profile already exists for this user" });

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
            logo_url
        });

        await profile.save();
        res.status(201).json({ message: "Business profile created successfully", profile });
    } catch (err) {
        console.error("Create Profile Error:", err);
        res.status(500).json({ error: "Failed to create business profile" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({ user_id: req.user.user_id });
        if (!profile) return res.status(404).json({ error: "Business profile not found" });
        res.status(200).json(profile);
    } catch (err) {
        console.error("Get Profile Error:", err);
        res.status(500).json({ error: "Failed to fetch business profile" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updated = await BusinessProfile.findOneAndUpdate(
            { user_id: req.user.user_id },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Business profile not found" });
        res.status(200).json({ message: "Profile updated successfully", profile: updated });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ error: "Failed to update business profile" });
    }
};
