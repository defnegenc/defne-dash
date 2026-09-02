"use client";

/**
 * The malleable board.
 *
 * Every module panel is a motion.dev spring: grab a card to move it, pull
 * the corner puck to resize it. Positions snap to the grid; motion between
 * snaps is a soft-plastic spring (fast stiffness, underdamped for bounce).
 * Arrangement persists to localStorage so her layout is hers.
 */

import { motion, type PanInfo } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { EntityDef, StructuredData } from "@/model/types";
import { renderAttribute } from "./renderer";
import { GlassPanel } from "@/components/panel";
import {
  DEFAULT_LAYOUT,
  GRID,
  LAYOUT_STORAGE_KEY,
  REMOVED_STORAGE_KEY,
  type Slot,
} from "./layout";

export interface PanelInput {
  id: string;
  entity: EntityDef;
  data: StructuredData;
}

/** Soft plastic: quick, squishy, a little overshoot. */
const SPRING = { type: "spring", stiffness: 320, damping: 19, mass: 0.9 } as const;

const clamp = (lo: number, hi: number, v: number) => Math.min(hi, Math.max(lo, v));

function overlaps(a: Slot, b: Slot): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** Push anything colliding with the moved panel straight down. */
function resolveCollisions(slots: Record<string, Slot>, movedId: string) {
  const next = { ...slots };
  const ids = Object.keys(next).sort((a, b) =>
    a === movedId ? -1 : b === movedId ? 1 : next[a].y - next[b].y,
  );
  for (let pass = 0; pass < 12; pass++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = next[ids[i]];
        const b = next[ids[j]];
        if (overlaps(a, b)) {
          next[ids[j]] = { ...b, y: a.y + a.h };
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return next;
}

function initialSlots(ids: string[]): Record<string, Slot> {
  const slots: Record<string, Slot> = {};
  let y = 0;
  for (const id of ids) {
    slots[id] = DEFAULT_LAYOUT[id] ?? { x: 0, y, w: GRID.cols, h: 4 };
    y = slots[id].y + slots[id].h;
  }
  if (typeof window === "undefined") return slots;
  try {
    const saved = JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) ?? "null");
    if (saved && typeof saved === "object") {
      for (const id of ids) if (saved[id]) slots[id] = { ...slots[id], ...saved[id] };
    }
  } catch {
    /* corrupt layout falls back to defaults */
  }
  return slots;
}

