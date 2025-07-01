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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 bg-background py-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="organic-card p-6">
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
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <Link to={`/product/${item.id}`} className="shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-md"
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
                            <div className="flex items-center border rounded-md">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 rounded-none"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="flex items-center justify-center w-10 h-8 text-sm">
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
                        
                        <div className="text-right min-w-[100px]">
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
                <div className="organic-card p-6 sticky top-4">
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
      
      <Footer />
    </div>
  );
};

export default CartPage;
