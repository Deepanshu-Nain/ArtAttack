import { NextResponse } from "next/server";
import { setPlayerReady } from "@/services/player.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { playerId, isReady } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Player ID is required" },
        { status: 400 }
      );
    }

    const player = await setPlayerReady(playerId, Boolean(isReady));

    return NextResponse.json({ success: true, player });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
