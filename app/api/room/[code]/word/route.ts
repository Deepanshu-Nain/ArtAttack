import { NextResponse } from "next/server";
import { updateRoom, getRoomByCode } from "@/repositories/room.repository";

export async function POST(
  req: Request,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const params = await props.params;
    const { code } = params;
    const body = await req.json();
    const { playerId, word } = body;

    const room = await getRoomByCode(code);
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    if (room.currentDrawerId !== playerId) {
      return NextResponse.json({ success: false, error: "Not the current drawer" }, { status: 403 });
    }

    if (!room.wordChoices.includes(word)) {
      return NextResponse.json({ success: false, error: "Invalid word choice" }, { status: 400 });
    }

    // Set the chosen word and clear choices
    await updateRoom(code, {
      currentWord: word,
      wordChoices: [], // Clear choices once picked
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown Error" },
      { status: 500 }
    );
  }
}
