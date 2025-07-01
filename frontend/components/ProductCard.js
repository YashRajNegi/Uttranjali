import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("ADDING PRODUCT:", product);

    addItem({
      id: product._id, // ✅ Use unique backend ID
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category
    });
  };

  return (
    <Link href={`/product/${product._id}`} className="group">
      <div className="organic-card overflow-hidden flex flex-col h-full">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.organic && (
            <Badge className="absolute top-2 left-2 bg-organic-primary text-white">
              Organic
            </Badge>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-lg">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{product.category}</p>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
            <Button
              size="sm"
              className="bg-organic-primary hover:bg-organic-dark"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
