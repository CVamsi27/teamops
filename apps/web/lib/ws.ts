import { io, Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Task } from "@workspace/api";

let socket: Socket | null = null;
let chatSocket: Socket | null = null;

export function initSocket(qc: QueryClient): Socket {
  if (socket) return socket;

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
  console.log("Connecting to WebSocket at:", wsUrl);

  socket = io(wsUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

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

export function initChatSocket(): Socket {
  if (chatSocket) return chatSocket;

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
  console.log("Connecting to Chat WebSocket at:", wsUrl + "/chat");

  chatSocket = io(wsUrl + "/chat", {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    withCredentials: true,
  });

  chatSocket.on("connect", () => {
    console.log(
      "Chat socket connected to",
      wsUrl + "/chat",
      "with ID:",
      chatSocket?.id,
    );
  });

  chatSocket.on("disconnect", (reason) => {
    console.log("Chat socket disconnected:", reason);
  });

  chatSocket.on("connect_error", (error) => {
    console.error("Chat socket connection error:", error);
  });

  return chatSocket;
}

export function useSocket(): Socket | null {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(socket);

  useEffect(() => {
    if (!socket) {
      console.warn("Socket not initialized yet. Call initSocket first.");
      return;
    }

    setSocketInstance(socket);

    const handleConnect = () => setSocketInstance(socket);
    const handleDisconnect = () => setSocketInstance(socket);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket?.off("connect", handleConnect);
      socket?.off("disconnect", handleDisconnect);
    };
  }, []);

  return socketInstance;
}

export function useChatSocket(): Socket | null {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(
    chatSocket,
  );

  useEffect(() => {
    if (!chatSocket) {
      chatSocket = initChatSocket();
    }

    setSocketInstance(chatSocket);

    const handleConnect = () => setSocketInstance(chatSocket);
    const handleDisconnect = () => setSocketInstance(chatSocket);

    chatSocket.on("connect", handleConnect);
    chatSocket.on("disconnect", handleDisconnect);

    return () => {
      chatSocket?.off("connect", handleConnect);
      chatSocket?.off("disconnect", handleDisconnect);
    };
  }, []);

  return socketInstance;
}
