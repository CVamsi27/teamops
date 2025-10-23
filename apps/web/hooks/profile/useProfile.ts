import { useApiQuery } from "../api/useApiQuery";
import { PublicUserSchema } from "@workspace/api";

export function useProfile() {
  return useApiQuery(["profileData"], "/users/me", PublicUserSchema, {
    retry: (failureCount: number, error: unknown) => {
      const err = error as Error;
      if (
        err?.message?.includes("Unauthorized") ||
        err?.message?.includes("Data validation failed")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
