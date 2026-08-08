import { generateRoomCode } from "@/lib/utils";
import {
  createRoom as repoCreateRoom,
  getAvailableRoom as repoGetAvailableRoom,
  getRoomByCode as repoGetRoomByCode,
  updateRoom,
  deleteRoom as repoDeleteRoom,
} from "@/repositories/room.repository";
import { deletePlayer, makePlayerHost, resetPlayerScores } from "./player.service";
import { startNextRound } from "./round.service";

export async function findAvailableRoom() {
  const room = await repoGetAvailableRoom();

  if (room && room.players.length < room.maxPlayers) {
    return room;
  }

  return null;
}

export async function createRoom(isPrivate = false) {
  const code = generateRoomCode();
  return repoCreateRoom(code, isPrivate);
}

export async function getRoomInfo(code: string) {
  return repoGetRoomByCode(code);
}

export async function startGame(code: string) {
  // Reset all player scores before starting a new match
  const room = await repoGetRoomByCode(code);
  if (room) {
    await resetPlayerScores(room.players.map((p) => p.id));
  }

  await updateRoom(code, { started: true });
  return startNextRound(code);
}

export async function deleteRoom(code: string) {
  return repoDeleteRoom(code);
}

/**
 * Handle a player leaving a room (disconnect / explicit leave).
 *
 * - Deletes the player.
 * - Cleans up the room entirely when it becomes empty.
 * - Reassigns the host to the first remaining player if the host left.
 * - Advances to the next drawer if the current drawer left mid-round.
 *
 * Returns the updated room, or `null` if the room was deleted.
 */
export async function handlePlayerLeave(
  code: string,
  playerId: string
) {
  const room = await getRoomInfo(code);
  if (!room) return null;

  const leavingPlayer = room.players.find((p) => p.id === playerId);
  const remainingPlayers = room.players.filter((p) => p.id !== playerId);

  await deletePlayer(playerId);

  // Room is now empty -> delete it so abandoned rooms don't accumulate.
  if (remainingPlayers.length === 0) {
    await deleteRoom(code);
    return null;
  }

  // If the host left, promote the first remaining player to host.
  if (leavingPlayer?.isHost) {
    await makePlayerHost(remainingPlayers[0].id);
  }

  // If the current drawer left, skip to the next drawer.
  if (room.currentDrawerId === playerId) {
    return startNextRound(code);
  }

  return getRoomInfo(code);
}