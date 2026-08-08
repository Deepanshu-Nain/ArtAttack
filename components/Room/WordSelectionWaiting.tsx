export default function WordSelectionWaiting({ drawerName }: { drawerName: string }) {
  return (
    <div className="text-center flex flex-col items-center justify-center animate-pulse">
      <div
        className="
          w-20 h-20
          bg-[var(--color-surface-container-high)]
          rough-border
          flex items-center justify-center
          mb-6
          paper-shadow
          rotate-[-2deg]
        "
      >
        <span className="material-symbols-outlined text-[40px] text-[var(--color-pencil)]">
          edit
        </span>
      </div>
      <h2
        className="text-[32px] leading-[1.2] text-[var(--color-on-surface)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <span className="font-bold">{drawerName}</span> is choosing a word...
      </h2>
    </div>
  );
}
