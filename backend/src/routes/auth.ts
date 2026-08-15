import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, validateToken, googleAuth, forgotPassword, resetPassword, refreshToken } from '../controllers/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// Logout route
router.post('/logout', logout);

// Refresh token route
router.post('/refresh', refreshToken);

// Validate token route
router.get('/validate', validateToken);

// Google OAuth
router.post('/google', googleAuth);

// Password Reset Routes
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  resetPassword
);

export default router; 