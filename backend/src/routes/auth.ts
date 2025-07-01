import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, validateToken } from '../controllers/auth';
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

// Validate token route
router.get('/validate', validateToken);

export default router; 