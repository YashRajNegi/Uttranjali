import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Leaf, Percent } from 'lucide-react';
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
    
    if (!isInCart) {
      const cartItem = {
        id: product._id,
        name: product.name,
        price: displayPrice,
        discountedPrice: product.discountedPrice,
        image: product.image,
        quantity: 1,
        category: product.category
      };
      addItem(cartItem);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="w-full aspect-square mb-2 sm:mb-4 flex items-center justify-center overflow-hidden rounded-lg relative group">
        <img 
          src={product.image} 
          alt={product.name} 
          className="object-cover w-full h-full max-h-48 sm:max-h-56"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white text-xs">
              <Percent className="w-3 h-3 mr-1" />
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          onClick={handleWishlist}
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Quick View Button */}
        <button
          className="absolute bottom-2 left-2 px-2 py-1 bg-organic-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          Quick View
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Organic Badge */}
        {product.isOrganic && (
          <div className="flex items-center gap-1 mb-1">
            <Leaf className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Organic</span>
          </div>
        )}

        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-organic-primary transition-colors">
          <Link to={`/product/${product._id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
            <span className="text-xs sm:text-sm font-medium ml-1">
              {product.rating?.toFixed(1) || '4.0'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
          <span>{product.brand}</span>
          {product.unit && <span>• {product.unit}</span>}
        </div>

        
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ₹{displayPrice.toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`w-full ${isInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-organic-primary hover:bg-organic-dark'}`}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
