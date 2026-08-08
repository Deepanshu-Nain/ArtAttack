import { avatars } from "@/components/Avatar/avatars";

const RANK_STYLES: Record<number, string> = {
  0: "text-[var(--color-primary)] drop-shadow-sm rotate-[-2deg]",
  1: "text-[var(--color-secondary)] drop-shadow-sm rotate-[1deg]",
  2: "text-[var(--color-on-surface-variant)] drop-shadow-sm rotate-[-1deg]",
};

export default function LeaderboardRow({
  player,
  index,
}: {
  player: { id: string; username: string; avatar: number; score: number };
  index: number;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-4 items-center p-4 border-b-2 border-dashed border-[var(--color-outline-variant)] transition-colors hover:bg-[var(--color-surface-container-high)]
        ${index === 0 ? "bg-[var(--color-primary-container)]/40" : ""}
        ${index === 1 ? "bg-[var(--color-secondary-container)]/30" : ""}
        ${index === 2 ? "bg-[var(--color-surface-container)]" : ""}
      `}
    >
      <div className="col-span-3 text-center">
        <span
          className={`text-2xl font-black ${RANK_STYLES[index] ?? "text-[var(--color-on-surface-variant)] rotate-[0.5deg]"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          #{index + 1}
        </span>
      </div>

      <div className="col-span-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--color-surface-container)] rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-[var(--color-pencil)] rotate-[-2deg]">
          {avatars[player.avatar] || avatars[0]}
        </div>
        <span
          className="font-bold text-lg truncate text-[var(--color-on-surface)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {player.username}
        </span>
      </div>

      <div className="col-span-3 text-right pr-4">
        <span
          className="font-black text-xl text-[var(--color-secondary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {player.score.toLocaleString()}
        </span>
      </div>
    </div>
  );
}