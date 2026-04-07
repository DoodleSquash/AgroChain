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
  const mailOptions = {
    from: `"AgroChain Registration" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your AgroChain OTP Code',
    text: `Your OTP for AgroChain login/registration is: ${otp}\nThis code is valid for 10 minutes.`
  };
  return transporter.sendMail(mailOptions);
};

export const sendHandoverQR = async (email: string, token: string) => {
  const mailOptions = {
    from: `"AgroChain Logistics" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'AgroChain Warehouse Handover',
    text: `You have a new delivery arriving. Please click the link to confirm handover:\n https://agrochain.app/receive-delivery/${token}`
  };
  return transporter.sendMail(mailOptions);
};
