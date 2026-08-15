// src/models/User.ts

import mongoose, { Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: 'user' | 'admin';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
