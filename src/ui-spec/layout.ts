/**
 * Panel layout is part of the UI specification: where each module's panel
 * sits on the board. Users override it by dragging and resizing; the board
 * persists their arrangement to localStorage (key below).
 */

export interface Slot {
  /** Column, row, width, height in grid units. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export const GRID = {
  cols: 6,
  rowH: 92,
  gap: 20,
  minW: 2,
  minH: 2,
} as const;

export const LAYOUT_STORAGE_KEY = "defne-dash-layout-v2";

export const DEFAULT_LAYOUT: Record<string, Slot> = {
  news: { x: 0, y: 0, w: 6, h: 5 },
  prs: { x: 0, y: 5, w: 6, h: 6 },
};

/** localStorage key bump: v1 held the pre-spec module set. */
export const REMOVED_STORAGE_KEY = "defne-dash-removed-v2";
