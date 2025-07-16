import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Helper function to get dashboard path based on role
  const getDashboardPath = (role) => {
    const rolePaths = {
      'Doctor': '/doctor-dashboard',
      'Sheha': '/sheha-dashboard',
      'HealthSupervisor': '/supervisor-dashboard',
      'Admin': '/admin-dashboard'
    };
    return rolePaths[role] || '/dashboard';
  };

  // Extract user ID from JWT token
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.user_id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Verify and add ID if missing
          if (!parsedUser.id) {
            const userId = getUserIdFromToken(token);
            if (userId) {
              parsedUser.id = userId;
              localStorage.setItem('user', JSON.stringify(parsedUser));
            }
          }

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(parsedUser);
          
          // Redirect to role-specific dashboard if accessing root
          if (window.location.pathname === '/') {
            navigate(getDashboardPath(parsedUser.role));
          }
          
          toast.success(`Welcome back, ${parsedUser.first_name || 'User'}!`, {
            position: "top-right",
            autoClose: 3000,
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  // Login function - modified to ensure ID is included
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${apiUrl}login/`, credentials);
      const { access, refresh, first_name, role } = response.data;

      // Get user ID from the access token
      const userId = getUserIdFromToken(access);
      if (!userId) {
        throw new Error('User ID not found in token');
      }

      // Create complete user object
      const userData = {
        id: userId,
        first_name,
        last_name: response.data.last_name || '',
        role,
        email: response.data.email || '',
        // Add any other user fields you need
      };

      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(userData);
      
      // Show welcome message
      toast.success(`Welcome, ${first_name || 'User'}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Redirect to appropriate dashboard
      navigate(getDashboardPath(role));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      
      return false;
    }
  };

  // Logout function
  const logout = () => {
    const firstName = user?.first_name;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    
    toast.info(`Goodbye${firstName ? `, ${firstName}` : ''}! You have been logged out.`, {
      position: "top-right",
      autoClose: 3000,
    });
    
    navigate('/login');
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token');

      const response = await axios.post(`${apiUrl}token/refresh/`, { refresh });
      const { access } = response.data;

      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return access;
    } catch (error) {
      toast.warn('Your session has expired. Please log in again.', {
        position: "top-right",
        autoClose: 5000,
      });
      logout();
      throw error;
    }
  };

  // Add axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        // Show error toast for other API errors
        if (error.response && error.response.status >= 400) {
          const errorMessage = error.response.data?.message || 
                             error.response.data?.detail || 
                             'An error occurred. Please try again.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
          });
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    userRole: user?.role,
    userId: user?.id, // Explicitly expose user ID
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};