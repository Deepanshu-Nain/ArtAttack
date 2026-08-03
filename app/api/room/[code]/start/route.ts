import { NextResponse } from "next/server";
import { startGame, getRoomInfo } from "@/services/room.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Player ID is required" },
        { status: 400 }
      );
    }

    const room = await getRoomInfo(code);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player?.isHost) {
      return NextResponse.json(
        { success: false, message: "Only the host can start the game" },
        { status: 403 }
      );
    }

    const updatedRoom = await startGame(code);

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
