import { io, Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import type { Task } from "@workspace/api";

export function initSocket(qc: QueryClient): Socket {
  const socket = io(process.env.NEXT_PUBLIC_WS_URL);
  socket.on("connect", () => console.log("ws connected"));
  socket.on("task.created", (payload: Task) => {
    qc.setQueryData<Task[]>(["tasks"], (old = []) => [payload, ...old]);
  });
  socket.on("task.updated", (payload: Task) => {
    qc.setQueryData<Task[]>(["tasks"], (old = []) =>
      old.map((t) => (t.id === payload.id ? { ...t, ...payload } : t)),
    );
  });
  return socket;
}
