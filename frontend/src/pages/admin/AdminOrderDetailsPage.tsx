import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { adminService, Order } from '@/services/adminAPI';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Loader2, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Printer
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminOrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await adminService.getOrder(orderId!);
      setOrder(orderData);
    } catch (err) {
      setError('Failed to fetch order details. Please try again later.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return;

    try {
      setProcessing(true);
      await adminService.updateOrderStatus(order._id, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Order status has been updated to ${newStatus}.`,
      });

      await fetchOrderDetails();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      processing: { color: 'bg-blue-500', icon: Loader2 },
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

  const handlePrintOrder = () => {
    // Implement print functionality
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Order not found'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        <Button variant="outline" onClick={handlePrintOrder}>
          <Printer className="h-4 w-4 mr-2" />
          Print Order
        </Button>
      </div>

      {/* Order Status Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order #{order._id}</CardTitle>
            <div className="flex items-center gap-4">
              {getStatusBadge(order.status)}
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={processing}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <div className="space-y-2 text-sm">
                <p>Order Date: {format(new Date(order.createdAt), 'PPP p')}</p>
                <p>Payment Method: {order.paymentMethod}</p>
                <p>Payment Status: {order.isPaid ? 'Paid' : 'Unpaid'}</p>
                <p>Total Amount: ₹{order.total.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {order.user.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{(order.total + order.shippingCost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>Payment ID: {order.paymentId}</p>
            <p>Payment Status: {order.isPaid ? 'Paid' : 'Unpaid'}</p>
            <p>Payment Date: {order.paidAt ? format(new Date(order.paidAt), 'PPP p') : 'Not paid yet'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrderDetailsPage; 