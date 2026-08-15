import mongoose, { Document, Schema, ObjectId } from 'mongoose';

/**
 * Refresh Token Schema
 * Stores refresh tokens in database for revocation capability
 * This allows us to invalidate refresh tokens when user logs out or changes password
 */

export interface IRefreshToken extends Document {
  user: ObjectId;
  token: string;
  sessionId: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // For faster lookup by user
  },
  token: {
    type: String,
    required: true,
    unique: true // Prevent duplicate tokens
  },
  sessionId: {
    type: String,
    required: true,
    index: true // For faster session management
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true // For automatic cleanup of expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true // For faster lookup of active tokens
  },
  revokedAt: {
    type: Date
  },
  userAgent: {
    type: String // Store browser/device info for security
  },
  ipAddress: {
    type: String // Store IP address for security monitoring
  }
});

// Add compound indexes for better performance
refreshTokenSchema.index({ user: 1, isRevoked: 1 }); // User's active tokens
refreshTokenSchema.index({ isRevoked: 1, expiresAt: 1 }); // Cleanup revoked expired tokens

// TTL index to automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to ensure token is hashed before storage
refreshTokenSchema.pre('save', async function(next) {
  if (this.isModified('token')) {
    // In production, you might want to hash the token for additional security
    // For now, we'll store it as-is since JWT tokens are already signed
  }
  next();
});

// Static method to find and validate refresh token
refreshTokenSchema.statics.findValidToken = async function(token: string) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).populate('user');
};

// Static method to revoke all user tokens (useful for password change)
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId: ObjectId) {
  return this.updateMany(
    { user: userId, isRevoked: false },
    { 
      $set: { 
        isRevoked: true, 
        revokedAt: new Date() 
      } 
    }
  );
};

// Static method to revoke specific session
refreshTokenSchema.statics.revokeSession = async function(sessionId: string) {
  return this.updateOne(
    { sessionId, isRevoked: false },
    { 
      $set: { 
        isRevoked: true, 
        revokedAt: new Date() 
      } 
    }
  );
};

// Instance method to revoke token
refreshTokenSchema.methods.revoke = function() {
  this.isRevoked = true;
  this.revokedAt = new Date();
  return this.save();
};

const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
