import { registerPlayer, assignPlayerToRoom } from "./player.service";
import {
  createRoom,
  findAvailableRoom,
  getRoomInfo,
} from "./room.service";
import { CreatePlayerDTO } from "@/types/dto";

export async function joinMatchmaking(
  data: CreatePlayerDTO
) {
  let player = await registerPlayer(data);

  let room = await findAvailableRoom();
  let isHost = false;

  if (!room) {
    room = await createRoom(false);
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
  const room = await createRoom(true);
  player = await assignPlayerToRoom(player.id, room.id, true);

  // Re-fetch the room so the returned players list includes the player we just added.
  const updatedRoom = await getRoomInfo(room.code);

  return {
    success: true,
    room: updatedRoom,
    player,
  };
}

/**
 * Join an existing room by its code (used for private rooms, which are never
 * part of public "Join Journal" matchmaking). The player is added as a regular
 * (non-host) member unless the room happens to be empty — in which case they
 * become host by default.
 */
export async function joinRoomByCode(
  data: CreatePlayerDTO & { code?: string }
) {
  const code = (data.code || "").toUpperCase().trim();
  if (!code) {
    throw new Error("Please enter a room code.");
  }

  let room = await getRoomInfo(code);
  if (!room) {
    throw new Error(`No room found with code "${code}".`);
  }
  if (room.started) {
    throw new Error(`That game has already started. Ask the host to make a new one.`);
  }
  if (room.players.length >= room.maxPlayers) {
    throw new Error(`Room "${code}" is full (max ${room.maxPlayers} players).`);
  }

  // The room exists, so this player is simply joining it — not the host.
  // `code` is only used for lookup; strip it so it never leaks into a
  // prisma.player.create/update call (which would reject the unknown field).
  const { code: _code, ...playerData } = data;
  let player = await registerPlayer(playerData);
  player = await assignPlayerToRoom(player.id, room.id, false);

  // Re-fetch the room so the returned players list includes the player we just added.
  const updatedRoom = await getRoomInfo(room.code);

  return {
    success: true,
    room: updatedRoom,
    player,
  };
}