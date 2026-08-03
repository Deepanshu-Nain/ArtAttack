"use client";

import ToolBarLayout from "./ToolBarLayout";

const COLORS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
  "#ffff00", "#00ffff", "#ff00ff", "#c0c0c0", "#808080",
  "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"
];

export default function ToolBar({
  isDrawer,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  currentTool,
  setCurrentTool,
  onClearCanvas,
  onUndo,
}: {
  isDrawer: boolean;
  currentColor: string;
  setCurrentColor: (c: string) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  currentTool: "brush" | "fill";
  setCurrentTool: (t: "brush" | "fill") => void;
  onClearCanvas: () => void;
  onUndo: () => void;
}) {
  return (
    <ToolBarLayout isDrawer={isDrawer}>
      {/* Tools */}
      <div className="flex flex-row gap-2">
        <button
          onClick={() => setCurrentTool("brush")}
          className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl ${currentTool === 'brush' ? 'ring-2 ring-indigo-400' : ''}`}
          title="Brush"
        >
          🖌️
        </button>
        <button
          onClick={() => setCurrentTool("fill")}
          className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl ${currentTool === 'fill' ? 'ring-2 ring-indigo-400' : ''}`}
          title="Fill Bucket"
        >
          🪣
        </button>
      </div>

      <div className="w-px h-12 bg-slate-600 mx-2 flex-shrink-0" />

      {/* Colors */}
      <div className="flex flex-row gap-1 overflow-x-auto items-center">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setCurrentColor(c)}
            className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${currentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-12 bg-slate-600 mx-2 flex-shrink-0" />

      {/* Brush Sizes */}
      <div className="flex flex-row items-center gap-3">
        {[4, 10, 20].map(size => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 ${brushSize === size ? 'ring-2 ring-indigo-400' : ''}`}
          >
            <div 
              className="bg-white rounded-full" 
              style={{ width: size, height: size }} 
            />
          </button>
        ))}
      </div>

      <div className="w-px h-12 bg-slate-600 mx-2 flex-shrink-0" />

      {/* Eraser */}
      <button
        onClick={() => setCurrentColor("#ffffff")}
        className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl flex-shrink-0 ${currentColor === '#ffffff' ? 'ring-2 ring-indigo-400' : ''}`}
        title="Eraser"
      >
        🧽
      </button>

      {/* Undo */}
      <button
        onClick={onUndo}
        className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl transition-colors flex-shrink-0"
        title="Undo"
      >
        ↩️
      </button>

      {/* Clear */}
      <button
        onClick={onClearCanvas}
        className="w-12 h-12 rounded-lg bg-red-900/50 hover:bg-red-600 text-white flex items-center justify-center text-xl transition-colors flex-shrink-0"
        title="Clear Canvas"
      >
        🗑️
      </button>
    </ToolBarLayout>
  );
}
