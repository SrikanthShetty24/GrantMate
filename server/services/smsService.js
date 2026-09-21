const axios = require('axios');

const sendOtpSms = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === 'your_fast2sms_key') {
    console.log(`📱 [DEV SMS] OTP for ${phone}: ${otp}`);
    return { success: true, dev: true };
  }

  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'q',
        message: `Your GrantMate OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        flash: 0,
        numbers: phone,
      },
      {
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data?.return) {
      throw new Error(response.data?.message || 'SMS sending failed');
    }

    return response.data;
  } catch (err) {
    console.error('Fast2SMS error:', err.message);
    // Fallback — log OTP to console so flow isn't blocked
    console.log(`📱 [FALLBACK OTP] for ${phone}: ${otp}`);
    return { success: true, fallback: true };
  }
};

module.exports = { sendOtpSms };