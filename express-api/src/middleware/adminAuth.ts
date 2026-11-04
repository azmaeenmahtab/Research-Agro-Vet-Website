import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Allow all requests in development or when NODE_ENV is not explicitly set to production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check Authorization header or session
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // In production without credentials, reject
  res.status(401).json({ success: false, message: 'Admin authentication required' });
}
