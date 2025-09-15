import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getFromStorage, setToStorage, removeFromStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
      
    case ActionTypes.SET_TOKEN:
      return {
        ...state,
        token: action.payload
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
      
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from storage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN); // Get token as plain string
        const user = getFromStorage(STORAGE_KEYS.USER);

        if (token && user) {
          dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
          dispatch({ type: ActionTypes.SET_USER, payload: user });
          
          // Verify token with server
          try {
            const response = await authAPI.verifyToken();
            dispatch({ type: ActionTypes.UPDATE_USER, payload: response.user });
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            removeFromStorage(STORAGE_KEYS.USER);
            dispatch({ type: ActionTypes.LOGOUT });
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      const response = await authAPI.login(credentials);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token); // Store token as plain string
      setToStorage(STORAGE_KEYS.USER, response.user);
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });
      
      toast.success(response.message || 'Welcome back! 🎉');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      const response = await authAPI.register(userData);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token); // Store token as plain string
      setToStorage(STORAGE_KEYS.USER, response.user);
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token
        }
      });
      
      toast.success(response.message || 'Account created successfully! 🎉');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN); // Remove token as plain string
    removeFromStorage(STORAGE_KEYS.USER);
    dispatch({ type: ActionTypes.LOGOUT });
    toast.success('Logged out successfully! 👋');
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
      
      const response = await authAPI.updateProfile(userData);
      
      // Update stored user data
      setToStorage(STORAGE_KEYS.USER, response.user);
      
      dispatch({ type: ActionTypes.UPDATE_USER, payload: response.user });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      
      toast.success(response.message || 'Profile updated successfully! 👤');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Get fresh profile data
  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setToStorage(STORAGE_KEYS.USER, response.user);
      dispatch({ type: ActionTypes.UPDATE_USER, payload: response.user });
      return response.user;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Check if user has permission (for future use)
  const hasPermission = (permission) => {
    if (!state.user) return false;
    return state.user.permissions?.includes(permission) || false;
  };

  // Check if user is admin (for future use)
  const isAdmin = () => {
    return state.user?.role === 'admin' || false;
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    clearError,
    
    // Utility functions
    hasPermission,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
