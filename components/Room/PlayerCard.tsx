import { Player } from "@/types/game";

export default function PlayerCard({
  player,
  layout = "vertical"
}: {
  player: Player,
  layout?: "vertical" | "horizontal"
}) {
  if (layout === "horizontal") {
    return (
      <div className="flex flex-row items-center bg-white p-3 relative hover:bg-slate-50 transition-colors w-full gap-3">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold shadow-inner relative">
          {player.avatar}
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="font-semibold truncate w-full text-slate-800 text-left text-sm">
            {player.username}
          </span>
          <span className="text-xs font-bold text-indigo-500 mt-0.5 text-left">
            {player.score || 0} pts
          </span>
        </div>
        {player.isDrawer && (
          <span className="text-xl" title="Drawing">
            ✏️
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg relative border border-gray-700 transition-colors">
      <div className="w-16 h-16 bg-indigo-600 rounded-full mb-2 flex items-center justify-center text-2xl font-bold shadow-inner relative">
        {player.avatar}

        {/* Ready Indicator */}
        {player.isReady && !player.isHost && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">
            <span className="text-xs text-white">✓</span>
          </div>
        )}
      </div>
      <span className="font-semibold truncate w-full text-center text-white">
        {player.username}
      </span>
      <span className="text-sm font-medium text-indigo-300 mt-1">
        {player.score || 0} pts
      </span>
      {player.isHost && (
        <span className="absolute -top-3 -right-3 text-2xl" title="Host">
          👑
        </span>
      )}
    </div>
  );
}
