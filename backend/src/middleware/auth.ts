// src/middleware/auth.ts

import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types/AuthRequest';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware - checking authorization');
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('Authorization header found:', authHeader.substring(0, 20) + '...');
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      console.log('No token found after Bearer prefix removal');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      console.log('Verifying token...');
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log('Token verified, looking up user...');
      
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found:', { id: user._id, role: user.role });
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ 
        message: 'Token is not valid',
        error: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error'
      });
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
    console.log('Admin middleware - checking permissions');
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log('Checking admin role for user:', { id: req.user._id, role: req.user.role });
    
    if (req.user.role !== 'admin') {
      console.log('User is not an admin');
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    console.log('Admin access granted');
    next();
  } catch (error) {
    console.error('Server error in admin middleware:', error);
    res.status(500).json({ 
      message: 'Server error in admin middleware',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
