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
      <div className="h-16 bg-slate-800 p-2 flex gap-4 border-t border-slate-700 opacity-50 pointer-events-none items-center justify-center">
        <div className="text-white text-xs tracking-widest font-bold">
          VIEWING MODE
        </div>
      </div>
    );
  }

  return (
    <div className="h-20 bg-slate-800 p-2 flex flex-row items-center justify-center gap-4 border-t border-slate-700 overflow-x-auto w-full">
      {children}
    </div>
  );
}
