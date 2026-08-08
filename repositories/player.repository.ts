import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { CreatePlayerDTO } from "@/types/dto";

export async function getPlayerById(id: string) {
  try {
    return await prisma.player.findUnique({ where: { id } });
  } catch (err) {
    return null;
  }
}

export async function createPlayer(data: CreatePlayerDTO) {
  const { playerId, ...rest } = data;
  return prisma.player.create({
    data: rest,
  });
}

export async function updatePlayer(
  playerId: string,
  data: Prisma.PlayerUncheckedUpdateInput
) {
  return prisma.player.update({
    where: {
      id: playerId,
    },
    data,
  });
}

export async function incrementPlayerScore(playerId: string, amount: number) {
  return prisma.player.update({
    where: { id: playerId },
    data: {
      score: {
        increment: amount
      }
    }
  });
}

export async function getTopPlayers(limit: number = 100) {
  return prisma.player.findMany({
    orderBy: {
      score: 'desc'
    },
    take: limit,
    select: {
      id: true,
      username: true,
      avatar: true,
      score: true,
    }
  });
}

export async function deletePlayer(playerId: string) {
  try {
    return await prisma.player.delete({
      where: { id: playerId },
    });
  } catch (err) {
    // Player might already be deleted
    console.error(`Failed to delete player ${playerId}:`, err);
  }
}

export async function resetScores(playerIds: string[]) {
  return prisma.player.updateMany({
    where: { id: { in: playerIds } },
    data: { score: 0 },
  });
}