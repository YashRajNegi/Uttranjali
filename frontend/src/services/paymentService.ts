import { loadScript } from '@/lib/utils';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
if (!RAZORPAY_KEY) {
  throw new Error('Razorpay key is not configured. Please check your environment variables.');
}

const API_URL = import.meta.env.VITE_API_URL;

export const displayRazorpay = async (amount: number, onSuccess: (paymentId: string) => void, onError: (error: string) => void) => {
  const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  if (!res) {
    onError('Razorpay SDK failed to load. Are you online?');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    console.log('Razorpay order data:', data);

    const options = {
      key: RAZORPAY_KEY,
      amount: data.amount,
      currency: data.currency,
      name: 'Earth Eats Market',
      description: 'Payment for your order',
      order_id: data.id,
      handler: function (response) {
        onSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: function() {
          console.log('Checkout form closed');
        }
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to create payment order');
  }
}; 