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
    // Auto-save token from login/register responses
    if (
      (response.config.url?.includes('/auth/login') || 
       response.config.url?.includes('/auth/register')) &&
      response.data?.access_token
    ) {
      AuthStorage.setToken(response.data.access_token, 14);
    }
    return response;
  },
  (error) => {
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
