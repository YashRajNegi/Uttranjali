import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, X, Heart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ className = '' }) => {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.9,
      transition: {
        duration: 0.1
      }
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    open: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const actions = [
    {
      icon: ShoppingCart,
      label: 'Cart',
      action: () => navigate('/cart'),
      badge: itemCount > 0 ? itemCount : undefined,
      color: 'bg-organic-primary'
    },
    {
      icon: Heart,
      label: 'Wishlist',
      action: () => navigate('/wishlist'),
      color: 'bg-red-500'
    },
    {
      icon: User,
      label: 'Profile',
      action: () => navigate('/profile'),
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 mb-4 flex flex-col items-end space-y-3"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                variants={itemVariants}
                className="flex items-center space-x-3"
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {action.label}
                </motion.div>
                <motion.button
                  className={`relative w-12 h-12 rounded-full ${action.color} text-white shadow-lg flex items-center justify-center`}
                  onClick={action.action}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <action.icon className="w-5 h-5" />
                  {action.badge && (
                    <motion.div
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {action.badge}
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        className="relative w-14 h-14 bg-organic-primary text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={toggleOpen}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-organic-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton; 