import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { displayRazorpay } from '@/services/paymentService';
import { useToast } from '@/components/ui/use-toast';

const CheckoutPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await displayRazorpay(
        1000, // amount in INR
        (paymentId) => {
          toast({
            title: 'Success',
            description: `Payment successful! Payment ID: ${paymentId}`,
          });
        },
        (error) => {
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
        }
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <main className="flex-grow pt-24 bg-background py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <Button onClick={handlePayment} disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </main>
    </div>
  );
};

export default CheckoutPage; 