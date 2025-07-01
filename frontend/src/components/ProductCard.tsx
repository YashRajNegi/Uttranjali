import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Leaf, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/services/api';

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
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link to={`/product/${product._id}`} className="block relative">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.isOrganic && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                Organic
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="bg-red-500 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          <Button
            size="icon"
            variant="secondary"
            className={`absolute top-2 right-2 rounded-full ${
              isWishlisted ? 'bg-red-100 text-red-500' : 'bg-white/80 hover:bg-white'
            }`}
            onClick={handleWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
          
          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          )}
          
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded text-sm">
                <span className="font-medium mr-1">{product.rating.toFixed(1)}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              {product.numReviews > 0 && (
                <span className="text-sm text-gray-500">
                  ({product.numReviews.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              ₹{displayPrice.toFixed(2)}
            </span>
            {discountPercentage > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {product.countInStock === 0 ? (
            <Badge variant="secondary" className="w-full justify-center py-2">Out of Stock</Badge>
          ) : (
            isInCart ? (
              <Button
                className="w-full bg-organic-primary hover:bg-organic-dark text-white flex items-center justify-center gap-2 py-6"
                onClick={e => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
              >
                <ShoppingCart className="w-4 h-4" />
                Go to Cart
              </Button>
            ) : (
              <Button 
                className="w-full bg-organic-primary hover:bg-organic-dark text-white flex items-center justify-center gap-2 py-6"
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
                {product.countInStock < 10 && (
                  <span className="text-xs">({product.countInStock} left)</span>
                )}
              </Button>
            )
          )}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
