import { Player } from "@/types/game";
import { avatars } from "@/components/Avatar/avatars";

export default function PlayerCard({
  player,
  layout = "vertical",
}: {
  player: Player;
  layout?: "vertical" | "horizontal";
}) {
  const emoji = avatars[player.avatar] ?? avatars[0];

  if (layout === "horizontal") {
    const isCurrentDrawer = player.isDrawer;

    return (
      <div
        className={`
          flex items-center gap-3 p-2
          transition-all
          ${isCurrentDrawer
            ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rotate-[1deg] paper-shadow rounded-sm"
            : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] hover:rotate-[-1deg]"
          }
        `}
      >
        {/* Drawer icon or person icon */}
        {isCurrentDrawer ? (
          <span className="material-symbols-outlined text-[var(--color-primary)]">edit</span>
        ) : (
          <span className="material-symbols-outlined opacity-50">person</span>
        )}

        {/* Name + Emoji */}
        <span
          className={`flex-grow text-lg truncate ${isCurrentDrawer ? "font-bold" : ""}`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {emoji} {player.username}
        </span>

        {/* Score */}
        <span
          className="text-[20px] leading-[1]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {player.score || 0}
        </span>
      </div>
    );
  }

  // Vertical layout (lobby)
  return (
    <div
      className="
        flex flex-col items-center
        bg-[var(--color-surface-container)]
        p-4
        sketch-border
        relative
        transition-all
        hover:rotate-[-1deg]
      "
    >
      {/* Avatar */}
      <div
        className="
          w-16 h-16
          bg-[var(--color-surface-container-low)]
          rough-border
          mb-2
          flex items-center justify-center
          text-2xl
          paper-shadow
          relative
        "
      >
        {emoji}

        {/* Ready Indicator */}
        {player.isReady && !player.isHost && (
          <div
            className="
              absolute -bottom-1 -right-1
              bg-[var(--color-primary-container)]
              rough-border
              w-5 h-5
              flex items-center justify-center
            "
          >
            <span className="text-xs text-[var(--color-on-primary-container)]">✓</span>
          </div>
        )}
      </div>

      {/* Username */}
      <span
        className="font-semibold truncate w-full text-center text-[var(--color-on-surface)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {player.username}
      </span>

      {/* Score */}
      <span
        className="text-sm mt-1 text-[var(--color-secondary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {player.score || 0} pts
      </span>

      {/* Host crown */}
      {player.isHost && (
        <span className="absolute -top-3 -right-3 text-2xl" title="Host">
          👑
        </span>
      )}
    </div>
  );
}
