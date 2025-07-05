import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 0.98
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Slide transition variant
export const SlideTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  const slideVariants = {
    initial: {
      x: 300,
      opacity: 0
    },
    in: {
      x: 0,
      opacity: 1
    },
    out: {
      x: -300,
      opacity: 0
    }
  };

  const slideTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={slideTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fade transition variant
export const FadeTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  const fadeVariants = {
    initial: {
      opacity: 0
    },
    in: {
      opacity: 1
    },
    out: {
      opacity: 0
    }
  };

  const fadeTransition = {
    duration: 0.3,
    ease: "easeInOut"
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={fadeVariants}
        transition={fadeTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Scale transition variant
export const ScaleTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  const scaleVariants = {
    initial: {
      opacity: 0,
      scale: 0.8
    },
    in: {
      opacity: 1,
      scale: 1
    },
    out: {
      opacity: 0,
      scale: 1.1
    }
  };

  const scaleTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={scaleVariants}
        transition={scaleTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 