import React, { useState, useRef, useEffect } from 'react';
import { getModernImageUrl, generateImageSrcSet } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { original, webp, avif } = getModernImageUrl(src, { width, height, quality });
  const srcSet = generateImageSrcSet(src);

  useEffect(() => {
    if (!priority) return;
    
    const img = new Image();
    img.src = original;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsError(true);
  }, [original, priority]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 rounded" />
      )}
      
      {/* Picture element for modern formats */}
      <picture>
        {avif && (
          <source
            srcSet={generateImageSrcSet(src, [400, 800, 1200].map(w => ({ width: w, format: 'avif', quality })))}
            type="image/avif"
          />
        )}
        {webp && (
          <source
            srcSet={generateImageSrcSet(src, [400, 800, 1200].map(w => ({ width: w, format: 'webp', quality })))}
            type="image/webp"
          />
        )}
        <img
          ref={imgRef}
          src={original}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          className={`transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      </picture>
      
      {/* Error fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
