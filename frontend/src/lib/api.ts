import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/config';
import { useAuth } from '@/contexts/auth-context';

// Create a variable to store the auth tokens
let authTokens = {
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
};

// Function to update the tokens
const updateAuthTokens = (accessToken: string | null, refreshToken: string | null) => {
  authTokens = { accessToken, refreshToken };
};

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Use the stored token
    if (authTokens.accessToken) {
      config.headers.Authorization = `Bearer ${authTokens.accessToken}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If the error status is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        if (authTokens.refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: authTokens.refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          
          // Update the stored tokens
          updateAuthTokens(access_token, refresh_token);
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Update tokens in localStorage if in browser
          if (typeof window !== 'undefined') {
            if (access_token) localStorage.setItem('accessToken', access_token);
            if (refresh_token) localStorage.setItem('refreshToken', refresh_token);
          }
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (error) {
        // If refresh token fails, clear auth data
        authTokens = { accessToken: null, refreshToken: null };
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // You might want to redirect to login page here
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper functions for common HTTP methods
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.get<T>(url, config).then((response) => response.data);
};

export const post = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.post<T>(url, data, config).then((response) => response.data);
};

export const put = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.put<T>(url, data, config).then((response) => response.data);
};

export const del = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.delete<T>(url, config).then((response) => response.data);
};

export const patch = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return api.patch<T>(url, data, config).then((response) => response.data);
};
