"use client";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { ZodType } from "zod";
import { api } from "@/lib/api";

export function useApiMutation<TData, TPayload>(
  endpoint: string,
  queryKey: string[],
  schema: ZodType<TPayload>
): UseMutationResult<TData, unknown, TPayload> {
  const qc = useQueryClient();

  return useMutation<TData, unknown, TPayload>({
    mutationFn: async (payload: TPayload) => {
      schema.parse(payload);
      const { data } = await api.post(endpoint, payload);
      return data as TData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });
}