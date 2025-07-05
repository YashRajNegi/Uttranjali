import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Leaf, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/services/api';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addItem, items } = useCart();
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const navigate = useNavigate();

  // Check if product is in cart
  const isInCart = items.some(item => item.id === product._id);

  // Calculate discount if discountedPrice exists
  const discountPercentage = product.discountedPrice && product.price > product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountedPrice || product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product._id,
      name: product.name,
      price: displayPrice,
      image: product.image,
      quantity: 1,
      category: product.category
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-2 sm:p-4 flex flex-col h-full overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <div className="w-full aspect-square mb-2 sm:mb-4 flex items-center justify-center overflow-hidden rounded-lg relative group">
        <motion.img 
          src={product.image} 
          alt={product.name} 
          className="object-cover w-full h-full max-h-48 sm:max-h-56"
          variants={imageVariants}
          whileHover="hover"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
            className="absolute top-2 left-2"
          >
            <Badge className="bg-red-500 text-white text-xs">
              <Percent className="w-3 h-3 mr-1" />
              {discountPercentage}% OFF
            </Badge>
          </motion.div>
        )}

        {/* Wishlist Button */}
        <motion.button
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          onClick={handleWishlist}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </motion.button>

        {/* Quick Add to Cart Button */}
        <motion.div
          className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
        >
          <motion.button
            className="w-full bg-organic-primary text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-organic-dark transition-colors"
            onClick={handleAddToCart}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </motion.button>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <motion.h3 
            className="text-base sm:text-lg font-semibold mb-1 truncate cursor-pointer hover:text-organic-primary transition-colors"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/product/${product._id}`)}
          >
            {product.name}
          </motion.h3>
          
          <motion.p 
            className="text-xs sm:text-sm text-muted-foreground mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {product.brand}
          </motion.p>
          
          <motion.div 
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-sm sm:text-base font-bold text-organic-primary">
              ₹{displayPrice.toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </motion.div>

          {/* Rating */}
          <motion.div 
            className="flex items-center gap-1 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(4.0)</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="w-full py-2 mt-2 text-sm sm:text-base bg-organic-primary text-white rounded-lg font-medium hover:bg-organic-dark transition-colors"
            onClick={handleAddToCart}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
