"use client";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";

import AuthGuard from "@/components/auth/auth-guard";
import { ThemeProvider } from "@/components/theme-provider";
import { initSocket } from "@/lib/ws";

const getQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const socket = initSocket(queryClient);
    
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
