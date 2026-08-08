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
      className="relative group w-full md:w-auto"
    >
      <div
        className={`
          text-[24px] leading-[1] uppercase
          px-8 py-4
          cardboard-btn
          rotate-[-1deg]
          flex items-center justify-center gap-2
          w-full
          transition-transform duration-150
          group-hover:scale-105 group-hover:rotate-0
          ${
            isReady
              ? "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]"
              : "bg-[#a3e635] text-[var(--color-on-surface)]" /* Bright green for ready up */
          }
        `}
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span>{isReady ? "Cancel Ready" : "Ready Up!"}</span>
        {!isReady && (
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        )}
      </div>
    </button>
  );
}
