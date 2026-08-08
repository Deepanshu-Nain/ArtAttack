import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function createRoom(code: string, isPrivate = false) {
  return prisma.room.create({
    data: {
      code,
      isPrivate,
    },
    include: {
      players: true,
    },
  });
}

/**
 * Find a room for public matchmaking ("Join Journal"):
 *  - not already started,
 *  - a PUBLIC room (private rooms are only reachable via room code),
 *  - still has at least one player who is genuinely connected right now.
 *
 * The `connected` guard is what keeps stale rooms from an older process/session
 * (e.g. leftover localhost games) out of the public queue: after a server boot
 * every player is flipped to disconnected, so abandoned rooms with ghost
 * players are never offered to new joiners.
 */
export async function getAvailableRoom() {
  return prisma.room.findFirst({
    where: {
      started: false,
      isPrivate: false,
      players: {
        some: {
          connected: true,
        },
      },
    },
    include: {
      players: true,
    },
  });
}

export async function getRoomByCode(code: string) {
  return prisma.room.findUnique({
    where: {
      code,
    },
    include: {
      players: true,
    },
  });
}

export async function updateRoom(code: string, data: Prisma.RoomUpdateInput) {
  return prisma.room.update({
    where: { code },
    data,
    include: {
      players: true,
    },
  });
}

export async function deleteRoom(code: string) {
  return prisma.room.delete({
    where: { code },
  });
}