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
    const mailOptions = {
      from: `"AgroChain Registration" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your AgroChain OTP Code',
      text: `Your OTP for AgroChain login/registration is: ${otp}\nThis code is valid for 10 minutes.`
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    // Email sending failed — OTP still saved in DB, debug_otp returned in response
    console.warn('[Mailer] OTP email failed (check EMAIL_USER/EMAIL_PASS):', (err as Error).message);
  }
};

export const sendHandoverQR = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const mailOptions = {
    from: `"AgroChain Logistics" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'AgroChain Warehouse Handover',
    text: `You have a new delivery arriving. Please click the link to confirm handover:\n ${frontendUrl}/warehouse/${token}`
  };
  return transporter.sendMail(mailOptions);
};

export const sendTransportLink = async (email: string, token: string, jobId: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const mailOptions = {
    from: `"AgroChain Logistics Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `AgroChain Transport Job Assignment: #${jobId.substring(0,8).toUpperCase()}`,
    text: `Hello Driver,\n\nYou have been assigned a new transport job on AgroChain.\nPlease click the link below to access your delivery portal, mark pickups, and finalize handovers:\n\n${frontendUrl}/delivery/${token}\n\nSafe travels!\n— AgroChain Logistics`
  };
  return transporter.sendMail(mailOptions);
};
