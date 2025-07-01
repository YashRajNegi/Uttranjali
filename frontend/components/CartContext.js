import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast'; // Assuming this is a custom toast component

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart items to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const getItemId = (item) => {
    return (item?._id || item?.id)?.toString();
  };

  // Add item to cart
  const addItem = (item) => {
    const itemId = getItemId(item);
    console.log("🚀 ~ Adding item to cart:", item);
    console.log("🆔 ~ itemId:", itemId);
  
    setItems((currentItems) => {
      const existingItem = currentItems.find(i => getItemId(i) === itemId);
      console.log("📦 ~ Existing item in cart:", existingItem);
  
      if (existingItem) {
        const updatedItems = currentItems.map(i =>
          getItemId(i) === itemId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
        toast({
          title: "Item Updated",
          description: `${item.name} quantity increased.`,
        });
        return updatedItems;
      } else {
        const itemToAdd = { ...item, quantity: item.quantity || 1 };
        toast({
          title: "Item Added",
          description: `${item.name} added to your cart.`,
        });
        return [...currentItems, itemToAdd];
      }
    });
  };
  
  

  // Remove item from cart
  const removeItem = (id) => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find(i => getItemId(i) === id);
      if (itemToRemove) {
        toast({
          title: "Item removed",
          description: `${itemToRemove.name} removed from your cart.`,
        });
      }
      return currentItems.filter(item => getItemId(item) !== id);
    });
  };

  // Update item quantity in cart
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map(item =>
        getItemId(item) === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  // Calculate total item count
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    total
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
