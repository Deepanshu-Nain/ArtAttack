"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Room } from "@/types/game";

export default function TopGameBar({
  room,
  isDrawer,
  socket
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

  return (
    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center z-10">
      <div className="font-bold text-slate-700">
        Round {room.currentRound} / {room.maxRounds}
      </div>
      <div className="text-xl font-black tracking-widest text-slate-800">
        {isDrawer ? (
          <span className="text-indigo-600 tracking-[0.2em] uppercase">{room.currentWord}</span>
        ) : (
          <span className="tracking-[0.5em]">{room.currentWord?.replace(/[a-zA-Z]/g, "_ ")}</span>
        )}
      </div>
      <div className={`font-bold flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
        ⏱ {timeLeft}s
      </div>
    </div>
  );
}
