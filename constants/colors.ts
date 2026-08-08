/**
 * Shared constants for the drawing toolbar.
 * Centralized here so they can be referenced by ToolBar and any
 * future component that needs the palette (e.g. color-picker modals).
 */

/** Palette colors available in the drawing toolbar. */
export const PALETTE_COLORS = [
  "#000000",
  "#ffffff",
  "#ef4444", // red
  "#22c55e", // green
  "#3b82f6", // blue
  "#eab308", // yellow
  "#06b6d4", // cyan
  "#d946ef", // fuchsia
  "#f97316", // orange
  "#6366f1", // indigo
  "#78716c", // stone
  "#a16207", // amber-dark
] as const;

/** Available brush sizes (px). */
export const BRUSH_SIZES = [4, 10, 20] as const;
