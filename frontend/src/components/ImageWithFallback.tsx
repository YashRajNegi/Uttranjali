import React, { useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className = '', 
  size = 'sm' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-md flex items-center justify-center border border-gray-200`}>
        <ImageIcon className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} object-cover rounded-md transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default ImageWithFallback;
