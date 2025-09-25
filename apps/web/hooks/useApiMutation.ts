"use client";
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { ZodType } from "zod";
import { api } from "@/lib/api";

type MutationOptions<TData, TPayload> = {
  method?: "post" | "patch" | "put" | "delete";
  buildOptimistic?: (newItem: TPayload) => Partial<TData>;
  invalidateKeys?: string[][];
  buildEndpoint?: (payload: TPayload) => string;
};

export function useApiMutation<TData, TPayload extends Record<string, any>>(
  endpoint: string,
  queryKey: string[],
  schema: ZodType<TPayload>,
  options?: MutationOptions<TData, TPayload>,
): UseMutationResult<TData, unknown, TPayload> {
  const qc = useQueryClient();
  const method = options?.method ?? "post";

  return useMutation<TData, unknown, TPayload>({
    mutationFn: async (payload: TPayload) => {
      schema.parse(payload);
      const finalEndpoint = options?.buildEndpoint
        ? options.buildEndpoint(payload)
        : endpoint;

      let apiCall;
      if (method === "delete") {
        apiCall = api[method](finalEndpoint);
      } else if (method === "patch" && options?.buildEndpoint) {
        const patchPayload =
          "payload" in payload ? (payload as any).payload : payload;
        apiCall = api[method](finalEndpoint, patchPayload);
      } else {
        apiCall = api[method](finalEndpoint, payload);
      }

      const { data } = await apiCall;
      return data as TData;
    },

    onMutate: async (newItem: TPayload) => {
      if (!options?.buildOptimistic) return;

      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData(queryKey);

      const optimisticItem = options.buildOptimistic(newItem);
      qc.setQueryData(queryKey, (old: any) => [optimisticItem, ...(old ?? [])]);

      return { previous };
    },

    onError: (_err, _newItem, context: any) => {
      if (context?.previous) {
        qc.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey });
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          qc.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}
