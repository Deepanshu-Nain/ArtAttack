"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AvatarPicker from "./Avatar/AvatarPicker";
import UsernameInput from "./Input/UsernameInput";
import PlayButton from "./Buttons/PlayButton";
import CreateRoomButton from "./Buttons/CreateRoomButton";
import JoinRoomButton from "./Buttons/JoinRoomButton";
import RoomCodeInput from "./Input/RoomCodeInput";
import { joinPublicGame, joinPrivateGame, joinGameByCode } from "../lib/game";

export default function HomeInteractive() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  const handlePlay = async () => {
    try {
      const existingPlayerId = localStorage.getItem("playerId");
      const result = await joinPublicGame({
        username,
        language: "English",
        avatar,
        playerId: existingPlayerId,
      });

      if (result.success) {
        localStorage.setItem("playerId", result.player.id);
        router.push(`/room/${result.room.code}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleCreateRoom = async () => {
    try {
      const existingPlayerId = localStorage.getItem("playerId");
      const result = await joinPrivateGame({
        username,
        language: "English",
        avatar,
        playerId: existingPlayerId,
      });

      if (result.success) {
        localStorage.setItem("playerId", result.player.id);
        router.push(`/room/${result.room.code}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleJoinByCode = async () => {
    const code = roomCode.trim().toUpperCase();
    if (code.length < 3) {
      alert("Please enter a room code first.");
      return;
    }
    try {
      const existingPlayerId = localStorage.getItem("playerId");
      const result = await joinGameByCode({
        username,
        language: "English",
        avatar,
        playerId: existingPlayerId,
        code,
      });

      if (result.success) {
        localStorage.setItem("playerId", result.player.id);
        router.push(`/room/${result.room.code}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <>
      {/* Header */}
      <header className="text-center w-full relative">
        <h1
          className="
            text-[64px] leading-[1.1] tracking-[-0.02em]
            text-[var(--color-on-surface)]
            wobbly-line
            inline-block
            mb-2
            rotate-[-1deg]
          "
          style={{ fontFamily: "var(--font-display)" }}
        >
          art-attack
        </h1>
      </header>

      {/* Interaction Area */}
      <div className="flex flex-col items-center gap-8 w-full max-w-md relative z-10">
        {/* Avatar Picker */}
        <AvatarPicker avatar={avatar} setAvatar={setAvatar} />

        {/* Name Input */}
        <UsernameInput
          username={username}
          setUsername={setUsername}
        />

        {/* Join Button (same as old Play — joins public matchmaking) */}
        <PlayButton onPlay={handlePlay} />

        {/* Create Private Room */}
        <CreateRoomButton onCreateRoom={handleCreateRoom} />

        {/* Join an existing private room by typing its code */}
        <div className="w-full flex flex-col items-center gap-3 pt-2 border-t-2 border-dashed border-[var(--color-outline-variant)]">
          <RoomCodeInput roomCode={roomCode} setRoomCode={setRoomCode} />
          <JoinRoomButton onJoin={handleJoinByCode} />
        </div>
      </div>
    </>
  );
}