"use client";
import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { ZodType, z } from "zod";
import { api } from "@/lib/api";

export function useApiQuery<T>(
  queryKey: string[],
  endpoint: string,
  schema: ZodType<T>
): UseQueryResult<T> {
  const qc = useQueryClient();

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      return schema.parse(data);
    },
  });
}