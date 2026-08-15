# Uttranjali E-Commerce

Welcome to the Uttranjali E-Commerce platform! Explore and discover the beauty, culture, destinations, and experiences of Uttarakhand through our finest organic products.

## Project Structure

This project is divided into two main parts:
- **frontend/**: The React application (built with Vite) that serves the user interface.
- **backend/**: The Node.js/Express server that handles API requests, database interactions, and payment processing.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Razorpay API Keys

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env` and filling in your details (MongoDB, Razorpay keys, etc.).
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env` and filling in your `VITE_RAZORPAY_KEY_ID`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment
This project is configured to deploy the frontend on Vercel. A `vercel.json` file is included in the `frontend` directory to handle Single Page Application (SPA) routing natively.

## Payments
Payments are securely processed through Razorpay. Ensure your Razorpay dashboard has the required payment methods (UPI, Cards, Netbanking) enabled in Test or Live mode.
