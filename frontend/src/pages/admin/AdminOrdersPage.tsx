import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { adminService, Order } from '@/services/adminAPI';
import { format } from 'date-fns';
import { Check, X, Loader2, Clock, Package, Truck, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');

  // Fetch orders initially and set up polling
  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 15 seconds for more real-time updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const ordersData = await adminService.getOrders();
      // Sort orders by date (newest first) and priority
      const sortedOrders = ordersData.sort((a, b) => {
        // Pending orders first
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        // Then by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sortedOrders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'accept' | 'reject' | 'ship' | 'deliver') => {
    try {
      setProcessingOrder(orderId);
      const newStatus = action === 'accept' ? 'processing' : action === 'reject' ? 'cancelled' : action === 'ship' ? 'shipped' : 'delivered';
      await adminService.updateOrderStatus(orderId, newStatus);
      
      // Show success message
      toast({
        title: `Order ${action === 'accept' ? 'Accepted' : action === 'reject' ? 'Rejected' : action === 'ship' ? 'Marked as Shipped' : 'Marked as Delivered'}`,
        description: `Order #${orderId} has been ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : action === 'ship' ? 'marked as shipped' : 'marked as delivered'} successfully.`,
        variant: action === 'accept' ? 'default' : action === 'reject' ? 'destructive' : 'default',
      });

      await fetchOrders();
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to ${action} order. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(null);
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <Button onClick={fetchOrders} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Orders
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Pending
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {orders.filter(o => o.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-1">
            <Loader2 className="h-4 w-4" />
            Processing
          </TabsTrigger>
          <TabsTrigger value="shipped" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            Shipped
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Delivered
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-1">
            <X className="h-4 w-4" />
            Cancelled
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            All Orders
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order._id} 
                  className={order.status === 'pending' ? 'bg-muted/50' : ''}
                >
                  <TableCell className="font-medium">{order._id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.user.name}</span>
                      <span className="text-sm text-muted-foreground">{order.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'HH:mm')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>₹{(order.totalPrice || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={order.isPaid ? "default" : "secondary"}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOrderAction(order._id, 'accept')}
                            disabled={!!processingOrder}
                            className="gap-1"
                          >
                            {processingOrder === order._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOrderAction(order._id, 'reject')}
                            disabled={!!processingOrder}
                            className="gap-1"
                          >
                            {processingOrder === order._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                      {order.status === 'processing' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOrderAction(order._id, 'ship')}
                          disabled={!!processingOrder}
                          className="gap-1"
                        >
                          <Truck className="h-4 w-4" />
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOrderAction(order._id, 'deliver')}
                          disabled={!!processingOrder}
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Delivered
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="gap-1"
                      >
                        <Package className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No {activeTab !== 'all' ? activeTab : ''} orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersPage; 