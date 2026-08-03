import Link from "next/link";
import { ReactNode } from "react";

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#1453C2] py-12 px-4 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="text-white hover:text-indigo-200 transition-colors font-bold text-lg flex items-center gap-2"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-wider">GLOBAL LEADERBOARD</h1>
          <div className="w-[120px]"></div> {/* Spacer for centering */}
        </div>

        {/* Board */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#0c357d] overflow-hidden">
          
          {/* Table Header */}
          <div className="bg-[#0c357d] text-white p-4 grid grid-cols-12 gap-4 font-bold text-lg border-b-4 border-[#09275a]">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-7">Player</div>
            <div className="col-span-3 text-right pr-4">Score</div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto bg-slate-50">
            {children}
          </div>

        </div>

      </div>
    </main>
  );
}
