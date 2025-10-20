import axios from "axios";
import { AuthStorage } from "./auth-storage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Debug: Log API configuration
if (typeof window !== 'undefined') {
  console.log('[API Config]', {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    nodeEnv: process.env.NODE_ENV,
    withCredentials: true,
  });
}

api.interceptors.request.use((config) => {
  const token = AuthStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Debug: Log all responses in production
    if (typeof window !== 'undefined') {
      console.log('[API Response]', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        hasAccessToken: !!response.data?.access_token,
        environment: process.env.NODE_ENV,
        baseURL: response.config.baseURL,
      });
    }
    
    const isLoginOrRegister = 
      response.config.method?.toLowerCase() === 'post' &&
      (response.config.url === '/auth/login' || 
       response.config.url === '/auth/register' ||
       response.config.url?.endsWith('/auth/login') ||
       response.config.url?.endsWith('/auth/register'));
    
    if (isLoginOrRegister && response.data?.access_token) {
      console.log('[API] Saving token to localStorage');
      AuthStorage.setToken(response.data.access_token, 14);
      
      // Verify token was saved
      const savedToken = AuthStorage.getToken();
      console.log('[API] Token save verification:', {
        tokenSaved: !!savedToken,
        canAccessLocalStorage: typeof window !== 'undefined' && !!window.localStorage,
      });
    } else if (isLoginOrRegister) {
      console.warn('[API] Login/Register response missing access_token:', {
        responseData: response.data,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });
    }
    
    return response;
  },
  (error) => {
    // Debug: Log all errors in production
    if (typeof window !== 'undefined') {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        environment: process.env.NODE_ENV,
      });
    }
    
    if (error.response?.status === 401) {
      AuthStorage.clearToken();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth") &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  },
);
