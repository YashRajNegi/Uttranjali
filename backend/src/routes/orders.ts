import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} from '../controllers/orders';
import { auth, admin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import dotenv from 'dotenv';
dotenv.config();
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);
const Razorpay = require('razorpay');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Public routes
router.post(
  '/',
  auth,
  [
    body('orderItems').notEmpty().withMessage('Order items are required'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  validateRequest,
  createOrder
);

// Protected routes
router.get('/myorders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/pay', auth, updateOrderToPaid);

// Admin routes
router.get('/', auth, admin, getOrders);
router.put('/:id/deliver', auth, admin, updateOrderToDelivered);
router.put('/:id/status', auth, admin, [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validateRequest,
], updateOrderStatus);

// Razorpay order creation endpoint
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router; 