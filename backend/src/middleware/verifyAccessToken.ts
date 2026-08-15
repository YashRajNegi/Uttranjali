import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwtUtils';
import User from '../models/User';

/**
 * Extended Request interface to include authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify Access Token
 * 
 * Process:
 * 1. Extract token from Authorization header
 * 2. Verify token signature and expiration
 * 3. Attach user info to request object
 * 4. Continue to next middleware/route handler
 * 
 * If token is invalid/expired, returns 401 Unauthorized
 */
export const verifyAccessTokenMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Step 1: Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Step 2: Verify token signature and expiration
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error: any) {
      // Handle specific token errors
      if (error.message === 'Token expired') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
          code: 'TOKEN_INVALID'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed',
          code: 'TOKEN_ERROR'
        });
      }
    }

    // Step 3: Fetch user from database to ensure user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Step 4: Attach user info to request object
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Access token middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware to verify Access Token and check user role
 * Useful for role-based access control
 */
export const verifyAccessTokenWithRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // First verify the access token
    verifyAccessTokenMiddleware(req, res, (err?: any) => {
      if (err) {
        // Error already handled by verifyAccessTokenMiddleware
        return;
      }

      // Check if user has required role
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: req.user?.role
        });
      }

      next();
    });
  };
};

/**
 * Middleware to optionally verify Access Token
 * If token is provided and valid, attaches user info
 * If no token or invalid token, continues without user info
 * Useful for routes that work for both authenticated and non-authenticated users
 */
export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role
          };
        }
      } catch (error) {
        // Silently ignore token errors for optional auth
        console.log('Optional auth: Invalid token provided', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};
