import axios from "axios";
import { AuthStorage } from "./auth-storage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = AuthStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[Response Interceptor]', {
      url: response.config.url,
      status: response.status,
      hasAccessToken: !!response.data?.access_token,
      data: response.data,
    });
    
    if (
      (response.config.url?.includes('/auth/login') || 
       response.config.url?.includes('/auth/register')) &&
      response.data?.access_token
    ) {
      console.log('[Response Interceptor] Saving token to localStorage');
      AuthStorage.setToken(response.data.access_token, 14);
      console.log('[Response Interceptor] Token saved, verifying:', {
        saved: !!AuthStorage.getToken(),
      });
    }
    return response;
  },
  (error) => {
    console.error('[Response Interceptor] Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    
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
