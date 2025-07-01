import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Plus, Edit2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { useCart } from '../context/CartContext';
import { useAddress } from '../contexts/AddressContext';
import { toast } from '../components/ui/use-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { orderAPI } from '@/services/orderAPI';
import { displayRazorpay } from '@/services/paymentService';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { addresses, addAddress, updateAddress, getDefaultAddress } = useAddress();
  const [activeTab, setActiveTab] = useState('shipping');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  // Calculate shipping
  const shipping = total > 499 ? 0 : (total < 200 ? 70 : 50);
  const orderTotal = total + shipping;
  
  const defaultAddress = getDefaultAddress();
  
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress && !isAddingNewAddress) {
      toast({
        title: "Please select an address",
        description: "You need to select a delivery address to continue.",
      });
      return;
    }
    setActiveTab('payment');
  };
  
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!items || items.length === 0) {
      toast({
        title: "No items in cart",
        description: "Please add some items to your cart before placing an order.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAddress && !defaultAddress) {
      toast({
        title: "No shipping address",
        description: "Please select a shipping address to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const selectedAddressObj = addresses.find(addr => addr.id === selectedAddress) || defaultAddress;
      if (!selectedAddressObj) throw new Error("No address selected");

      // Create order data
      const orderData = {
        orderItems: items.map(item => ({
          name: item.name,
          qty: Number(item.quantity),
          image: item.image,
          price: Number(item.discountedPrice || item.price),
          product: item.id // The id field is already the MongoDB _id from ProductCard
        })),
        shippingAddress: {
          address: selectedAddressObj.address,
          city: selectedAddressObj.city,
          postalCode: selectedAddressObj.zipCode,
          country: "India"
        },
        paymentMethod: "card",
        itemsPrice: Number(total),
        taxPrice: 0,
        shippingPrice: Number(shipping),
        totalPrice: Number(orderTotal)
      };

      console.log('Cart items:', items);
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      if (!orderData.orderItems || orderData.orderItems.length === 0) {
        throw new Error('No items in order data');
      }

      // Create the order
      const order = await orderAPI.createOrder(orderData);
      
      // Clear the cart only after successful order creation
      clearCart();
      
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase. Your order has been received.",
    });
    
      // Redirect to order confirmation page
      navigate(`/orders/${order._id}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      // Log the response data if available
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      toast({
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "An error occurred while placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newAddress = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      apartment: formData.get('apartment') as string || undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      isDefault: addresses.length === 0,
    };
    
    const addedAddress = addAddress(newAddress);
    setSelectedAddress(addedAddress.id);
    setIsAddingNewAddress(false);
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-background py-8">
        <div className="container-custom max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="organic-card"
              >
                  <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="shipping" className="data-[state=active]:bg-organic-primary data-[state=active]:text-white">
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="data-[state=active]:bg-organic-primary data-[state=active]:text-white">
                    Payment
                  </TabsTrigger>
                </TabsList>
                
                  <TabsContent value="shipping" className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                    
                    {!isAddingNewAddress && !isEditingAddress && (
                      <div className="space-y-4">
                        {addresses.map(address => (
                          <Card 
                            key={address.id}
                            className={`cursor-pointer transition-colors ${
                              selectedAddress === address.id ? 'border-organic-primary' : ''
                            }`}
                            onClick={() => setSelectedAddress(address.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                        <div>
                                  <p className="font-medium">{address.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.address}
                                    {address.apartment && `, ${address.apartment}`}
                                    <br />
                                    {address.city}, {address.state} {address.zipCode}
                                    <br />
                                    Phone: {address.phone}
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditingAddress(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                        </div>
                              {address.isDefault && (
                                <div className="mt-2 text-xs text-organic-primary">
                                  Default Address
                        </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsAddingNewAddress(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      </div>
                    )}
                      
                    {(isAddingNewAddress || isEditingAddress) && (
                      <form onSubmit={isAddingNewAddress ? handleAddNewAddress : undefined} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                      <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" required />
                      </div>
                      <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" required />
                          </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Address</Label>
                          <Input id="address" name="address" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                          <Input id="apartment" name="apartment" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" required />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                            <Input id="state" name="state" required />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input id="zipCode" name="zipCode" required />
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setIsAddingNewAddress(false);
                              setIsEditingAddress(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-organic-primary hover:bg-organic-dark"
                          >
                            Save Address
                          </Button>
                      </div>
                      </form>
                    )}
                      
                    {!isAddingNewAddress && !isEditingAddress && (
                      <div className="mt-6">
                        <Button 
                          onClick={handleContinueToPayment}
                          className="w-full bg-organic-primary hover:bg-organic-dark"
                        >
                          Continue to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                </TabsContent>
                
                <TabsContent value="payment" className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                  <div className="flex flex-col items-center mb-6">
                    {/* Optional: Show payment method icons */}
                    <img src="/payment-methods.png" alt="Payment Methods" style={{ maxWidth: 300, marginBottom: 16 }} />
                    <Button
                      className="bg-organic-primary hover:bg-organic-dark text-white w-full"
                      onClick={async () => {
                        setIsProcessing(true);
                        await displayRazorpay(
                          orderTotal,
                          async (paymentId) => {
                            try {
                              const selectedAddressObj = addresses.find(addr => addr.id === selectedAddress) || defaultAddress;
                              if (!selectedAddressObj) throw new Error("No address selected");

                              const orderData = {
                                orderItems: items.map(item => ({
                                  name: item.name,
                                  qty: Number(item.quantity),
                                  image: item.image,
                                  price: Number(item.discountedPrice || item.price),
                                  product: item.id
                                })),
                                shippingAddress: {
                                  address: selectedAddressObj.address,
                                  city: selectedAddressObj.city,
                                  postalCode: selectedAddressObj.zipCode,
                                  country: "India"
                                },
                                paymentMethod: "razorpay",
                                itemsPrice: Number(total),
                                taxPrice: 0,
                                shippingPrice: Number(shipping),
                                totalPrice: Number(orderTotal),
                                paymentId // Save the Razorpay payment ID
                              };

                              const order = await orderAPI.createOrder(orderData);
                              clearCart();
                              toast({
                                title: "Order placed successfully!",
                                description: "Thank you for your purchase. Your order has been received.",
                              });
                              navigate(`/orders/${order._id}`);
                            } catch (error) {
                              toast({
                                title: "Failed to place order",
                                description: error instanceof Error ? error.message : "An error occurred while placing your order. Please try again.",
                                variant: "destructive"
                              });
                            } finally {
                              setIsProcessing(false);
                            }
                          },
                          (error) => {
                            toast({
                              title: 'Error',
                              description: error,
                              variant: 'destructive',
                            });
                            setIsProcessing(false);
                          }
                        );
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay with Razorpay'
                      )}
                      </Button>
                    </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {items.length} item{items.length !== 1 && 's'} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <span className="absolute -top-2 -right-2 bg-organic-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                              {item.quantity}
                            </span>
                          </div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-organic-primary">Free</span>
                      ) : (
                          <span>₹{shipping.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                      <span className="text-lg">₹{orderTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <div className="text-sm text-muted-foreground mb-2">
                    By placing your order, you agree to our <Link to="/terms" className="text-organic-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-organic-primary hover:underline">Privacy Policy</Link>.
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
    </ProtectedRoute>
  );
};

export default Checkout;
