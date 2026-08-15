import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI, { AuthResponse, UserProfile } from '../services/authAPI';

// Use UserProfile type directly from authAPI
type User = UserProfile;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await authAPI.validateToken();
          setUser(response.user);
          // Redirect to admin page if user is admin and on root path
          if (response.user.role === 'admin' && window.location.pathname === '/') {
            navigate('/admin');
          }
        }
      } catch (err) {
        // Silently handle auth check failures without console errors
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAuthResponse = (response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    setUser(response.user);
    // Navigate based on user role
    if (response.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      handleAuthResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.googleAuth(credential);
      handleAuthResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register({ name, email, password });
      handleAuthResponse(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to clear refresh token cookie
      await authAPI.logout();
    } catch (err) {
      // Continue with local logout even if backend call fails
      console.error('Backend logout failed:', err);
    } finally {
      // Always clear local state
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 