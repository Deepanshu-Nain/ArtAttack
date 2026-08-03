import RoomLobbyCard from "@/components/Room/RoomLobbyCard";
import { getRoomInfo } from "@/services/room.service";
import { redirect } from "next/navigation";

export default async function RoomPage(
  props: { params: Promise<{ code: string }> }
) {
  const params = await props.params;
  const code = params.code;

  let room = null;
  try {
    room = await getRoomInfo(code);
  } catch (err) {
    // DB unavailable — send the player back to the home screen rather than erroring.
    console.error(`Failed to load room ${code}:`, err);
  }

  if (!room) {
    redirect("/");
  }

  const safeRoom = JSON.parse(JSON.stringify(room));

  return <RoomLobbyCard initialRoom={safeRoom} roomCode={code} />;
}
