"use client";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ZodType } from "zod";
import { api } from "@/lib/api";

type ApiQueryOptions<T> = Partial<UseQueryOptions<T>> & {
  enabled?: boolean;
};

export function useApiQuery<T>(
  queryKey: string[],
  endpoint: string,
  schema: ZodType<T>,
  options?: ApiQueryOptions<T>,
): UseQueryResult<T> {
  const qc = useQueryClient();

  return useQuery<T>({
    queryKey,
    queryFn: async (): Promise<T> => {
      try {
        const { data } = await api.get(endpoint);
        try {
          return schema.parse(data);
        } catch (zodError: any) {
          throw new Error(
            `Data validation failed for ${endpoint}: ${zodError.message}`,
          );
        }
      } catch (apiError: any) {
        if (apiError.response) {
          if (apiError.response.status === 401) {
            throw new Error("Unauthorized: Please login again");
          } else if (apiError.response.status === 403) {
            throw new Error(
              "Forbidden: You do not have permission to access this resource",
            );
          } else if (apiError.response.status === 404) {
            throw new Error("Resource not found");
          } else if (apiError.response.status >= 500) {
            throw new Error("Server error: Please try again later");
          } else {
            throw new Error(
              apiError.response.data?.message ||
                `Request failed with status ${apiError.response.status}`,
            );
          }
        } else if (apiError.request) {
          throw new Error("Network error: Please check your connection");
        } else {
          throw apiError;
        }
      }
    },
    ...options,
  });
}
