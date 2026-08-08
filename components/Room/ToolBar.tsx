"use client";

import ToolBarLayout from "./ToolBarLayout";
import { PALETTE_COLORS, BRUSH_SIZES } from "@/constants/colors";

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
      {/* Color Swatches */}
      <div className="flex flex-row gap-1.5 items-center flex-wrap justify-center">
        {PALETTE_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setCurrentColor(c)}
            aria-label={`Color ${c}`}
            className={`
              w-8 h-8 rounded-full sketch-border flex-shrink-0
              hover:scale-110 transition-transform
              ${currentColor === c
                ? "ring-4 ring-[var(--color-outline)] ring-offset-2 ring-offset-[var(--color-surface-container-low)]"
                : ""
              }
            `}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[var(--color-pencil)] mx-2 opacity-50 flex-shrink-0" />

      {/* Brush Sizes */}
      <div className="flex flex-row items-center gap-2">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => {
              setBrushSize(size);
              setCurrentTool("brush");
            }}
            className={`
              flex items-center justify-center w-10 h-10
              bg-[var(--color-surface-container)]
              sketch-border
              hover:scale-110 transition-transform
              ${brushSize === size && currentTool === "brush"
                ? "ring-2 ring-[var(--color-primary)]"
                : ""
              }
            `}
          >
            <div
              className="bg-[var(--color-on-surface)] rounded-full"
              style={{ width: size, height: size }}
            />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[var(--color-pencil)] mx-2 opacity-50 flex-shrink-0" />

      {/* Fill Tool */}
      <button
        onClick={() => setCurrentTool("fill")}
        className={`
          flex items-center justify-center w-10 h-10
          bg-[var(--color-surface-container)]
          sketch-border
          hover:scale-110 transition-transform flex-shrink-0
          ${currentTool === "fill" ? "ring-2 ring-[var(--color-primary)]" : ""}
        `}
        title="Fill Bucket"
      >
        <span className="material-symbols-outlined text-[var(--color-on-surface)]">
          format_color_fill
        </span>
      </button>

      {/* Eraser */}
      <button
        onClick={() => setCurrentColor("#ffffff")}
        aria-label="Eraser"
        className={`
          w-12 h-8
          bg-[var(--color-secondary-fixed-dim)]
          border-2 border-[var(--color-secondary)]
          rounded-sm
          paper-shadow
          rotate-[-4deg]
          hover:scale-105 hover:rotate-0
          transition-transform
          flex items-center justify-center flex-shrink-0
          ${currentColor === "#ffffff" ? "ring-2 ring-[var(--color-primary)]" : ""}
        `}
      >
        <span className="material-symbols-outlined text-[var(--color-on-secondary-fixed-variant)] text-sm">
          ink_eraser
        </span>
      </button>

      {/* Undo */}
      <button
        onClick={onUndo}
        className="
          w-10 h-10 flex items-center justify-center
          hover:scale-110 transition-transform
          text-[var(--color-on-surface-variant)] flex-shrink-0
        "
        title="Undo"
      >
        <span className="material-symbols-outlined">undo</span>
      </button>

      {/* Clear */}
      <button
        onClick={onClearCanvas}
        className="
          w-10 h-10 flex items-center justify-center
          hover:scale-110 transition-transform
          text-[var(--color-on-surface-variant)] flex-shrink-0
        "
        title="Clear Canvas"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </ToolBarLayout>
  );
}
