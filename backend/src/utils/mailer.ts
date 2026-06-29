import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTP = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"AgroChain" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your AgroChain OTP Code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#16a34a;font-size:28px;margin:0;">🌿 AgroChain</h1>
          </div>
          <div style="background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb;">
            <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Verify your account</h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">Use the OTP below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
            <div style="text-align:center;background:#f0fdf4;border:2px dashed #16a34a;border-radius:8px;padding:20px;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#15803d;">${otp}</span>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    });
    console.log('[Mailer] OTP email sent to', email);
    return { success: true };
  } catch (err) {
    console.warn('[Mailer] OTP email failed:', (err as Error).message);
    return { success: false, error: (err as Error).message };
  }
};

export const sendHandoverQR = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    await transporter.sendMail({
      from: `"AgroChain Logistics" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'AgroChain Warehouse Handover',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h1 style="color:#16a34a;">🌿 AgroChain</h1>
          <p>You have a new delivery arriving.</p>
          <p>Please click the link below to confirm handover:</p>
          <a href="${frontendUrl}/warehouse/${token}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Confirm Handover</a>
        </div>
      `
    });
  } catch (err) {
    console.warn('[Mailer] Handover QR email failed:', (err as Error).message);
  }
};

export const sendTransportLink = async (email: string, token: string, jobId: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    await transporter.sendMail({
      from: `"AgroChain Logistics Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `AgroChain Transport Job Assignment: #${jobId.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h1 style="color:#16a34a;">🌿 AgroChain</h1>
          <p>Hello Driver,</p>
          <p>You have been assigned a new transport job on AgroChain.</p>
          <p>Click the link below to access your delivery portal:</p>
          <a href="${frontendUrl}/delivery/${token}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Open Delivery Portal</a>
          <p style="margin-top:24px;color:#6b7280;font-size:14px;">Safe travels!<br/>— AgroChain Logistics</p>
        </div>
      `
    });
  } catch (err) {
    console.warn('[Mailer] Transport Link email failed:', (err as Error).message);
  }
};
