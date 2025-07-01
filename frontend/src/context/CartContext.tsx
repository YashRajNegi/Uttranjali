import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  image: string;
  quantity: number;
  category: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  subtotal: number;
  savings: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('earthEatsCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure all items have valid price values
        const validCart = parsedCart.map((item: CartItem) => ({
          ...item,
          price: Number(item.price) || 0,
          discountedPrice: item.discountedPrice ? Number(item.discountedPrice) : undefined,
          quantity: Number(item.quantity) || 0
        }));
        setItems(validCart);
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        setItems([]);
      }
    }
  }, []);
  
  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('earthEatsCart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    // Ensure price is a valid number
    const validItem = {
      ...item,
      price: Number(item.price) || 0,
      discountedPrice: item.discountedPrice ? Number(item.discountedPrice) : undefined,
      quantity: Number(item.quantity) || 1
    };

    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === validItem.id);
      
      if (existingItem) {
        // Update quantity of existing item
        const updatedItems = currentItems.map(i => 
          i.id === validItem.id ? { ...i, quantity: i.quantity + validItem.quantity } : i
        );
        toast({
          title: "Item updated",
          description: `${validItem.name} quantity updated in your cart.`,
        });
        return updatedItems;
      } else {
        // Add new item to cart
        toast({
          title: "Item added",
          description: `${validItem.name} added to your cart.`,
        });
        return [...currentItems, validItem];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => {
      const itemToRemove = currentItems.find(i => i.id === id);
      if (itemToRemove) {
        toast({
          title: "Item removed",
          description: `${itemToRemove.name} removed from your cart.`,
        });
      }
      return currentItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const itemCount = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  
  // Calculate subtotal (original prices)
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Calculate total (with discounts)
  const total = items.reduce((sum, item) => {
    const price = item.discountedPrice || item.price;
    const quantity = Number(item.quantity) || 0;
    return sum + (Number(price) * quantity);
  }, 0);

  // Calculate total savings
  const savings = subtotal - total;

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    total,
    subtotal,
    savings
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
