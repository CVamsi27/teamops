"use client";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";

import AuthGuard from "@/components/auth/auth-guard";
import { initSocket } from "@/lib/ws";
import { io } from "socket.io-client";
import { type Task } from "@workspace/api";

const getQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

function SocketInitializer({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL);
    socket.on("connect", () => console.log("ws connected"));
    socket.on("task.created", (payload: Task) => {
      qc.setQueryData<Task[]>(["tasks"], (old) => [payload, ...(old ?? [])]);
    });
    socket.on("task.updated", (payload: Task) => {
      qc.setQueryData<Task[]>(["tasks"], (old) =>
        (old ?? []).map((t) =>
          t.id === payload.id ? { ...t, ...payload } : t,
        ),
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [qc]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  useEffect(() => {
    if (typeof window === "undefined") return;
    initSocket(queryClient);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <SocketInitializer>
          {children}
        </SocketInitializer>
      </AuthGuard>
    </QueryClientProvider>
  );
}
