import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Plus, Edit2, Loader2, CreditCard, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageWithFallback from '@/components/ImageWithFallback';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { useAddress } from '@/contexts/AddressContext';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full mb-4">
                        <CreditCard className="w-8 h-8 text-organic-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h2>
                      <p className="text-sm text-muted-foreground">Your payment information is encrypted and secure</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-xs font-medium">Secure</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs font-medium">Fast Delivery</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-xs font-medium">Multiple Options</p>
                      </div>
                    </div>

                    <Button
                      className="bg-gradient-to-r from-organic-primary to-emerald-600 hover:from-organic-dark hover:to-emerald-700 text-white w-full h-12 text-lg font-medium shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      onClick={async () => {
                        setIsProcessing(true);
                        
                        await displayRazorpay(
                          orderTotal,
                          async (paymentId) => {
                            try {
                              // Show processing state immediately
                              setIsProcessing(true);
                              
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
                                  address: selectedAddressObj.address + (selectedAddressObj.apartment ? `, ${selectedAddressObj.apartment}` : ''),
                                  city: selectedAddressObj.city,
                                  postalCode: selectedAddressObj.zipCode || '000000',
                                  country: 'India'
                                },
                                paymentMethod: 'razorpay',
                                paymentResult: {
                                  id: paymentId,
                                  status: 'completed',
                                  update_time: new Date().toISOString(),
                                  email_address: 'customer@example.com'
                                },
                                itemsPrice: total,
                                shippingPrice: shipping,
                                totalPrice: orderTotal,
                                taxPrice: 0
                              };

                              const createdOrder = await orderAPI.createOrder(orderData);
                              
                              // Clear cart and navigate immediately for better UX
                              clearCart();
                              navigate(`/orders/${createdOrder._id}`);
                              
                              // Show success toast after navigation
                              toast({
                                title: "Payment Successful",
                                description: "Your order has been placed successfully!",
                              });
                            } catch (error) {
                              // More specific error messages
                              let errorMessage = "Failed to create order after payment. Please contact support.";
                              if (error.response?.data?.message) {
                                errorMessage = error.response.data.message;
                              } else if (error.response?.data) {
                                errorMessage = JSON.stringify(error.response.data);
                              } else if (error.message) {
                                errorMessage = error.message;
                              }
                              
                              toast({
                                title: "Order Failed",
                                description: errorMessage,
                                variant: "destructive"
                              });
                            } finally {
                              setIsProcessing(false);
                            }
                          },
                          (error) => {
                            toast({
                              title: "Payment Failed",
                              description: error,
                              variant: "destructive"
                            });
                            setIsProcessing(false);
                          },
                          () => {
                            // Handle payment cancellation
                            toast({
                              title: "Payment Cancelled",
                              description: "You have cancelled the payment process.",
                            });
                            setIsProcessing(false);
                          }
                        );
                      }}
                    >
                      {isProcessing ? (
                        <>
                          <div className="flex items-center">
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            <div>
                              <div className="font-medium">Processing Payment</div>
                              <div className="text-xs opacity-75">Please wait...</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" />
                          <span>Pay ₹{orderTotal.toFixed(2)} Securely</span>
                        </div>
                      )}
                    </Button>
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
                            <ImageWithFallback 
                              src={item.image} 
                              alt={item.name}
                              size="sm"
                              className="shadow-sm"
                            />
                            <span className="absolute -top-2 -right-2 bg-organic-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
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
