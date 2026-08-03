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
    <>
      <button
        disabled={disabled}
        onClick={onStartGame}
        className={`font-bold py-3 px-8 rounded-full text-xl transition-all shadow-[0_4px_0_rgba(0,0,0,0.2)] w-full sm:w-auto
          ${
            disabled
              ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none translate-y-[4px]"
              : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-[0_4px_0_rgb(67,56,202)]"
          }`}
      >
        Start Game
      </button>
      {playerCount < 2 ? (
        <p className="text-sm text-gray-400">Waiting for players to join...</p>
      ) : !allPlayersReady ? (
        <p className="text-sm text-yellow-500">
          Waiting for all players to be ready...
        </p>
      ) : null}
    </>
  );
}
