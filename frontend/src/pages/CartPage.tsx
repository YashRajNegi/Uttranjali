import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, total, subtotal, savings } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Calculate shipping
  const shipping = total > 499 ? 0 : (total < 200 ? 70 : 50);
  const orderTotal = total + shipping;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
      return;
    }
    navigate('/checkout');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 50,
      transition: {
        duration: 0.3
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

  const emptyCartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Mobile sticky header
  const MobileHeader = () => (
    <motion.div 
      className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center h-14 px-4 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </motion.div>
      <h1 className="text-lg font-bold flex-1 text-center">My Cart</h1>
      <span className="w-8" />
    </motion.div>
  );

  // Mobile sticky bottom bar
  const MobileBottomBar = () => (
    <motion.div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-4 flex flex-col gap-2 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold">₹{orderTotal.toFixed(2)}</span>
      </div>
      <motion.div
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <Button className="w-full bg-organic-primary hover:bg-organic-dark py-4 text-lg" onClick={handleProceedToCheckout}>
          Proceed to Checkout
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MobileHeader />
      <Navbar className="hidden md:block" />
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom">
          <motion.h1 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your Shopping Cart
          </motion.h1>
          
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div 
                key="empty"
                className="text-center py-16"
                variants={emptyCartVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-organic-primary/10 mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ShoppingBag className="h-8 w-8 text-organic-primary" />
                </motion.div>
                <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <motion.div
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    className="bg-organic-primary hover:bg-organic-dark"
                    asChild
                  >
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="cart"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <motion.div 
                    className="organic-card p-3 sm:p-4 md:p-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Cart Items ({items.length})</h2>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="link"
                          onClick={clearCart}
                          className="text-destructive p-0 h-auto"
                        >
                          Clear Cart
                        </Button>
                      </motion.div>
                    </div>
                    
                    <Separator className="mb-4" />
                    
                    <div className="space-y-6">
                      <AnimatePresence>
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: index * 0.1 }}
                            layout
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link to={`/product/${item.id}`} className="shrink-0">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                                />
                              </Link>
                            </motion.div>
                            
                            <div className="flex-grow min-w-0">
                              <Link 
                                to={`/product/${item.id}`}
                                className="font-medium hover:text-organic-primary transition-colors block truncate"
                              >
                                {item.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              
                              <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center border rounded-md overflow-hidden">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="h-8 w-8 rounded-none"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                  <motion.div 
                                    className="flex items-center justify-center w-8 sm:w-10 h-8 text-sm"
                                    key={item.quantity}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {item.quantity}
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="h-8 w-8 rounded-none"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                </div>
                                
                                <motion.div
                                  whileHover={{ scale: 1.2, rotate: 5 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                            
                            <div className="text-right min-w-[80px] sm:min-w-[100px]">
                              {item.discountedPrice ? (
                                <>
                                  <motion.div 
                                    className="font-medium text-lg text-green-600"
                                    key={`${item.id}-${item.quantity}`}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                                  </motion.div>
                                  <div className="text-sm text-muted-foreground line-through">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </div>
                                  <div className="text-xs text-green-600">
                                    Save ₹{((item.price - item.discountedPrice) * item.quantity).toFixed(2)}
                                  </div>
                                </>
                              ) : (
                                <motion.div 
                                  className="font-medium text-lg"
                                  key={`${item.id}-${item.quantity}`}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </motion.div>
                              )}
                              <div className="text-sm text-muted-foreground mt-1">
                                ₹{(item.discountedPrice || item.price).toFixed(2)} each
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex justify-between">
                      <motion.div
                        whileHover={{ x: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link 
                          to="/products" 
                          className="text-muted-foreground hover:text-organic-primary flex items-center transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Continue Shopping
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Order Summary */}
                <motion.div 
                  className="lg:col-span-1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="organic-card p-3 sm:p-4 md:p-6 sticky top-4">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    
                    <Separator className="mb-4" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>

                      {savings > 0 && (
                        <motion.div 
                          className="flex justify-between text-green-600"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <span>Savings</span>
                          <span>-₹{savings.toFixed(2)}</span>
                        </motion.div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `₹${shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>

                      <Separator />

                      <motion.div 
                        className="flex justify-between text-lg font-bold"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <span>Total</span>
                        <span>₹{orderTotal.toFixed(2)}</span>
                      </motion.div>

                      {shipping > 0 && (
                        <motion.p 
                          className="text-sm text-muted-foreground text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        >
                          Free shipping on orders over ₹499
                        </motion.p>
                      )}
                    </div>

                    <motion.div
                      className="mt-6"
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button 
                        className="w-full bg-organic-primary hover:bg-organic-dark py-4 text-lg" 
                        onClick={handleProceedToCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <MobileBottomBar />
    </motion.div>
  );
};

export default CartPage;
