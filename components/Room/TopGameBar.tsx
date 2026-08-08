"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Room } from "@/types/game";

export default function TopGameBar({
  room,
  isDrawer,
  socket,
}: {
  room: Room;
  isDrawer: boolean;
  socket: Socket | null;
}) {
  const [timeLeft, setTimeLeft] = useState(80);

  useEffect(() => {
    if (!socket) return;

    const handleTick = (time: number) => {
      setTimeLeft(time);
    };

    socket.on("timer-tick", handleTick);

    return () => {
      socket.off("timer-tick", handleTick);
    };
  }, [socket]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header
      className="
        bg-[var(--color-tape)]
        backdrop-blur-sm
        paper-shadow
        sticky top-0 z-50
        w-full
      "
    >
      <div
        className="
          grid grid-cols-3 items-center
          px-6 py-4
          w-full max-w-[800px] mx-auto
        "
      >
        {/* Round Info */}
        <div
          className="text-[14px] leading-[1.2] text-[var(--color-on-surface-variant)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Round {room.currentRound} / {room.maxRounds}
        </div>

        {/* Word / Title */}
        <div
          className="text-[32px] leading-[1.2] text-[var(--color-secondary)] text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isDrawer ? (
            <span className="uppercase tracking-wider">
              {room.currentWord}
            </span>
          ) : (
            <span className="tracking-[0.3em]">
              {room.currentWord?.replace(/[a-zA-Z]/g, "_ ")}
            </span>
          )}
        </div>

        {/* Timer */}
        <div
          className={`
            text-[32px] leading-[1.2] flex items-center justify-end gap-2
            ${timeLeft <= 10
              ? "text-[var(--color-error)] animate-pulse"
              : "text-[var(--color-secondary)]"
            }
          `}
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            timer
          </span>
          {formatTime(timeLeft)}
        </div>
      </div>
    </header>
  );
}
