/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls
 * 
 * Endpoints:
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/logout
 * - POST /auth/forgot-password
 * - POST /auth/verify-otp
 */

import { apiClient } from './apiClient';

export const authApi = {
  /**
   * Login user
   * @param credentials - Email, password, and role
   * @returns User data and authentication token
   */
  login: async (credentials: { email: string; password: string; role: string }) => {
    return apiClient.post('/login', credentials);
  },

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Created user and token
   */
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    bloodType?: string;
  }) => {
    // Generate a unique ID for the user
    const id = `${userData.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return apiClient.post('/register', { 
      id,
      ...userData 
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiClient.post('/logout', {});
  },

  /**
   * Request password reset
   * @param email - User email
   */
  forgotPassword: async (email: string) => {
    return apiClient.post('/forgot-password', { email });
  },

  /**
   * Verify OTP
   * @param email - User email
   * @param otp - One-time password
   */
  verifyOTP: async (email: string, otp: string) => {
    return apiClient.post('/verify-otp', { email, otp });
  },

  /**
   * Get user role by email
   * @param email - User email
   */
  getUserRole: async (email: string) => {
    return apiClient.post('/get-user-role', { email });
  },

  /**
   * Reset password
   * @param email - User email
   * @param newPassword - New password
   */
  resetPassword: async (email: string, newPassword: string) => {
    return apiClient.post('/reset-password', { email, newPassword });
  },
};

