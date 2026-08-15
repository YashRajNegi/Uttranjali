// src/middleware/auth.ts

import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types/AuthRequest';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwtUtils';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        code: 'TOKEN_MISSING'
      });
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = user;
      next();
    } catch (jwtError: any) {
      console.error('Access token verification failed:', jwtError);
      if (jwtError.message === 'Token expired') {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.message === 'Invalid token') {
        return res.status(401).json({ 
          message: 'Invalid access token',
          code: 'TOKEN_INVALID'
        });
      } else {
        return res.status(401).json({ 
          message: 'Token verification failed',
          code: 'TOKEN_ERROR',
          error: jwtError.message
        });
      }
    }
  } catch (error) {
    console.error('Server error in auth middleware:', error);
    res.status(500).json({ 
      message: 'Server error in auth middleware',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const admin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    
    if (!req.user) {

      return res.status(401).json({ message: 'Not authenticated' });
    }


    
    if (req.user.role !== 'admin') {

      return res.status(403).json({ message: 'Not authorized as admin' });
    }


    next();
  } catch (error) {
    console.error('Server error in admin middleware:', error);
    res.status(500).json({ 
      message: 'Server error in admin middleware',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
