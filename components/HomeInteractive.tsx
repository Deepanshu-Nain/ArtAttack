"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AvatarPicker from "./Avatar/AvatarPicker";
import UsernameInput from "./Input/UsernameInput";
import PlayButton from "./Buttons/PlayButton";
import CreateRoomButton from "./Buttons/CreateRoomButton";
import { joinPublicGame, joinPrivateGame } from "../lib/game";

export default function HomeInteractive() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(0);
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
      </div>
    </>
  );
}