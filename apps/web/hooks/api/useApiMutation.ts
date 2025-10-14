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
    mutationFn: async (payload: TPayload): Promise<TData> => {
      try {
        try {
          schema.parse(payload);
        } catch (zodError: any) {
          console.error(`Payload validation error for ${endpoint}:`, {
            endpoint,
            payload,
            zodError: zodError.issues || zodError.message,
          });
          throw new Error(
            `Invalid payload for ${endpoint}: ${zodError.message}`,
          );
        }

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
      } catch (apiError: any) {
        if (apiError.response) {
          console.error(`API mutation error for ${endpoint}:`, {
            endpoint,
            method,
            status: apiError.response.status,
            statusText: apiError.response.statusText,
            data: apiError.response.data,
          });

          if (apiError.response.status === 401) {
            throw new Error("Unauthorized: Please login again");
          } else if (apiError.response.status === 403) {
            throw new Error(
              "Forbidden: You do not have permission to perform this action",
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
          console.error(`Network error for ${endpoint}:`, {
            endpoint,
            method,
            message: apiError.message,
          });
          throw new Error("Network error: Please check your connection");
        } else {
          console.error(`Unknown error for ${endpoint}:`, apiError);
          throw apiError;
        }
      }
    },

    onMutate: async (newItem: TPayload) => {
      if (!options?.buildOptimistic) return;

      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData(queryKey);

      const optimisticItem = options.buildOptimistic(newItem);
      qc.setQueryData(queryKey, (old: any) => [optimisticItem, ...(old ?? [])]);

      return { previous };
    },

    onError: (error: any, variables: TPayload, context: any) => {
      console.error(`useApiMutation error for ${endpoint}:`, {
        endpoint,
        method,
        error,
        variables,
      });

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
