import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, Truck, CheckCircle, X, MapPin, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { orderAPI, Order } from '@/services/orderAPI';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getMyOrders();
        setOrders(data);
      } catch (error) {
        setError('Failed to fetch orders');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 h-32 rounded-lg"></div>
            ))}
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
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>

          {error ? (
            <div className="text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Link
                to="/products"
                className="text-organic-primary hover:text-organic-dark"
              >
                Start Shopping
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order._id} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">Order #{order._id.slice(-8)}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {format(new Date(order.createdAt), 'PPP')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <p className="font-medium">₹{order.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.orderItems?.map((item) => (
                        <div key={item.product} className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.qty}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{item.price?.toFixed(2) || '0.00'} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Shipping and Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.address}
                        <br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                        <br />
                        {order.shippingAddress?.country}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Information
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {order.paymentMethod}
                      </p>
                      <Badge variant={order.isPaid ? "default" : "secondary"} className="mt-1">
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage; 