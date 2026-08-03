"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AvatarPicker from "./Avatar/AvatarPicker";
import UsernameInput from "./Input/UsernameInput";
import LanguageSelect from "./Input/LanguageSelect";
import PlayButton from "./Buttons/PlayButton";
import CreateRoomButton from "./Buttons/CreateRoomButton";
import { joinPublicGame, joinPrivateGame } from "../lib/game";

export default function HomeInteractive() {
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("English");
  const [avatar, setAvatar] = useState(0);

  const router = useRouter();

  const handlePlay = async () => {
    try {
      const existingPlayerId = localStorage.getItem("playerId");
      const result = await joinPublicGame({
        username,
        language,
        avatar,
        playerId: existingPlayerId,
      });

      if (result.success) {
        // Save player info to know who we are in the lobby
        localStorage.setItem("playerId", result.player.id);
        
        // Navigate to the Lobby
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
        language,
        avatar,
        playerId: existingPlayerId,
      });

      if (result.success) {
        // Save player info to know who we are in the lobby
        localStorage.setItem("playerId", result.player.id);

        // Navigate to the new private room
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
      <div className="flex gap-2">
        <UsernameInput
          username={username}
          setUsername={setUsername}
        />

        <LanguageSelect
          language={language}
          setLanguage={setLanguage}
        />
      </div>

      <AvatarPicker
        avatar={avatar}
        setAvatar={setAvatar}
      />

      <PlayButton onPlay={handlePlay} />

      <div className="flex w-full mt-2">
        <CreateRoomButton onCreateRoom={handleCreateRoom}/>
      </div>
    </>
  );
}