"use client";

type PlayButtonProps = {
  onPlay: () => void;
};

export default function PlayButton({
  onPlay,
}: PlayButtonProps) {
  return (
    <button
      onClick={onPlay}
      className="relative group mt-4 w-full md:w-auto"
    >
      {/* Tape accent */}
      <div className="absolute -top-2 -right-4 w-16 h-6 tape-strip rotate-[15deg] z-20 group-hover:bg-[var(--color-surface-variant)] transition-colors" />

      {/* Button face */}
      <div
        className="
          bg-[var(--color-primary-container)]
          text-[var(--color-on-primary-container)]
          text-[20px] leading-[1]
          uppercase
          px-8 py-4
          rough-border
          paper-shadow
          rotate-[-1deg]
          group-hover:scale-105
          group-hover:rotate-0
          transition-transform
          duration-150
          flex items-center justify-center gap-2
          w-full
        "
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span>Join Journal</span>
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          login
        </span>
      </div>
    </button>
  );
}