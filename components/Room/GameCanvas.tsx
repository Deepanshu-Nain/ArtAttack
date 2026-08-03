import { Socket } from "socket.io-client";

import { Player, Room } from "@/types/game";
import ActiveGame from "./ActiveGame";
import WordSelectionLayout from "./WordSelectionLayout";
import WordSelectionInteractive from "./WordSelectionInteractive";
import WordSelectionWaiting from "./WordSelectionWaiting";

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
  const isDrawer = room.currentDrawerId === currentPlayerId;
  const drawerPlayer = room.players.find((p: Player) => p.id === room.currentDrawerId);

  // If a word is already chosen, the round is actively being drawn
  if (room.currentWord) {
    return (
      <ActiveGame 
        room={room}
        currentPlayerId={currentPlayerId}
        roomCode={roomCode}
        socket={socket}
      />
    );
  }

  // Otherwise, we are in the word selection phase
  return (
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
  );
}
