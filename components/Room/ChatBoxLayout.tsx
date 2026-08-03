import React, { RefObject } from "react";

export type ChatMessage = {
  sender: string;
  message: string;
  isSystem: boolean;
  isCorrect?: boolean;
};

export default function ChatBoxLayout({
  messages,
  input,
  setInput,
  isDrawer,
  onSendMessage,
  messagesEndRef,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isDrawer: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
        Chat & Guesses
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2 text-sm">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-2 rounded-lg ${
              msg.isCorrect ? "bg-green-100 text-green-800 font-bold border border-green-200" : 
              msg.isSystem ? "bg-slate-100 text-slate-500 italic" : 
              "bg-slate-50 text-black"
            }`}
          >
            {!msg.isSystem && <span className="font-bold mr-2">{msg.sender}:</span>}
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={onSendMessage} className="p-3 bg-slate-50 border-t border-slate-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isDrawer ? "Type a message..." : "Type your guess here..."}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          autoComplete="off"
        />
      </form>
    </div>
  );
}
