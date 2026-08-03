import { getRoomByCode, updateRoom } from "@/repositories/room.repository";
import { generateWordChoices } from "./word.service";

export async function startNextRound(code: string) {
  const room = await getRoomByCode(code);

  if (!room) {
    throw new Error("Room not found");
  }

  // No players left: reset the room back to the lobby state.
  if (room.players.length === 0) {
    return updateRoom(code, {
      started: false,
      currentWord: null,
      currentDrawerId: null,
      roundEndsAt: null,
      wordChoices: [],
      currentRound: 1,
    });
  }

  // Pick the next drawer.
  // For simplicity, we just pick the first player if currentDrawerId is null, 
  // or the next player in the array.
  let nextDrawerIndex = 0;
  let nextRound = room.currentRound;

  if (room.currentDrawerId) {
    const currentIndex = room.players.findIndex(p => p.id === room.currentDrawerId);
    nextDrawerIndex = currentIndex + 1;
    
    if (nextDrawerIndex >= room.players.length) {
      nextDrawerIndex = 0;
      nextRound++;
    }
  }

  // If we exceeded max rounds, game is over
  if (nextRound > room.maxRounds) {
    return updateRoom(code, {
      started: false,
      currentWord: null,
      currentDrawerId: null,
      roundEndsAt: null,
      wordChoices: [],
      currentRound: 1, // Reset for next time they start
    });
  }

  const nextDrawerId = room.players[nextDrawerIndex]?.id || null;
  const wordChoices = generateWordChoices(3);

  // Give them 15 seconds to choose a word
  const roundEndsAt = new Date(Date.now() + 15 * 1000);

  return updateRoom(code, {
    currentDrawerId: nextDrawerId,
    wordChoices,
    currentWord: null,
    roundEndsAt,
    currentRound: nextRound,
  });
}
