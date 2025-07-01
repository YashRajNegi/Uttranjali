import express from 'express';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/users';
import { auth, admin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Protected routes
router.get('/profile', auth, getUserProfile);
router.put(
  '/profile',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
  ],
  validateRequest,
  updateUserProfile
);

// Admin routes
router.get('/', auth, admin, getUsers);
router.get('/:id', auth, admin, getUserById);
router.put(
  '/:id',
  auth,
  admin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('role').isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  validateRequest,
  updateUser
);
router.delete('/:id', auth, admin, deleteUser);

export default router; 