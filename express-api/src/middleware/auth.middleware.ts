import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

/**
 * requireAdmin Middleware
 *
 * Verifies Better Auth session from incoming headers (supporting both cross-domain
 * Authorization: Bearer <token> headers and standard session cookies).
 * Ensures that the authenticated user possesses the 'admin' role.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Convert Express Node.js headers to Fetch-compliant Headers for Better Auth
    const headers = fromNodeHeaders(req.headers);

    // 2. Fetch and validate session using Better Auth API
    const sessionData = await auth.api.getSession({
      headers,
    });

    // 3. Reject if session is missing or invalid -> 401 Unauthorized
    if (!sessionData || !sessionData.session || !sessionData.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing or invalid authentication token',
      });
    }

    // 4. Check user role -> 403 Forbidden if not admin
    const role = (sessionData.user.role || '').toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin access required',
      });
    }

    // 5. Attach authenticated user and session to the Express request
    req.user = sessionData.user;
    req.session = sessionData.session;

    return next();
  } catch (error: any) {
    console.error('[requireAdmin middleware error]:', error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

