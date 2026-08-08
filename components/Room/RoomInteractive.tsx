"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { Player, Room } from "@/types/game";
import PlayerCard from "./PlayerCard";
import StartGameButton from "../Buttons/StartGameButton";
import ReadyButton from "../Buttons/ReadyButton";
import GameCanvas from "./GameCanvas";

export default function RoomInteractive({
  initialRoom,
  roomCode,
}: {
  initialRoom: Room;
  roomCode: string;
}) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/room/${roomCode}`);
      if (!res.ok) throw new Error(`Failed to load room (HTTP ${res.status})`);

      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error("Error fetching room:", err);
    }
  };

  useEffect(() => {
    const storedPlayerId = localStorage.getItem("playerId");
    setCurrentPlayerId(storedPlayerId); // eslint-disable-line react-hooks/set-state-in-effect

    const socket = getSocket();
    socket.connect();
    setSocket(socket);

    socket.emit("join-room", { roomCode, playerId: storedPlayerId });

    socket.on("room-updated", () => {
      fetchRoom();
    });

    return () => {
      socket.off("room-updated");
      socket.disconnect();
    };
  }, [roomCode]);

  const me = room.players.find((p: Player) => p.id === currentPlayerId);
  const isHost = me?.isHost;
  const isReady = me?.isReady ?? false;

  const allPlayersReady = room.players.every(
    (p: Player) => p.isHost || p.isReady
  );

  const handleToggleReady = () => {
    if (!currentPlayerId || !socket) return;

    // Optimistic update
    setRoom((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === currentPlayerId ? { ...p, isReady: !isReady } : p
      ),
    }));

    socket.emit("toggle-ready", {
      roomCode,
      playerId: currentPlayerId,
      isReady: !isReady,
    });
  };

  const handleStartGame = () => {
    if (!currentPlayerId || !socket) return;

    // Optimistic update
    setRoom((prev) => ({ ...prev, started: true }));

    socket.emit("start-game", { roomCode });
  };

  if (room.started && socket) {
    return (
      <GameCanvas
        room={room}
        currentPlayerId={currentPlayerId as string}
        roomCode={roomCode}
        socket={socket}
      />
    );
  }

  return (
    <section className="bg-[var(--color-surface-container-high)] p-8 md:p-12 sketch-border rotate-[-1deg] w-full max-w-3xl text-center relative mt-12 mx-4">
      {/* Tape accents */}
      <div className="tape-strip absolute w-24 h-8 -top-4 left-1/2 -translate-x-1/2 rotate-[2deg]" />
      <div className="tape-strip absolute w-16 h-6 -bottom-3 -right-3 rotate-[-10deg]" />

      <h1
        className="text-[48px] leading-[1.2] mb-4 text-[var(--color-on-surface)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Room Lobby
      </h1>

      <div
        className="
          inline-flex items-center gap-4 mb-12
          bg-[var(--color-surface-container)]
          px-4 py-2
          rough-border
          rotate-[1deg]
        "
      >
        <span
          className="text-[18px] text-[var(--color-on-surface-variant)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Room Code:
        </span>
        <span
          className="text-[24px] tracking-widest text-[var(--color-on-surface)] select-all"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {roomCode}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {room.players.map((player: Player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        {isHost ? (
          <StartGameButton
            disabled={!allPlayersReady || room.players.length < 2}
            allPlayersReady={allPlayersReady}
            playerCount={room.players.length}
            onStartGame={handleStartGame}
          />
        ) : (
          <ReadyButton isReady={isReady} onToggleReady={handleToggleReady} />
        )}
      </div>
    </section>
  );
}
