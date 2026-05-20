export const sendOTP = async (phone, otp) => {
    // Current Strategy: Console Printing
    console.log(`
==================================================
            🔐 MANUEN SECURITY NODE 🔐
==================================================
  ▶ TARGET PHONE : ${phone}
  ▶ VERIFY CODE  : ${otp}
  ▶ STATUS       : DISPATCHED SUCCESSFULLY
==================================================
`);

    // Integration points for later:
    // 1. Firebase Admin SDK
    // 2. Twilio API
    // 3. Fast2SMS / Msg91
    
    return true;
};
