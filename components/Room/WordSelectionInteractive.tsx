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
    <div className="text-center w-full max-w-2xl animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-black text-slate-800 mb-2">Choose a word!</h2>
      <p className="text-slate-500 font-medium mb-8">What are you going to draw?</p>
      
      <div className="flex justify-center gap-4">
        {wordChoices?.map((word: string) => (
          <button
            key={word}
            disabled={selecting}
            onClick={() => handleSelectWord(word)}
            className="px-8 py-4 bg-white hover:bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-400 text-indigo-700 font-bold text-xl rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
