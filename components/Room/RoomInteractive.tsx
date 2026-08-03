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
      // Note: a dev-server crash can return an HTML page here; we log it as a
      // regular error rather than crashing on an unparseable JSON response.
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
    <section className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border border-gray-700">
      <h1 className="text-3xl font-bold mb-2 text-indigo-400">Room Lobby</h1>
      <p className="text-gray-400 mb-8">
        Room Code:{" "}
        <span className="font-mono text-white bg-gray-900 px-3 py-1 rounded select-all">
          {roomCode}
        </span>
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
