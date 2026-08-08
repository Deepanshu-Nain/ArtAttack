"use client";

import { avatars } from "@/components/Avatar/avatars";

export type RoundResultPlayer = {
  id: string;
  username: string;
  avatar: number;
  score: number;
  delta: number;
};

export default function RoundResults({
  word,
  gameOver,
  players,
}: {
  word: string | null;
  gameOver: boolean;
  players: RoundResultPlayer[];
}) {
  // Sort so the biggest total score sits at the top of the scrap-paper list.
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fibrous overflow-y-auto">
      {/*
        Blurred sketch of the game behind the sticky note (matches the design's
        "blurred background context" treatment).
      */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60 bg-dotted-paper"
        aria-hidden
      />

      {/* The Sticky Note (results card) */}
      <div className="sticky-note w-[90vw] max-w-[600px] p-8 md:p-12 relative flex flex-col gap-8 transition-transform hover:rotate-0 duration-300">
        {/* Masking Tape Anchor */}
        <div className="tape-strip absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 rotate-[-2deg] z-20" />

        {/* Header */}
        <div className="text-center space-y-2">
          <p
            className="text-[32px] leading-[1.4] text-[var(--color-on-primary-container)] opacity-80 uppercase tracking-widest rotate-[1deg]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            The Word Was:
          </p>
          <h1
            className="text-[64px] md:text-[80px] leading-none text-[var(--color-on-surface)] wobbly-border p-4 bg-[var(--color-surface)]/50 inline-block rotate-[-2deg] paper-shadow"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {word ?? "—"}
          </h1>
        </div>

        {/* Scoreboard */}
        <div className="w-full mt-6 pl-4 border-l-4 border-dotted border-[var(--color-on-surface-variant)]/30 flex flex-col gap-4">
          {sorted.map((player, i) => (
            <div key={player.id} className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--color-on-surface)] bg-[var(--color-surface-container-low)] flex items-center justify-center text-xl rotate-3">
                  {avatars[player.avatar] ?? avatars[0]}
                </div>
                <span
                  className="text-[20px] leading-[1] text-[var(--color-on-surface)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {player.username}
                </span>
              </div>
              <span
                className="text-[14px] leading-[1.2] text-[var(--color-secondary)] font-bold -rotate-2 group-hover:scale-110 transition-transform"
                style={{ fontFamily: "var(--font-body)" }}
              >
                +{player.delta} pts
              </span>
            </div>
          ))}
        </div>

        {/* Bottom decorative tape */}
        <div className="tape-strip absolute -bottom-3 right-8 w-24 h-6 rotate-[5deg] z-20 opacity-70" />
      </div>
    </div>
  );
}