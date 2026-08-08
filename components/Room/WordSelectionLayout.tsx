import { ReactNode } from "react";

export default function WordSelectionLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        bg-fibrous
        min-h-[600px]
        flex flex-col items-center justify-center
        p-8
        sketch-border
        relative
      "
    >
      {children}
    </div>
  );
}
