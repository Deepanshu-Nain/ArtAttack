import Link from "next/link";
import { ReactNode } from "react";

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-fibrous py-12 px-4 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative">
          <Link
            href="/"
            className="text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2 rotate-[-1deg] hover:rotate-0 transition-transform duration-200"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
            <span className="text-[18px] font-bold">Back to Home</span>
          </Link>
          <h1
            className="text-4xl md:text-5xl text-[var(--color-on-surface)] drop-shadow-md tracking-wider rotate-[1deg] uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Global Leaderboard
          </h1>
          <div className="w-[150px]"></div> {/* Spacer for centering */}
        </div>

        {/* Board */}
        <div className="bg-[var(--color-surface-container-low)] sketch-border paper-shadow-lg overflow-hidden relative rotate-[0.5deg]">
          {/* Tape anchoring */}
          <div className="tape-strip absolute w-24 h-8 -top-4 left-1/2 -translate-x-1/2 rotate-[-2deg]" />

          {/* Table Header */}
          <div className="tape-strip p-4 grid grid-cols-12 gap-4 font-bold text-lg text-[var(--color-on-surface)]">
            <div className="col-span-3 text-center" style={{ fontFamily: "var(--font-display)" }}>Rank</div>
            <div className="col-span-6" style={{ fontFamily: "var(--font-display)" }}>Player</div>
            <div className="col-span-3 text-right pr-4" style={{ fontFamily: "var(--font-display)" }}>Score</div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto bg-dotted-paper">
            {children}
          </div>

        </div>

      </div>
    </main>
  );
}