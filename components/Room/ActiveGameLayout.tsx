import { ReactNode } from "react";

export default function ActiveGameLayout({
  topBar,
  toolBar,
  canvasBoard,
  chatBox,
  playerList,
}: {
  topBar: ReactNode;
  toolBar: ReactNode;
  canvasBoard: ReactNode;
  chatBox: ReactNode;
  playerList: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col w-[95vw] max-w-[1400px] h-[85vh]">
      {/* Top Info Bar */}
      {topBar}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* Left: Player List */}
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
          {playerList}
        </div>

        {/* Center: Canvas + Toolbar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {canvasBoard}
          {toolBar}
        </div>

        {/* Right: ChatBox */}
        {chatBox}
      </div>
    </div>
  );
}
