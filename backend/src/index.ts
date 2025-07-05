import dotenv from 'dotenv';
import express from 'express';

// Load environment variables before any other imports
dotenv.config();

import app from './app';
import path from 'path';

console.log('=== RUNNING THE CORRECT BACKEND INDEX.TS ===');

// === Static files (if needed) ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});