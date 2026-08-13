interface SendOtpEmailParams {
  toEmail: string;
  toName: string;
  otp: string;
}

export const sendOtpEmail = async ({ toEmail, toName, otp }: SendOtpEmailParams): Promise<boolean> => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@atttracker.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Attendance Tracker';

  if (!brevoApiKey) {
    console.log(`[DEVELOPMENT MODE] Brevo API Key not configured. Simulated OTP for ${toEmail}: ${otp}`);
    return true;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject: `${otp} is your Password Reset Code - Attendance Tracker`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; background-color: #0a0d14; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #6366f1; margin: 0;">📊 Attendance Tracker</h2>
            </div>
            <p>Hello <strong>${toName}</strong>,</p>
            <p>We received a request to reset your password. Use the following One-Time Password (OTP) to complete the verification process:</p>
            <div style="background-color: #141927; border: 1px solid rgba(255,255,255,0.1); text-align: center; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #818cf8;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8;">This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px;" />
            <p style="font-size: 11px; color: #64748b; text-align: center;">Sent securely via Attendance Tracker & Brevo</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BREVO EMAIL ERROR] Failed to send OTP email:', response.status, errorText);
      return false;
    }

    console.log(`[BREVO EMAIL] Sent OTP email to ${toEmail}, status: ${response.status}`);
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[BREVO EMAIL ERROR] Exception sending OTP email:', err.message);
    return false;
  }
};
