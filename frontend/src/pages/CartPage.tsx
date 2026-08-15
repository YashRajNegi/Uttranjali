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
    <div className="min-h-screen flex flex-col bg-background ">
      <MobileHeader itemsCount={items.length} />
      <Navbar />
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0 pb-20 md:pb-0">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6 ">
            Your Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16 ">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-organic-primary/10 mb-4 ">
                <ShoppingBag className="w-8 h-8 text-organic-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Link to="/products">
                <Button className="bg-organic-primary hover:bg-organic-dark text-white transition-colors">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 ">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            ₹{(item.discountedPrice || item.price).toFixed(2)}
                          </p>
                          {item.discountedPrice && (
                            <p className="text-xs text-red-600 line-through">
                              ₹{item.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Link to="/products" className="flex items-center text-organic-primary hover:underline text-sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 sticky top-24">
                  <h2 className="text-xl font-semibold">Order Summary</h2>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal?.toFixed(2) ?? total.toFixed(2)}</span>
                    </div>

                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings</span>
                        <span>- ₹{savings.toFixed(2)}</span>
                      </div>
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
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{orderTotal.toFixed(2)}</span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Free shipping on orders over ₹499
                    </p>
                  )}

                  <Button
                    className="w-full bg-organic-primary hover:bg-organic-dark py-4 text-lg transition-colors"
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomBar items={items} orderTotal={orderTotal} handleProceedToCheckout={handleProceedToCheckout} />
    </div>
  );
};

// Mobile sticky header component
interface MobileHeaderProps {
  itemsCount: number;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ itemsCount }) => (
  <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center h-14 px-4 shadow-sm ">
    <div className="flex items-center">
      <Link to="/products" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </Link>
      <h1 className="text-lg font-semibold">Cart ({itemsCount || 0})</h1>
    </div>
  </div>
);

// Mobile sticky bottom bar component  
interface MobileBottomBarProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    image: string;
    quantity: number;
    category: string;
  }>;
  orderTotal: number;
  handleProceedToCheckout: () => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ items, orderTotal, handleProceedToCheckout }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-4 flex flex-col gap-2 shadow-lg ">
    <div className="flex justify-between items-center">
      <div>
        <div className="text-sm text-gray-600">Total</div>
        <div className="text-lg font-bold">₹{orderTotal.toFixed(2)}</div>
      </div>
      <Button
        onClick={handleProceedToCheckout}
        className="bg-organic-primary hover:bg-organic-dark text-white transition-colors"
        disabled={items.length === 0}
      >
        Checkout
      </Button>
    </div>
  </div>
);

export default CartPage;