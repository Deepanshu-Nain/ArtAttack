import { avatars } from "@/components/Avatar/avatars";

export default function LeaderboardRow({
  player,
  index,
}: {
  player: { id: string; username: string; avatar: number; score: number };
  index: number;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-4 items-center p-4 border-b border-slate-200 transition-colors hover:bg-indigo-50
        ${index === 0 ? "bg-yellow-50" : ""}
        ${index === 1 ? "bg-gray-100" : ""}
        ${index === 2 ? "bg-orange-50" : ""}
      `}
    >
      <div className="col-span-2 text-center">
        <span
          className={`text-2xl font-black 
          ${index === 0 ? "text-yellow-500 drop-shadow-md" : ""}
          ${index === 1 ? "text-gray-400 drop-shadow-md" : ""}
          ${index === 2 ? "text-orange-400 drop-shadow-md" : ""}
          ${index > 2 ? "text-slate-400" : ""}
        `}
        >
          #{index + 1}
        </span>
      </div>

      <div className="col-span-7 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-indigo-200">
          {avatars[player.avatar] || avatars[0]}
        </div>
        <span
          className={`font-bold text-lg truncate ${
            index < 3 ? "text-indigo-900" : "text-slate-700"
          }`}
        >
          {player.username}
        </span>
      </div>

      <div className="col-span-3 text-right pr-4">
        <span className="font-black text-xl text-indigo-600">
          {player.score.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
