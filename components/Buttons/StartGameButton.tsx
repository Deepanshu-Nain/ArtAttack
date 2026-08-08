export default function StartGameButton({
  disabled,
  allPlayersReady,
  playerCount,
  onStartGame,
}: {
  disabled: boolean;
  allPlayersReady: boolean;
  playerCount: number;
  onStartGame: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
      <button
        disabled={disabled}
        onClick={onStartGame}
        className={`
          relative group w-full md:w-auto
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div
          className={`
            text-[24px] leading-[1] uppercase
            px-8 py-4
            cardboard-btn
            rotate-[1deg]
            flex items-center justify-center gap-2
            w-full
            transition-transform duration-150
            ${disabled ? "" : "group-hover:scale-105 group-hover:rotate-0"}
            ${
              disabled
                ? "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]"
                : "bg-[var(--color-primary-container)] text-[var(--color-on-surface)]"
            }
          `}
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span>Start Game</span>
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            play_circle
          </span>
        </div>
      </button>

      {playerCount < 2 ? (
        <p
          className="text-[18px] text-[var(--color-error)] rotate-[-1deg]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Waiting for players to join...
        </p>
      ) : !allPlayersReady ? (
        <p
          className="text-[18px] text-[var(--color-secondary)] rotate-[1deg]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Waiting for all players to be ready...
        </p>
      ) : null}
    </div>
  );
}
