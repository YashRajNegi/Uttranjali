import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const authAPI = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials);
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await axiosInstance.post('/api/auth/register', data);
      const { token } = response.data;
      localStorage.setItem('token', token);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await axiosInstance.post('/api/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axiosInstance.get('/api/auth/validate');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await axiosInstance.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async updateProfile(data: Partial<UserProfile>) {
    try {
      const response = await axiosInstance.put('/api/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authAPI; 