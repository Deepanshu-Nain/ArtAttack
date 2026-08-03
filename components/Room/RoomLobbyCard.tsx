import { Room } from "@/types/game";
import RoomInteractive from "./RoomInteractive";

export default function RoomLobbyCard({
  initialRoom,
  roomCode,
}: {
  initialRoom: Room;
  roomCode: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-10 text-white font-sans w-full">
      <RoomInteractive initialRoom={initialRoom} roomCode={roomCode} />
    </div>
  );
}
