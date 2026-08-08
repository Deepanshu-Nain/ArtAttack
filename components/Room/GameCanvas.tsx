"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import { Player, Room } from "@/types/game";
import ActiveGame from "./ActiveGame";
import WordSelectionLayout from "./WordSelectionLayout";
import WordSelectionInteractive from "./WordSelectionInteractive";
import WordSelectionWaiting from "./WordSelectionWaiting";
import RoundResults, { RoundResultPlayer } from "./RoundResults";

type RoundResultsData = {
  round: number;
  word: string | null;
  gameOver: boolean;
  players: RoundResultPlayer[];
};

export default function GameCanvas({
  room,
  currentPlayerId,
  roomCode,
  socket,
}: {
  room: Room;
  currentPlayerId: string;
  roomCode: string;
  socket: Socket | null;
}) {
  const [results, setResults] = useState<RoundResultsData | null>(null);

  // Listen for the round-end results broadcast from the server.
  useEffect(() => {
    if (!socket) return;

    const onRoundResults = (data: {
      word: string | null;
      gameOver: boolean;
      players: RoundResultPlayer[];
    }) => {
      setResults({ round: room.currentRound, ...data });
    };

    socket.on("round-results", onRoundResults);
    return () => {
      socket.off("round-results", onRoundResults);
    };
  }, [socket, room.currentRound]);

  // When the client sees the room advance to a later round, the results for the
  // finished round are no longer relevant — clear the overlay.
  useEffect(() => {
    if (results && room.currentRound !== results.round) {
      setResults(null);
    }
  }, [room.currentRound, results]);

  const isDrawer = room.currentDrawerId === currentPlayerId;
  const drawerPlayer = room.players.find((p: Player) => p.id === room.currentDrawerId);

  return (
    <>
      {room.currentWord ? (
        <ActiveGame
          room={room}
          currentPlayerId={currentPlayerId}
          roomCode={roomCode}
          socket={socket}
        />
      ) : (
        <WordSelectionLayout>
          {isDrawer ? (
            <WordSelectionInteractive
              wordChoices={room.wordChoices}
              socket={socket}
              roomCode={roomCode}
              playerId={currentPlayerId}
            />
          ) : (
            <WordSelectionWaiting drawerName={drawerPlayer?.username || "The drawer"} />
          )}
        </WordSelectionLayout>
      )}

      {results && (
        <RoundResults
          word={results.word}
          gameOver={results.gameOver}
          players={results.players}
        />
      )}
    </>
  );
}