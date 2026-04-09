import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'agrochain-secret-key-2026';

export const signToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Hashes a password using SHA-256
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};
