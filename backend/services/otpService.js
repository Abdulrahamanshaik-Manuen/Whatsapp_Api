import Otp from '../models/Otp.js';

export const generateOTP = (phone) => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    return { phone, otp, expires_at };
};

export const verifyOTP = async (phone, otp) => {
    const otpRecord = await Otp.findOne({ phone }).sort({ expires_at: -1 });

    if (!otpRecord) {
        return { success: false, message: "OTP expired or not found" };
    }

    if (otpRecord.attempts >= 3) {
        return { success: false, message: "Maximum attempts exceeded. Please request a new OTP." };
    }

    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return { success: false, message: "Invalid OTP" };
    }

    // Mark as verified but don't delete yet (needed for registration check)
    otpRecord.is_verified = true;
    await otpRecord.save();

    return { success: true, message: "OTP verified successfully" };
};
