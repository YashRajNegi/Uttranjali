import jwt from 'jsonwebtoken';
import { Document, ObjectId } from 'mongoose';

// Interfaces for JWT payloads
export interface AccessTokenPayload {
  userId: ObjectId;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: ObjectId;
  email: string;
  type: 'refresh';
  sessionId: string; // For session management and token revocation
}

// Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days

/**
 * Generate Access Token (short-lived, 15 minutes)
 * Used for API authentication
 */
export const generateAccessToken = (user: { _id: ObjectId; email: string; role: string }): string => {
  const payload: AccessTokenPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    issuer: 'uttranjali-api',
    audience: 'uttranjali-client'
  } as jwt.SignOptions);
};

/**
 * Generate Refresh Token (long-lived, 7 days)
 * Used to generate new access tokens
 */
export const generateRefreshToken = (user: { _id: ObjectId; email: string }): { token: string; sessionId: string } => {
  // Generate unique session ID for token revocation capability
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  const payload: RefreshTokenPayload = {
    userId: user._id,
    email: user.email,
    type: 'refresh',
    sessionId
  };

  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'uttranjali-api',
    audience: 'uttranjali-client'
  } as jwt.SignOptions);

  return { token, sessionId };
};

/**
 * Verify Access Token
 * Returns decoded payload if valid, throws error if invalid
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    console.log('JWT verification: Token length:', token.length);
    console.log('JWT verification: Using secret:', JWT_ACCESS_SECRET ? 'Secret exists' : 'Missing secret');
    
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'uttranjali-api',
      audience: 'uttranjali-client'
    }) as AccessTokenPayload;

    console.log('JWT verification: Token decoded successfully for userId:', decoded.userId);

    // Ensure token type is access
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error: any) {
    console.log('JWT verification: Error:', error.message);
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Verify Refresh Token
 * Returns decoded payload if valid, throws error if invalid
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'uttranjali-api',
      audience: 'uttranjali-client'
    }) as RefreshTokenPayload;

    // Ensure token type is refresh
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw error;
    }
  }
};

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Get time until token expires (in milliseconds)
 * Useful for proactive token refresh
 */
export const getTokenExpirationTime = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    return Math.max(0, expirationTime - currentTime);
  } catch (error: any) {
    return 0;
  }
};
