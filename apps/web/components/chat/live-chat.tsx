"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useMe } from "@/hooks/useAuth";
import { useChatSocket } from "@/lib/ws";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageCircle, User } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  messageType?: "MESSAGE" | "SYSTEM";
}

interface LiveChatProps {
  roomId: string;
  roomType: "team" | "task" | "project";
  roomName: string;
}

export function LiveChat({ roomId, roomType, roomName }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { data: currentUser } = useMe();
  const socket = useChatSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<{ message: string }>({
    defaultValues: { message: "" },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.emit("join_chat", {
      roomId,
      roomType: roomType.toUpperCase(),
      userId: currentUser.id,
      userName: currentUser.name || currentUser.email,
    });

    socket.on("new_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("user_joined", (data: { userId: string; userName: string }) => {
      setOnlineUsers((prev) => [...prev, data.userId]);
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `${data.userName} joined the chat`,
          userId: "system",
          userName: "System",
          userEmail: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageType: "SYSTEM" as const,
        },
      ]);
    });

    socket.on("user_left", (data: { userId: string; userName: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `${data.userName} left the chat`,
          userId: "system",
          userName: "System",
          userEmail: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageType: "SYSTEM" as const,
        },
      ]);
    });

    socket.on("online_users", (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.emit("get_chat_history", {
      roomId,
      roomType: roomType.toUpperCase(),
    });
    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    return () => {
      socket.emit("leave_chat", {
        roomId,
        roomType: roomType.toUpperCase(),
        userId: currentUser.id,
      });
      socket.off("new_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("online_users");
      socket.off("chat_history");
    };
  }, [socket, currentUser, roomId, roomType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (data: { message: string }) => {
    if (!socket || !currentUser || !data.message.trim()) return;

    const message: Omit<ChatMessage, "id"> = {
      content: data.message.trim(),
      userId: currentUser.id,
      userName:
        currentUser.name || currentUser.email.split("@")[0] || "Unknown",
      userEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageType: "MESSAGE",
    };

    socket.emit("send_message", {
      roomId,
      roomType: roomType.toUpperCase(),
      message,
    });

    form.reset();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentUser) return null;

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat - {roomName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Badge variant="secondary">{onlineUsers.length} online</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.messageType === "SYSTEM"
                    ? "justify-center"
                    : message.userId === currentUser.id
                      ? "justify-end"
                      : "justify-start"
                }`}
              >
                {message.messageType === "SYSTEM" ? (
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {message.content}
                  </div>
                ) : (
                  <>
                    {message.userId !== currentUser.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.userName}`}
                        />
                        <AvatarFallback>
                          {getInitials(message.userName)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[70%] ${
                        message.userId === currentUser.id ? "order-first" : ""
                      }`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.userId === currentUser.id
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div
                        className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                          message.userId === currentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.userId !== currentUser.id && (
                          <span>{message.userName}</span>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    {message.userId === currentUser.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name || currentUser.email}`}
                        />
                        <AvatarFallback>
                          {getInitials(currentUser.name || currentUser.email)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={form.handleSubmit(sendMessage)}
          className="flex gap-2 p-4 border-t"
        >
          <Input
            {...form.register("message")}
            placeholder="Type a message..."
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!form.watch("message")?.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
