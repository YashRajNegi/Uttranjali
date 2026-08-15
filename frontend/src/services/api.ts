import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { name: string; email: string; password?: string }) =>
    api.put('/users/profile', data),
  getUsers: () => api.get('/users'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: { name: string; email: string; role: string }) =>
    api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  image: string;
  brand: string;
  category: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  reviews?: {
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
  user: string;
  createdAt: string;
  updatedAt: string;
  isOrganic?: boolean;
  unit?: string;
}

// Product API with optimized queries
export const productAPI = {
  getProducts: (page: number = 1, limit: number = 20, category?: string, brand?: string, minPrice?: number, maxPrice?: number, sortBy?: string, sortOrder?: number, search?: string) => {
    const params: any = { page, limit };
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder !== undefined) params.sortOrder = sortOrder;
    if (search) params.search = search;
    
    return api.get('/products', { params });
  },
  getProductById: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  createReview: (id: string, data: { rating: number; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),
  getTopProducts: () => api.get('/products/top'),
};

// Order API
export const orderAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/myorders'),
  getAllOrders: () => api.get('/orders'),
  updateOrderToPaid: (id: string, data: any) =>
    api.put(`/orders/${id}/pay`, data),
  updateOrderToDelivered: (id: string) =>
    api.put(`/orders/${id}/deliver`),
};

export default api;