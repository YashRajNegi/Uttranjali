import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
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

  // Mobile sticky header
  const MobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center h-14 px-4 shadow-sm">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-bold flex-1 text-center">My Cart</h1>
      <span className="w-8" />
    </div>
  );

  // Mobile sticky bottom bar
  const MobileBottomBar = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-4 flex flex-col gap-2 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold">₹{orderTotal.toFixed(2)}</span>
      </div>
      <Button className="w-full bg-organic-primary hover:bg-organic-dark py-4 text-lg" onClick={handleProceedToCheckout}>
        Proceed to Checkout
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MobileHeader />
      <Navbar className="hidden md:block" />
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
          
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-organic-primary/10 mb-4">
                <ShoppingBag className="h-8 w-8 text-organic-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button 
                className="bg-organic-primary hover:bg-organic-dark"
                asChild
              >
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="organic-card p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Cart Items ({items.length})</h2>
                    <Button 
                      variant="link"
                      onClick={clearCart}
                      className="text-destructive p-0 h-auto"
                    >
                      Clear Cart
                    </Button>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <Link to={`/product/${item.id}`} className="shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                          />
                        </Link>
                        
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 rounded-none"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="flex items-center justify-center w-8 sm:w-10 h-8 text-sm">
                                {item.quantity}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 rounded-none"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right min-w-[80px] sm:min-w-[100px]">
                          {item.discountedPrice ? (
                            <>
                              <div className="font-medium text-lg text-green-600">
                                ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground line-through">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-xs text-green-600">
                                Save ₹{((item.price - item.discountedPrice) * item.quantity).toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="font-medium text-lg">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground mt-1">
                            ₹{(item.discountedPrice || item.price).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-between">
                    <Link 
                      to="/products" 
                      className="text-muted-foreground hover:text-organic-primary flex items-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="organic-card p-3 sm:p-4 md:p-6 sticky top-4">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings</span>
                        <span className="font-medium">-₹{savings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-organic-primary font-medium">Free</span>
                        ) : (
                          <span className="font-medium">₹{shipping.toFixed(2)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <div className="text-right">
                      <span>₹{orderTotal.toFixed(2)}</span>
                      {savings > 0 && (
                        <div className="text-sm font-normal text-green-600">
                          You save ₹{savings.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-organic-primary hover:bg-organic-dark py-6 text-lg"
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Secure checkout powered by Stripe
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileBottomBar />
      <Footer className="hidden md:block" />
    </div>
  );
};

export default CartPage;
