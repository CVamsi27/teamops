import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
  type LoginResponse,
  type RegisterResponse,
} from "@workspace/api";
import { useApiMutation } from "./useApiMutation";
import { useApiQuery } from "./useApiQuery";
import { z } from "zod";

const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.string(),
});

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

const LogoutSchema = z.object({});

export function useLogout() {
  return useApiMutation<any, {}>("/auth/logout", ["auth"], LogoutSchema, {
    invalidateKeys: [["me"]],
  });
}

export function useMe(options?: { enabled?: boolean }) {
  return useApiQuery(["me"], "/auth/profile", UserProfileSchema, {
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
