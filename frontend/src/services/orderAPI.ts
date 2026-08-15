import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const orderAPI = {
  // Create a new order
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    try {
      const response = await axiosInstance.post('/api/orders', orderData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        // Force page reload to trigger re-authentication
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // Get user's orders
  getMyOrders: async (): Promise<Order[]> => {
    const response = await axiosInstance.get('/api/orders/myorders');
    return response.data;
  },

  // Get single order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await axiosInstance.get(`/api/orders/${orderId}`);
    return response.data;
  }
};

export default orderAPI; 