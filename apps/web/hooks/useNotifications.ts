import { useEffect } from "react";
import { io } from "socket.io-client";

export const useNotifications = (
  onEvent: (topic: string, payload: any) => void,
) => {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);
    socket.on("connect", () => console.log("ws connected"));
    socket.on("task.created", (p) => onEvent("task.created", p));
    socket.on("task.updated", (p) => onEvent("task.updated", p));
    return () => {
      socket.disconnect();
    };
  }, []);
};
