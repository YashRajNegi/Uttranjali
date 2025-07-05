import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Leaf, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/services/api';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-lg shadow-md p-2 sm:p-4 flex flex-col h-full transition-transform hover:scale-105 duration-200"
    >
      <div className="w-full aspect-square mb-2 sm:mb-4 flex items-center justify-center overflow-hidden rounded-lg">
        <img src={product.image} alt={product.name} className="object-cover w-full h-full max-h-48 sm:max-h-56" />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{product.brand}</p>
          <p className="text-sm sm:text-base font-bold text-organic-primary mb-2">₹{product.price.toFixed(2)}</p>
        </div>
        <Button className="w-full py-2 mt-2 text-sm sm:text-base">Add to Cart</Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
