import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const leafVariants = {
    animate: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        variants={leafVariants}
        animate="animate"
      >
        {/* Background pulse */}
        <motion.div
          className={`absolute inset-0 bg-organic-primary/20 rounded-full`}
          variants={pulseVariants}
          animate="animate"
        />
        
        {/* Main leaf icon */}
        <div className={`relative ${sizeClasses[size]} bg-organic-primary/10 rounded-full flex items-center justify-center`}>
          <Leaf className={`${sizeClasses[size]} text-organic-primary`} />
        </div>
      </motion.div>
      
      {text && (
        <motion.p
          className={`mt-4 text-organic-primary font-medium ${textSizes[size]}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

// Spinner variant
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-organic-primary/20 border-t-organic-primary rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// Dots variant
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dotVariants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-organic-primary rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: index * 0.2 }}
        />
      ))}
    </div>
  );
};

// Skeleton loader
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export default Loading; 