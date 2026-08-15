import { Request, Response, NextFunction } from 'express';

// Image optimization middleware
export const imageOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set image optimization headers
  res.setHeader('Accept-CH', 'DPR, Viewport-Width, Width');
  res.setHeader('Vary', 'Accept, Accept-Encoding, DPR, Viewport-Width, Width');
  
  // Cache images for 1 year
  if (req.url.includes('/uploads/') || req.url.includes('cloudinary')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
  }
  
  next();
};

// Cloudinary image transformation helper
export const getOptimizedImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
} = {}): string => {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }
  
  const { width, height, quality = 80, format = 'auto', crop = 'limit' } = options;
  
  // Build transformation string
  const transformations = [];
  if (width || height) {
    transformations.push(`${crop}_${width || 'auto'}_${height || 'auto'}`);
  }
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  const transformationString = transformations.join(',');
  
  // Insert transformation into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformationString}/`);
};

// Progressive image loading helper
export const generateImageSrcSet = (baseUrl: string, sizes: number[] = [400, 800, 1200]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

// WebP format detection and fallback
export const getModernImageUrl = (originalUrl: string, options: any = {}) => {
  const webpUrl = getOptimizedImageUrl(originalUrl, { ...options, format: 'webp' });
  const avifUrl = getOptimizedImageUrl(originalUrl, { ...options, format: 'avif' });
  
  return {
    original: getOptimizedImageUrl(originalUrl, options),
    webp: webpUrl,
    avif: avifUrl,
  };
};
