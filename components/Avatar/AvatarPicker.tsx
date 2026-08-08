"use client";

import { avatars } from "./avatars";

type AvatarPickerProps = {
  avatar: number;
  setAvatar: React.Dispatch<React.SetStateAction<number>>;
};

export default function AvatarPicker({
  avatar,
  setAvatar,
}: AvatarPickerProps) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className="
          w-32 h-32
          bg-[var(--color-surface-container-low)]
          rough-border
          flex items-center justify-center gap-6
          paper-shadow
          relative
          lined-paper
        "
      >
        {/* Previous avatar */}
        <button
          onClick={() =>
            setAvatar((prev) => (prev - 1 + avatars.length) % avatars.length)
          }
          className="
            text-2xl
            text-[var(--color-pencil)]
            hover:text-[var(--color-primary)]
            hover:scale-110
            transition
            z-10
          "
        >
          ◀
        </button>

        {/* Current avatar */}
        <div className="text-5xl select-none">{avatars[avatar]}</div>

        {/* Next avatar */}
        <button
          onClick={() =>
            setAvatar((prev) => (prev + 1) % avatars.length)
          }
          className="
            text-2xl
            text-[var(--color-pencil)]
            hover:text-[var(--color-primary)]
            hover:scale-110
            transition
            z-10
          "
        >
          ▶
        </button>

        {/* Small tape piece */}
        <div className="absolute -bottom-3 -right-3 w-8 h-8 tape-strip rotate-12" />
      </div>

      <span
        className="
          text-[14px] leading-[1.2]
          text-[var(--color-on-surface-variant)]
          rotate-[-2deg]
          bg-[var(--color-surface-container)]
          px-2 py-1
          rough-border
        "
        style={{ fontFamily: "var(--font-body)" }}
      >
        Pick your avatar!
      </span>
    </div>
  );
}