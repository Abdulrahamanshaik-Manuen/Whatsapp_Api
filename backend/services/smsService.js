export const sendOTP = async (phone, otp) => {
    // Current Strategy: Console Printing
    console.log("-----------------------------------------");
    console.log(`📲 SMS SERVICE: Sending OTP to ${phone}`);
    console.log(`🔢 CODE: ${otp}`);
    console.log("-----------------------------------------");

    // Integration points for later:
    // 1. Firebase Admin SDK
    // 2. Twilio API
    // 3. Fast2SMS / Msg91
    
    return true;
};
