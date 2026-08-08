import { ReactNode } from "react";

export default function ToolBarLayout({
  isDrawer,
  children,
}: {
  isDrawer: boolean;
  children: ReactNode;
}) {
  if (!isDrawer) {
    return (
      <div
        className="
          h-16 mt-6 p-3
          bg-[var(--color-surface-container)]
          sketch-border
          opacity-50 pointer-events-none
          flex items-center justify-center
        "
      >
        <div
          className="text-[var(--color-on-surface-variant)] text-[14px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-display)" }}
        >
          VIEWING MODE
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        mt-6 p-3
        bg-[var(--color-surface-container-low)]
        sketch-border
        rotate-[1deg]
        flex flex-row items-center justify-center gap-4
        overflow-x-auto w-full
      "
    >
      {children}
    </div>
  );
}
