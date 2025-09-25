"use client";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ZodType, z } from "zod";
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
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      return schema.parse(data);
    },
    ...options,
  });
}
