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
    <div
      className="
        bg-[var(--color-surface-container-low)]
        sketch-border
        p-4
        rotate-[1deg]
        flex flex-col
        h-full
        relative
      "
    >
      {/* Tape accent */}
      <div className="tape-strip absolute w-24 h-8 -top-4 left-1/2 -translate-x-1/2 rotate-[2deg]" />

      <h2
        className="text-[32px] leading-[1.2] text-[var(--color-on-surface)] mb-4 text-center"
        style={{ fontFamily: "var(--font-display)" }}
      >
        CHAT
      </h2>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto flex flex-col gap-3 pr-2 mb-4 scrollbar-hide">
        {messages.map((msg, i) => {
          // Generate a pseudo-random rotation between -3deg and 3deg based on index
          const rotation = (i % 7) - 3;

          if (msg.isCorrect) {
            return (
              <div
                key={i}
                className="bg-[#a3e635] text-black p-3 chat-bubble self-center text-center w-full shadow-lg"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <span
                  className="block text-[20px] leading-[1]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {msg.sender} guessed the word!
                </span>
              </div>
            );
          }

          if (msg.isSystem) {
            return (
              <div
                key={i}
                className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] p-2 chat-bubble self-center text-center max-w-[85%]"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <span
                  className="italic text-[14px]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {msg.message}
                </span>
              </div>
            );
          }

          // Normal message
          // Alternate bubble colors based on odd/even index for variety
          const isOdd = i % 2 !== 0;
          const bubbleClass = isOdd
            ? "bg-[var(--color-surface)] text-[var(--color-on-surface)]"
            : "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]";

          return (
            <div
              key={i}
              className={`${bubbleClass} p-3 chat-bubble self-start max-w-[85%]`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <span
                className="font-bold text-[14px] block opacity-75"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {msg.sender}
              </span>
              <span
                className="text-[18px] leading-tight"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {msg.message}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-auto">
        <form
          onSubmit={onSendMessage}
          className="
            relative
            bg-[var(--color-drawing-surface)]
            sketch-border
            p-1
            flex items-center
            rotate-[-1deg]
          "
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDrawer ? "Drawing (no chat)" : "Type guess..."}
            disabled={isDrawer}
            className="
              w-full bg-transparent border-none focus:ring-0
              text-[18px] placeholder-[var(--color-outline)] p-2
              blue-lined-paper
            "
            style={{ fontFamily: "var(--font-body)" }}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isDrawer || !input.trim()}
            className="p-2 text-[var(--color-primary)] hover:scale-110 transition-transform disabled:opacity-50"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
