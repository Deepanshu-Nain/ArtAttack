import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function createRoom(code: string) {
  return prisma.room.create({
    data: {
      code,
    },
    include: {
      players: true,
    },
  });
}

export async function getAvailableRoom() {
  return prisma.room.findFirst({
    where: {
      started: false,
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