"use client";

type JoinRoomButtonProps = {
  onJoin: () => void;
};

export default function JoinRoomButton({
  onJoin,
}: JoinRoomButtonProps) {
  return (
    <button
      onClick={onJoin}
      className="relative group w-full md:w-auto"
    >
      <div
        className="
          bg-[var(--color-surface-container)]
          text-[var(--color-on-surface)]
          text-[18px] leading-[1]
          uppercase
          px-6 py-3
          rough-border
          paper-shadow
          rotate-[1deg]
          group-hover:scale-105
          group-hover:rotate-0
          transition-transform
          duration-150
          flex items-center justify-center gap-2
          w-full
        "
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span>Join Private Room</span>
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          meeting_room
        </span>
      </div>
    </button>
  );
}