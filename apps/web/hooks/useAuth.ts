import {
  LoginSchema,
  RegisterSchema,
  UserProfileSchema,
  type LoginInput,
  type RegisterInput,
  type UserProfile,
  type LoginResponse,
  type RegisterResponse,
} from "@workspace/api";
import { useApiMutation } from "./api/useApiMutation";
import { useApiQuery } from "./api/useApiQuery";
import { AuthStorage } from "@/lib/auth-storage";
import { z } from "zod";

const LogoutSchema = z.object({});

export function useLogin() {
  return useApiMutation<LoginResponse, LoginInput>(
    "/auth/login",
    ["auth"],
    LoginSchema,
    {
      invalidateKeys: [["me"]],
    },
  );
}

export function useRegister() {
  return useApiMutation<RegisterResponse, RegisterInput>(
    "/auth/register",
    ["auth"],
    RegisterSchema,
    {
      invalidateKeys: [["me"]],
    },
  );
}

export function useLogout() {
  return useApiMutation<any, {}>("/auth/logout", ["auth"], LogoutSchema, {
    invalidateKeys: [["me"]],
  });
}

export const AuthUtils = {
  saveToken: (token: string) => {
    AuthStorage.setToken(token, 14);
  },
  
  clearToken: () => {
    AuthStorage.clearToken();
  },
  
  isAuthenticated: () => {
    return AuthStorage.isAuthenticated();
  }
};

export function useMe(options?: { enabled?: boolean }) {
  return useApiQuery<UserProfile>(["me"], "/auth/profile", UserProfileSchema, {
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
