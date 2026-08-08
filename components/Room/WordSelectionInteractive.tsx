"use client";

import { useState } from "react";
import { Socket } from "socket.io-client";

export default function WordSelectionInteractive({
  wordChoices,
  socket,
  roomCode,
  playerId,
}: {
  wordChoices: string[];
  socket: Socket | null;
  roomCode: string;
  playerId: string;
}) {
  const [selecting, setSelecting] = useState(false);

  const handleSelectWord = (word: string) => {
    if (selecting || !socket) return;
    setSelecting(true);
    socket.emit("select-word", { roomCode, playerId, word });
  };

  return (
    <div className="text-center w-full max-w-2xl animate-in fade-in zoom-in duration-300 flex flex-col items-center">
      <h2
        className="text-[48px] leading-[1.2] text-[var(--color-on-surface)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Choose a word!
      </h2>
      <p
        className="text-[24px] text-[var(--color-on-surface-variant)] mb-12"
        style={{ fontFamily: "var(--font-body)" }}
      >
        What are you going to draw?
      </p>

      <div className="flex justify-center gap-6 flex-wrap">
        {wordChoices?.map((word: string, i) => {
          // Tilt the cards slightly for a messy desk look
          const rotation = (i % 2 === 0 ? -3 : 3) + i;

          return (
            <button
              key={word}
              disabled={selecting}
              onClick={() => handleSelectWord(word)}
              className="
                px-8 py-10
                bg-[var(--color-surface-container-highest)]
                text-[var(--color-on-surface)]
                text-[32px] leading-[1.2]
                rough-border
                paper-shadow
                hover:scale-105 hover:rotate-0 hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]
                transition-all duration-200
                active:scale-95 disabled:opacity-50
                w-48
              "
              style={{
                fontFamily: "var(--font-display)",
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
