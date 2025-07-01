import React from 'react';
import Link from 'next/link';
import { Trash2, ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/CartContext';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  // Calculate shipping and tax
  const shipping = total > 50 ? 0 : 5.99;
  const tax = total * 0.05; // 5% tax
  const orderTotal = total + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-background py-8">
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
              <Button className="bg-organic-primary hover:bg-organic-dark" asChild>
                <Link href="/products">Continue Shopping</Link>
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

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item._id || item.id || index} className="flex items-center gap-4">
                        <Link href={`/product/${item._id || item.id}`} className="shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </Link>

                        <div className="flex-grow">
                          <Link
                            href={`/product/${item._id || item.id}`}
                            className="font-medium hover:text-organic-primary transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>

                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
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
                            onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                            className="h-8 w-8 rounded-none"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item._id || item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between">
                    <Link
                      href="/products"
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
                <div className="organic-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                  <Separator className="mb-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-organic-primary">Free</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>

                  <Button className="w-full mt-6 bg-organic-primary hover:bg-organic-dark" asChild>
                    <Link href="/checkout">Proceed to Checkout</Link>
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
    </div>
  );
};

export default Cart;
