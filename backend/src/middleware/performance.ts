import { Request, Response, NextFunction } from 'express';
import { createGzip, createDeflate } from 'zlib';
import { Transform } from 'stream';

// Simple compression middleware using Node.js zlib
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Compression is currently disabled as the custom implementation was sending uncompressed data 
  // with a gzip header, causing ERR_CONTENT_DECODING_FAILED in the browser.
  next();
};

// Security headers middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Allow images from all sources for Razorpay compatibility
  if (req.path.includes('/uploads') || req.path.includes('images')) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src * data: https: res.cloudinary.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com");
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: res.cloudinary.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com");
  }
  
  // Fix for Razorpay Cross-Origin-Opener-Policy issue
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
};

// Caching middleware
export const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheControl = `public, max-age=${duration}`;
    res.set('Cache-Control', cacheControl);
    res.set('ETag', Date.now().toString());
    next();
  };
};

// Simple rate limiting middleware
export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    const userRequests = requests.get(key) || [];
    const validRequests = userRequests.filter((timestamp: number) => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes.`,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(key, validRequests);
    
    // Set rate limit headers
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - validRequests.length).toString());
    res.set('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip detailed monitoring for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    console.log(`🚀 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Log slow requests (>1000ms)
    if (duration > 1000) {
      console.warn('🐌 Slow request detected:', logData);
    }
  });
  
  next();
};

// CORS optimization
export const optimizedCors = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Fast path for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      // Set CORS headers for preflight
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin))) {
        res.set('Access-Control-Allow-Origin', origin);
      }
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Max-Age', '86400'); // 24 hours cache preflight
      return res.status(204).send();
    }
    
    // Log incoming requests for debugging (only for non-OPTIONS)
    console.log(`🌐 CORS Request: ${req.method} ${req.path} from origin: ${origin}`);
    
    // Allow all origins for image requests (needed for Razorpay)
    if (req.path.includes('/uploads') || req.path.includes('images')) {
      res.set('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin || '')) {
      res.set('Access-Control-Allow-Origin', origin || '');
      console.log(`✅ CORS Allowed: ${origin}`);
    } else {
      // For development, allow localhost origins even if not explicitly listed
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.set('Access-Control-Allow-Origin', origin);
        console.log(`✅ CORS Allowed (localhost): ${origin}`);
      } else {
        console.log(`❌ CORS Blocked: ${origin} - Not in allowed origins:`, allowedOrigins);
      }
    }
    
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Credentials', 'true');
    
    // Additional headers for Razorpay compatibility
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    next();
  };
};
