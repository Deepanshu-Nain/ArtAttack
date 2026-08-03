export default function ReadyButton({
  isReady,
  onToggleReady,
}: {
  isReady: boolean;
  onToggleReady: () => void;
}) {
  return (
    <button
      onClick={onToggleReady}
      className={`font-bold py-3 px-8 rounded-full text-xl transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.2)] w-full sm:w-auto
        ${
          isReady
            ? "bg-gray-600 text-white hover:bg-gray-500"
            : "bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_rgb(21,128,61)]"
        }`}
    >
      {isReady ? "Cancel Ready" : "Ready Up!"}
    </button>
  );
}
