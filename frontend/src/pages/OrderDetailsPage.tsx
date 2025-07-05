import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, Package, Truck, CheckCircle, X, ChevronLeft,
  MapPin, Phone, Mail, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { orderAPI, Order } from '@/services/orderAPI';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) throw new Error('Order ID is required');
        setLoading(true);
        const data = await orderAPI.getOrderById(id);
        setOrder(data);
      } catch (error) {
        setError('Failed to fetch order details');
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      processing: { color: 'bg-blue-500', icon: Package },
      shipped: { color: 'bg-purple-500', icon: Truck },
      delivered: { color: 'bg-green-500', icon: CheckCircle },
      cancelled: { color: 'bg-red-500', icon: X }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-custom py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-40 bg-gray-100 rounded"></div>
                <div className="h-40 bg-gray-100 rounded"></div>
              </div>
              <div className="h-80 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-custom py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {error || 'Order not found'}
            </h2>
            <Link
              to="/orders"
              className="text-organic-primary hover:text-organic-dark"
            >
              Back to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom">
          <div className="mb-6">
            <Link
              to="/orders"
              className="text-muted-foreground hover:text-organic-primary flex items-center mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Order #{order._id.slice(-8)}</h1>
              {getStatusBadge(order.status)}
            </div>
            
            <p className="text-muted-foreground mt-2">
              Placed on {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-organic-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-organic-primary" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-muted-foreground capitalize">{order.paymentMethod}</p>
                  
                  <div className="mt-4">
                    <p className="font-medium">Payment Status</p>
                    <Badge variant={order.isPaid ? "default" : "secondary"}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                    {order.isPaid && order.paidAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Paid on {format(new Date(order.paidAt), 'PPP')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems && order.orderItems.map((item) => (
                    <div key={item.product} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.qty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.qty).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{order.itemsPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹{order.shippingPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{order.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailsPage; 