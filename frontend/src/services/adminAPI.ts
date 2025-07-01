import axios from 'axios';
import authAPI from './authAPI';

const BASE_URL = import.meta.env.VITE_API_URL;
const UPLOAD_URL = BASE_URL; // Use the same base URL for uploads

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Create a separate instance for file uploads
const uploadInstance = axios.create({
  baseURL: UPLOAD_URL,
  withCredentials: true
});

// Add auth token to all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to validate the token
        await authAPI.validateToken();
        // If validation succeeds, retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If validation fails, clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  brand: string;
  image: string;
  countInStock: number;
  isOrganic: boolean;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: {
    name: string;
    qty: number;
    image: string;
    price: number;
    product: string;
  }[];
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await axiosInstance.get('/api/admin/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await axiosInstance.post('/api/admin/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await axiosInstance.put(`/api/admin/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/admin/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Image Upload
  async uploadImage(imageUrl: string): Promise<{ url: string; public_id: string }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Instead of uploading a file, we'll just return the URL directly
      // This assumes the URL is already hosted somewhere (like Cloudinary or another image hosting service)
      return {
        url: imageUrl,
        public_id: imageUrl.split('/').pop() || 'default-id' // Extract a simple ID from the URL
      };
    } catch (error: any) {
      console.error('Image URL processing failed:', {
        message: error.message,
        url: imageUrl
      });
      throw error;
    }
  },

  // Order Management
  async getOrders(): Promise<Order[]> {
    try {
      console.log('Fetching orders from:', '/api/orders'); // Debug log
      const response = await axiosInstance.get('/api/orders');
      console.log('Orders response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async getOrder(id: string): Promise<Order> {
    try {
      const response = await axiosInstance.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', {
        error,
        orderId: id,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const response = await axiosInstance.put(`/api/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', {
        error,
        orderId: id,
        status,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Dashboard Statistics
  async getDashboardStats() {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },
};

export default adminService; 