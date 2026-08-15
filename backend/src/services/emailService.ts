import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const mailOptions = {
    from: `"Uttranjali" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset - Uttranjali',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Uttranjali</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #2D5016; padding: 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .content h2 { color: #333333; margin-bottom: 20px; font-size: 24px; }
          .content p { color: #666666; line-height: 1.6; margin-bottom: 20px; }
          .reset-button { display: inline-block; background-color: #2D5016; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .reset-button:hover { background-color: #1F3322; }
          .footer { background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { color: #888888; font-size: 12px; margin: 5px 0; }
          .security-note { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .security-note p { margin: 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UTTRANJALI</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Uttranjali account. Click the button below to set a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            <div class="security-note">
              <p><strong>Security Note:</strong> If you didn't request this password reset, you can safely ignore this email. The link will expire in 1 hour for your security.</p>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2D5016;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>© 2024 Uttranjali. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured. Skipping password reset email.');
      console.log('Reset URL:', resetUrl);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Email could not be sent');
  }
};

export const sendShippingConfirmationEmail = async (email: string, order: any, name: string) => {
  const frontendUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:8080';
  
  const mailOptions = {
    from: `"Uttranjali" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🚚 Your Order #${order._id} Has Been Shipped!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped - Uttranjali</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 25px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .shipping-badge { display: inline-block; background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 8px 16px; border-radius: 25px; font-size: 14px; font-weight: 600; margin-bottom: 25px; text-transform: uppercase; }
          .content h2 { color: #333333; margin-bottom: 20px; font-size: 28px; font-weight: 600; }
          .content p { color: #666666; line-height: 1.6; margin-bottom: 20px; font-size: 16px; }
          .tracking-info { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .tracking-info h3 { color: #1565c0; margin: 0 0 15px 0; font-size: 20px; }
          .tracking-info p { margin: 8px 0; color: #1565c0; font-size: 15px; }
          .cta-button { display: inline-block; background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: 600; margin: 20px 0; text-align: center; }
          .footer { background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { color: #888888; font-size: 13px; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 UTTRANJALI</h1>
          </div>
          <div class="content">
            <div class="shipping-badge">📦 ORDER SHIPPED</div>
            <h2>Great news, ${name}! Your order is on its way! 🎉</h2>
            <p>Your order #${order._id} has been shipped and is making its way to you. We've included all the tracking details below.</p>
            
            <div class="tracking-info">
              <h3>📍 Tracking Information</h3>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Will be available soon'}</p>
              <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || '3-5 business days'}</p>
              <p><strong>Shipping Partner:</strong> ${order.shippingPartner || 'Local delivery partner'}</p>
            </div>

            <div style="text-align: center;">
              <a href="${frontendUrl}/orders/${order._id}" class="cta-button">📊 Track Your Order</a>
            </div>

            <p>Thank you for your patience! We're working hard to get your organic products to you as quickly as possible.</p>
          </div>
          <div class="footer">
            <p>© 2024 Uttranjali. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured. Skipping shipping confirmation email.');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log('✅ Shipping confirmation email sent to', email);
  } catch (error) {
    console.error('❌ Error sending shipping confirmation email:', error);
  }
};

export const sendOrderConfirmationEmail = async (email: string, order: any, name: string) => {
  const frontendUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:8080';
  
  const mailOptions = {
    from: `"Uttranjali" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Uttranjali</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #2D5016 0%, #4a7c2e 100%); padding: 25px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px; }
          .content { padding: 40px 30px; }
          .success-badge { display: inline-block; background: linear-gradient(45deg, #28a745, #20c997); color: white; padding: 8px 16px; border-radius: 25px; font-size: 14px; font-weight: 600; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px; }
          .content h2 { color: #333333; margin-bottom: 20px; font-size: 28px; font-weight: 600; }
          .content p { color: #666666; line-height: 1.6; margin-bottom: 20px; font-size: 16px; }
          .order-info { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #2D5016; }
          .order-info h3 { color: #2D5016; margin: 0 0 15px 0; font-size: 20px; font-weight: 600; }
          .order-info p { margin: 8px 0; color: #555555; font-size: 15px; }
          .order-info strong { color: #2D5016; }
          
          .product-grid { margin: 30px 0; }
          .product-item { background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 20px; transition: all 0.3s ease; }
          .product-item:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1); transform: translateY(-2px); }
          .product-content { display: flex; align-items: center; gap: 20px; }
          .product-image { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }
          .product-details { flex: 1; }
          .product-name { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; text-decoration: none; display: block; }
          .product-name:hover { color: #2D5016; }
          .product-price { font-size: 18px; font-weight: 700; color: #2D5016; margin-bottom: 5px; }
          .product-quantity { font-size: 14px; color: #666; }
          .product-total { font-size: 16px; font-weight: 600; color: #333; text-align: right; min-width: 80px; }
          
          .order-summary { background: linear-gradient(135deg, #2D5016 0%, #4a7c2e 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
          .summary-row:last-child { margin-bottom: 0; }
          .summary-total { font-size: 20px; font-weight: 700; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px; }
          
          .cta-button { display: inline-block; background: linear-gradient(45deg, #2D5016, #4a7c2e); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: 600; margin: 20px 0; text-align: center; transition: all 0.3s ease; }
          .cta-button:hover { background: linear-gradient(45deg, #4a7c2e, #2D5016); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(45,80,22,0.3); }
          
          .footer { background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { color: #888888; font-size: 13px; margin: 8px 0; }
          .help-section { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .help-section p { margin: 0; color: #1565c0; font-size: 15px; }
          
          .track-section { background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left: 4px solid #ff9800; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .track-section p { margin: 0; color: #e65100; font-size: 15px; }
          
          @media only screen and (max-width: 600px) {
            .container { max-width: 100%; }
            .product-content { flex-direction: column; text-align: center; }
            .product-image { margin-bottom: 15px; }
            .product-total { text-align: center; margin-top: 10px; }
            .content { padding: 20px 15px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 UTTRANJALI</h1>
          </div>
          <div class="content">
            <div class="success-badge">✓ Order Confirmed</div>
            <h2>Thank you for your order, ${name}! 🎉</h2>
            <p>Your order has been successfully placed and is being processed with care. We're excited to bring these organic products to your doorstep!</p>
            
            <div class="order-info">
              <h3>📦 Order Information</h3>
              <p><strong>Order Number:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Order Status:</strong> <span style="color: #28a745; font-weight: 600;">✓ Confirmed</span></p>
            </div>

            <h3>🛍️ Your Organic Products</h3>
            <div class="product-grid">
              ${order.orderItems.map((item: any) => {
                const productUrl = `${frontendUrl}/product/${item.product}`;
                const orderUrl = `${frontendUrl}/orders/${order._id}`;
                return `
                  <div class="product-item">
                    <div class="product-content">
                      <img src="${item.image}" alt="${item.name}" class="product-image" onerror="this.src='https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'">
                      <div class="product-details">
                        <a href="${productUrl}" class="product-name">${item.name}</a>
                        <div class="product-price">₹${item.price}</div>
                        <div class="product-quantity">Quantity: ${item.qty}</div>
                      </div>
                      <div class="product-total">
                        ₹${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="order-summary">
              <h3 style="margin: 0 0 20px 0; color: white;">💰 Order Summary</h3>
              <div class="summary-row">
                <span>Items (${order.orderItems.length}):</span>
                <span>₹${order.itemsPrice || order.totalPrice}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>₹${order.shippingPrice || 0}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>₹${order.taxPrice || 0}</span>
              </div>
              <div class="summary-row summary-total">
                <span>Total Amount:</span>
                <span>₹${order.totalPrice}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${frontendUrl}/orders/${order._id}" class="cta-button">📊 Track Your Order</a>
            </div>

            <div class="track-section">
              <p><strong>🚚 Delivery Information:</strong> We'll notify you as soon as your order ships. You can track your order status in real-time by clicking the button above or logging into your Uttranjali account.</p>
            </div>

            <div class="help-section">
              <p><strong>💬 Need Help?</strong> Our customer support team is here for you! Contact us at <strong>support@uttranjali.com</strong> or call <strong>+91 6398204730</strong>. We're available Monday-Saturday, 9 AM - 6 PM.</p>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <strong>Thank you for choosing Uttranjali! 🌱</strong><br>
              Together, we're supporting sustainable farming and healthy living.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Uttranjali. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>🌿 Uttranjali | Your Trusted Organic Partner | Farm Fresh, Delivered Fresh</p>
            <p>
              <a href="${frontendUrl}" style="color: #2D5016; text-decoration: none;">Visit Our Store</a> | 
              <a href="${frontendUrl}/products" style="color: #2D5016; text-decoration: none;">Browse Products</a> | 
              <a href="${frontendUrl}/contact" style="color: #2D5016; text-decoration: none;">Contact Us</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured. Skipping order confirmation email.');
      console.log('Order details:', { orderId: order._id, customer: name, email });
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to', email);
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
  }
};