function DraggablePanel({
  panel,
  slot,
  colW,
  onSnap,
  onResize,
  onRemove,
}: {
  panel: PanelInput;
  slot: Slot;
  colW: number;
  onSnap: (id: string, slot: Slot) => void;
  onResize: (id: string, slot: Slot, live: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const base = DEFAULT_LAYOUT[panel.id];
  // Dragging a tile bigger expands it: detail-level info fades in.
  const expanded = base ? slot.h > base.h || slot.w > base.w : false;
  const unitX = colW + GRID.gap;
  const unitY = GRID.rowH + GRID.gap;
  const resizeBase = useRef<Slot>(slot);

  return (
    <motion.div
      className="absolute"
      style={{ zIndex: 1 }}
      drag
      dragMomentum={false}
      onDragEnd={(_e, info: PanInfo) => {
        onSnap(panel.id, {
          ...slot,
          x: clamp(0, GRID.cols - slot.w, slot.x + Math.round(info.offset.x / unitX)),
          y: Math.max(0, slot.y + Math.round(info.offset.y / unitY)),
        });
      }}
      initial={false}
      animate={{
        opacity: 1,
        scale: 1,
        x: slot.x * unitX,
        y: slot.y * unitY,
        width: slot.w * colW + (slot.w - 1) * GRID.gap,
        height: slot.h * GRID.rowH + (slot.h - 1) * GRID.gap,
      }}
      whileHover={{ scale: 1.008 }}
      whileDrag={{ scale: 1.03, zIndex: 30, cursor: "grabbing" }}
      transition={SPRING}
    >
      <GlassPanel title={panel.entity.title} className="h-full overflow-y-auto">
        {panel.entity.attributes.map((attr) =>
          renderAttribute(attr, panel.data[attr.key], expanded),
        )}
      </GlassPanel>

      {/* X removes the tile. */}
      <motion.button
        aria-label={`Remove ${panel.entity.title}`}
        className="glass-chip absolute top-2.5 right-2.5 z-20 flex size-5 items-center justify-center text-[10px] text-ink-soft"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(panel.id)}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.85 }}
        transition={SPRING}
      >
        x
      </motion.button>

      {/* Corner puck: pull to resize. It strains elastically against its
          constraints while the panel springs to the new size. */}
      <motion.div
        aria-label={`Resize ${panel.entity.title}`}
        className="glass-chip absolute right-2.5 bottom-2.5 z-20 size-4 cursor-nwse-resize"
        drag
        dragMomentum={false}
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.4}
        onPointerDown={(e) => e.stopPropagation()}
        onDragStart={() => {
          resizeBase.current = slot;
        }}
        onDrag={(_e, info: PanInfo) => {
          const base = resizeBase.current;
          onResize(
            panel.id,
            {
              ...base,
              w: clamp(GRID.minW, GRID.cols - base.x, base.w + Math.round(info.offset.x / unitX)),
              h: clamp(GRID.minH, 24, base.h + Math.round(info.offset.y / unitY)),
            },
            true,
          );
        }}
        onDragEnd={(_e, info: PanInfo) => {
          const base = resizeBase.current;
          onResize(
            panel.id,
            {
              ...base,
              w: clamp(GRID.minW, GRID.cols - base.x, base.w + Math.round(info.offset.x / unitX)),
              h: clamp(GRID.minH, 24, base.h + Math.round(info.offset.y / unitY)),
            },
            false,
          );
        }}
        whileHover={{ scale: 1.3 }}
        whileDrag={{ scale: 1.5 }}
        transition={SPRING}
      />
    </motion.div>
  );
}

export function Board({ panels }: { panels: PanelInput[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [slots, setSlots] = useState<Record<string, Slot>>(() =>
    initialSlots(panels.map((p) => p.id)),
  );
  const [removed, setRemoved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(REMOVED_STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(slots));
      localStorage.setItem(REMOVED_STORAGE_KEY, JSON.stringify(removed));
    } catch {
      /* private mode etc. */
    }
  }, [slots, removed]);

  const colW = width > 0 ? (width - GRID.gap * (GRID.cols - 1)) / GRID.cols : 0;

  // Narrow screens: stack panels full-width in module order.
  const narrow = width > 0 && width < 640;
  const visible = panels.filter((p) => !removed.includes(p.id));
  const displaySlots = { ...slots };
  if (narrow) {
    let y = 0;
    for (const p of visible) {
      const s = slots[p.id];
      displaySlots[p.id] = { x: 0, y, w: GRID.cols, h: s.h };
      y += s.h;
    }
  }
  const bottom = Math.max(
    0,
    ...visible.map((p) => (displaySlots[p.id] ? displaySlots[p.id].y + displaySlots[p.id].h : 0)),
  );

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: bottom * (GRID.rowH + GRID.gap) - GRID.gap }}
    >
      {colW > 0 &&
        panels
          .filter((panel) => !removed.includes(panel.id))
          .map((panel) => (
          <DraggablePanel
            key={panel.id}
            panel={panel}
            slot={displaySlots[panel.id]}
            colW={colW}
            onSnap={(id, slot) =>
              setSlots((prev) => resolveCollisions({ ...prev, [id]: slot }, id))
            }
            onResize={(id, slot, live) =>
              setSlots((prev) =>
                live ? { ...prev, [id]: slot } : resolveCollisions({ ...prev, [id]: slot }, id),
              )
            }
            onRemove={(id) => setRemoved((prev) => [...prev, id])}
          />
        ))}
    </div>
  );
}
