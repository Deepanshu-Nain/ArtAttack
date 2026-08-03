"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBoxLayout, { ChatMessage } from "./ChatBoxLayout";

export default function ChatBox({
  socket,
  roomCode,
  currentPlayerId,
  isDrawer,
}: {
  socket: Socket | null;
  roomCode: string;
  currentPlayerId: string;
  isDrawer: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit("chat-message", {
      roomCode,
      playerId: currentPlayerId,
      message: input,
    });
    
    setInput("");
  };

  return (
    <ChatBoxLayout 
      messages={messages}
      input={input}
      setInput={setInput}
      isDrawer={isDrawer}
      onSendMessage={handleSendMessage}
      messagesEndRef={messagesEndRef}
    />
  );
}
