import { dehydrate, QueryClient } from "@tanstack/react-query";
import { cache } from "react";

export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    }),
);

export async function getDehydratedState() {
  const queryClient = getQueryClient();
  return dehydrate(queryClient);
}
