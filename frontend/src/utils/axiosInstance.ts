import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token management
interface TokenManager {
  accessToken: string | null;
  isRefreshing: boolean;
  failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }>;
}

class TokenManagerClass implements TokenManager {
  accessToken: string | null = null;
  isRefreshing: boolean = false;
  failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  // Get access token from memory or localStorage
  getAccessToken(): string | null {
    if (this.accessToken) {
      console.log('TokenManager: Using memory token');
      return this.accessToken;
    }
    const localStorageToken = localStorage.getItem('accessToken');
    console.log('TokenManager: localStorage token exists:', !!localStorageToken);
    return localStorageToken;
  }

  // Set access token in memory and localStorage
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  // Clear access token from memory and localStorage
  clearAccessToken(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  // Process failed queue
  processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    this.failedQueue = [];
  }

  // Add request to failed queue
  addToFailedQueue(resolve: (token: string) => void, reject: (error: any) => void): void {
    this.failedQueue.push({ resolve, reject });
  }
}

const tokenManager = new TokenManagerClass();

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Request Interceptor
 * Automatically attaches access token to all outgoing requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor: Token attached for', config.method?.toUpperCase(), config.url);
    } else {
      console.log('Request interceptor: No token available for', config.method?.toUpperCase(), config.url);
    }
    
    // Add request timestamp for debugging
    (config as any).metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh when access token expires
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful requests in development
    if (import.meta.env.DEV) {
      const duration = new Date().getTime() - (response.config as any).metadata?.startTime?.getTime();
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log failed requests in development
    if (import.meta.env.DEV) {
      const duration = new Date().getTime() - (originalRequest as any).metadata?.startTime?.getTime();
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`, error.response?.data);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if it's a token expired error
      const errorCode = (error.response?.data as any)?.code;
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID') {
        // Token expired, try to refresh
        if (!tokenManager.isRefreshing) {
          tokenManager.isRefreshing = true;
          
          try {
            // Call refresh endpoint
            const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
              withCredentials: true // Important for HttpOnly cookies
            });
            
            const newAccessToken = response.data.accessToken;
            
            // Set new access token
            tokenManager.setAccessToken(newAccessToken);
            
            // Process any requests that were waiting for the token
            tokenManager.processQueue(null, newAccessToken);
            
            // Retry the original request with new token
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            return axiosInstance(originalRequest);
            
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            tokenManager.processQueue(refreshError, null);
            tokenManager.clearAccessToken();
            
            // Force logout and redirect to login
            window.location.href = '/login';
            
            return Promise.reject(refreshError);
          } finally {
            tokenManager.isRefreshing = false;
          }
        } else {
          // Token is currently being refreshed, add request to queue
          return new Promise((resolve, reject) => {
            tokenManager.addToFailedQueue((token: string) => {
              originalRequest._retry = true;
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            }, reject);
          });
        }
      } else {
        // Other 401 errors (invalid token, user not found, etc.)
        tokenManager.clearAccessToken();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Token Refresh Utilities
 */
export const tokenManagerUtils = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  },
  
  // Get current access token
  getToken(): string | null {
    return tokenManager.getAccessToken();
  },
  
  // Set access token (called after login)
  setToken(token: string): void {
    tokenManager.setAccessToken(token);
  },
  
  // Clear tokens (called after logout)
  clearTokens(): void {
    tokenManager.clearAccessToken();
  },
  
  // Manually refresh token
  async refreshToken(): Promise<string> {
    if (tokenManager.isRefreshing) {
      throw new Error('Token refresh already in progress');
    }
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
        withCredentials: true
      });
      
      const newAccessToken = response.data.accessToken;
      tokenManager.setAccessToken(newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      tokenManager.clearAccessToken();
      throw error;
    }
  }
};

/**
 * Handle multiple tabs synchronization
 * Listen for storage events to sync tokens across tabs
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken') {
      if (event.newValue) {
        // Token updated in another tab
        tokenManager.setAccessToken(event.newValue);
      } else {
        // Token cleared in another tab
        tokenManager.clearAccessToken();
      }
    }
  });
}

export default axiosInstance;
