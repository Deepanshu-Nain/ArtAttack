import { ReactNode } from "react";

export default function WordSelectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-100 rounded-xl shadow-inner border-2 border-slate-200 h-[600px] flex items-center justify-center p-8">
      {children}
    </div>
  );
}
