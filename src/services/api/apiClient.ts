/**
 * API Client Configuration
 * 
 * Centralized Axios/Fetch configuration
 * Handles authentication, interceptors, and error handling
 * 
 * Purpose:
 * - Single point of API configuration
 * - Automatic token injection
 * - Error handling
 * - Request/response transformation
 */

// Example using Axios (install: npm install axios)
// import axios from 'axios';
// import { getSecureToken } from '../storage/secureStorage';

const BASE_URL = 'http://10.29.40.18:3000/api';

/**
 * API Client class
 * Wraps HTTP calls with authentication and error handling
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * GET request
   */
  async get(endpoint: string, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post(endpoint: string, data: any, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        body: JSON.stringify(data),
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data: any, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        body: JSON.stringify(data),
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string, config?: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(config && config.headers ? config.headers : {})
        },
        ...config
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Error handler
   */
  private handleError(error: any) {
    // Log error, show toast, etc.
    console.error('API Error:', error);
    throw error;
  }
}

export const apiClient = new ApiClient(BASE_URL);

