import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Stripe from 'stripe';
import { AuthRequest } from '../types/AuthRequest';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { sendOrderSMS } from '../services/smsService';
import User from '../models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Validate required shippingAddress fields
    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country) {
      return res.status(400).json({ 
        message: 'Shipping address is incomplete',
        received: shippingAddress
      });
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      // Mark as paid immediately if paymentResult is provided (e.g. Razorpay)
      isPaid: !!paymentResult,
      paidAt: paymentResult ? new Date() : undefined,
    });

    const createdOrder = await order.save();
    
    // Send notifications asynchronously to avoid blocking the response
    // Fetch user details for notifications in the background
    User.findById(req.user._id).then(user => {
      if (user) {
        // Send notifications without awaiting them so the user doesn't wait
        sendOrderConfirmationEmail(user.email, createdOrder, user.name).catch(err => 
          // Silently handle email errors in production
          null
        );
        
        if (user.phone) {
          sendOrderSMS(user.phone, createdOrder._id.toString(), totalPrice).catch(err => 
            // Silently handle SMS errors in production
            null
          );
        }
      }
    });
    
    // Return response immediately without waiting for notifications
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 