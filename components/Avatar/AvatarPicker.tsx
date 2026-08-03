"use client";

import { avatars } from "./avatars";


// use of props(property) here 

type AvatarPickerProps = {     // i dont own the avtar , instead it says - someone else gives me the avatar
  avatar: number;
  setAvatar: React.Dispatch<React.SetStateAction<number>>;
};

export default function AvatarPicker({
  avatar,
  setAvatar,
}: AvatarPickerProps) {
  return (
    <div className="mt-6 flex h-56 select-none items-center justify-center gap-10 rounded bg-blue-800">

      <button
        onClick={() =>
          setAvatar((prev) => (prev - 1 + avatars.length) % avatars.length)
        }
        className="text-5xl text-white hover:scale-110 transition"
      >
        ◀
      </button>

      <div className="text-8xl">
        {avatars[avatar]}
      </div>

      <button
        onClick={() =>
          setAvatar((prev) => (prev + 1) % avatars.length)
        }
        className="text-5xl text-white hover:scale-110 transition"
      >
        ▶
      </button>

    </div>
  );
}