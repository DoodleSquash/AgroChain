import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[AuthMiddleware] Missing or invalid Bearer token format. Header:', authHeader);
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    console.warn('[AuthMiddleware] Token verification failed for token suffix:', token.slice(-5));
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    return;
  }

  req.user = decoded;
  next();
};
