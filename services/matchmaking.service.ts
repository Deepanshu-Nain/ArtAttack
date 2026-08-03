import { registerPlayer, assignPlayerToRoom } from "./player.service";
import { createRoom, findAvailableRoom, getRoomInfo } from "./room.service";
import { CreatePlayerDTO } from "@/types/dto";

export async function joinMatchmaking(
  data: CreatePlayerDTO
) {
  let player = await registerPlayer(data);

  let room = await findAvailableRoom();
  let isHost = false;

  if (!room) {
    room = await createRoom();
    // Since we created the room, this player is the first one in it and should be host.
    isHost = true;
  } else if (room.players.length === 0) {
    // Edge case: an empty room was somehow found.
    isHost = true;
  }

  // Assign player to the found/created room
  player = await assignPlayerToRoom(player.id, room.id, isHost);

  // Re-fetch the room so the returned players list includes the player we just added.
  room = await getRoomInfo(room.code);

  return {
    success: true,
    room,
    player,
  };
}

export async function createPrivateRoom(
  data: CreatePlayerDTO
) {
  let player = await registerPlayer(data);

  // A private room is always freshly created — no matchmaking lookup.
  const room = await createRoom();
  player = await assignPlayerToRoom(player.id, room.id, true);

  // Re-fetch the room so the returned players list includes the player we just added.
  const updatedRoom = await getRoomInfo(room.code);

  return {
    success: true,
    room: updatedRoom,
    player,
  };
}