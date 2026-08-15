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
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
  expiresIn?: string;
}

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
      return response.data;
    } catch (error) {
      // Remove console.error to reduce noise during login
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await axiosInstance.post('/api/auth/register', data);
      return response.data;
    } catch (error) {
      // Remove console.error to reduce noise during registration
      throw error;
    }
  },

  async googleAuth(credential: string) {
    try {
      const response = await axiosInstance.post('/api/auth/google', { credential });
      return response.data;
    } catch (error) {
      // Remove console.error to reduce noise during login
      throw error;
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token: string, password: string) {
    try {
      const response = await axiosInstance.post('/api/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await axiosInstance.post('/api/auth/logout');
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axiosInstance.get('/api/auth/validate');
      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
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