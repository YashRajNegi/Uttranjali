import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { sendPasswordResetEmail } from '../services/emailService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from '../utils/jwtUtils';
import RefreshToken from '../models/RefreshToken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate Access Token (short-lived, 15 minutes)
    const accessToken = generateAccessToken(user);
    
    // Generate Refresh Token (long-lived, 7 days) and store in database
    const { token: refreshToken, sessionId } = generateRefreshToken(user);
    
    // Store refresh token in database for revocation capability
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      sessionId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Set refresh token in HttpOnly cookie (secure, sameSite strict)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiresIn: '15m' // Access token expiration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials - OAuth user must use OAuth login' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate Access Token (short-lived, 15 minutes)
    const accessToken = generateAccessToken(user);
    
    // Generate Refresh Token (long-lived, 7 days) and store in database
    const { token: refreshToken, sessionId } = generateRefreshToken(user);
    
    // Store refresh token in database for revocation capability
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      sessionId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Set refresh token in HttpOnly cookie (secure, sameSite strict)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiresIn: '15m' // Access token expiration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Find and revoke the refresh token in database
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
      );
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * Refresh Access Token
 * Called when access token expires
 * Uses refresh token from HttpOnly cookie to generate new access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verify refresh token signature and expiration
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error: any) {
      if (error.message === 'Refresh token expired') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      } else if (error.message === 'Invalid refresh token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'REFRESH_TOKEN_INVALID'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Refresh token verification failed',
          code: 'REFRESH_TOKEN_ERROR'
        });
      }
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or revoked',
        code: 'REFRESH_TOKEN_REVOKED'
      });
    }

    // Get user from stored token
    const user = storedToken.user as any;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: '15m' // Access token expiration
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('Validate token: No token provided, authHeader:', authHeader);
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('Validate token: Token found, length:', token.length);

    // Verify access token using new JWT utilities
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('Validate token: User not found for userId:', decoded.userId);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('Validate token: User found:', user.email);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.log('Validate token: Error:', error.message);
    if (error.message === 'Token expired') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.message === 'Invalid token') {
      return res.status(401).json({ message: 'Token is not valid' });
    } else {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      // Create new user for Google login
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        // No password needed
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = payload.sub;
      await user.save();
    }

    // Generate Access Token (short-lived, 15 minutes)
    const accessToken = generateAccessToken(user);
    
    // Generate Refresh Token (long-lived, 7 days) and store in database
    const { token: refreshToken, sessionId } = generateRefreshToken(user);
    
    // Store refresh token in database for revocation capability
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      sessionId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Set refresh token in HttpOnly cookie (secure, sameSite strict)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiresIn: '15m' // Access token expiration
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}; 