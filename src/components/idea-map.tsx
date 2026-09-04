import React from "react";

export type IdeaMapThread = { id: string; label: string; status: string };

type Node = { x: number; y: number; w: number; h: number; dashed?: boolean };

/* one idea = one constellation: the idea at the center, its working
   threads as satellites. nodes/edges get added as the idea develops. */
export function IdeaMap({ title, threads }: { title: string; threads: IdeaMapThread[] }) {
  const center: Node = { x: 46, y: 124, w: 176, h: 54 };
  const slots: Node[] = [
    { x: 338, y: 46, w: 198, h: 42 },
    { x: 362, y: 116, w: 198, h: 42 },
    { x: 362, y: 186, w: 198, h: 42 },
    { x: 338, y: 250, w: 198, h: 42 },
  ];
  const cx = center.x + center.w;
  const cy = center.y + center.h / 2;
  const titleLines = title.split(" ");
  const mid = Math.ceil(titleLines.length / 2);
  const line1 = titleLines.slice(0, mid).join(" ");
  const line2 = titleLines.slice(mid).join(" ");

  return (
    <svg
      className="idea-map"
      viewBox="0 0 560 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Mind map of the idea: ${title}`}
    >
      <defs>
        <filter id="im-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* edges: glow underlay + bright core */}
      {threads.slice(0, slots.length).map((t, i) => {
        const s = slots[i];
        const tx = s.x;
        const ty = s.y + s.h / 2;
        const mx = (cx + tx) / 2;
        const d = `M ${cx} ${cy} Q ${mx} ${cy} ${mx} ${(cy + ty) / 2} T ${tx} ${ty}`;
        return (
          <g key={`e-${t.id}`}>
            <path d={d} className="idea-edge-glow" filter="url(#im-glow)" />
            <path d={d} className="idea-edge" />
          </g>
        );
      })}

      {/* satellite thread nodes */}
      {threads.slice(0, slots.length).map((t, i) => {
        const s = slots[i];
        const dashed = t.status === "researching";
        return (
          <g key={`n-${t.id}`}>
            <rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={s.h / 2}
              className={dashed ? "idea-node idea-node-dashed" : "idea-node"}
            />
            <line
              x1={s.x + 14}
              y1={s.y + 1.2}
              x2={s.x + s.w * 0.55}
              y2={s.y + 1.2}
              className="idea-rim"
            />
            <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 4.5} className="idea-node-text" textAnchor="middle">
              {t.label}
            </text>
          </g>
        );
      })}

      {/* central idea node */}
      <g>
        <rect x={center.x} y={center.y} width={center.w} height={center.h} rx={16} className="idea-node idea-node-core" />
        <line
          x1={center.x + 16}
          y1={center.y + 1.2}
          x2={center.x + center.w * 0.6}
          y2={center.y + 1.2}
          className="idea-rim"
        />
        <text x={center.x + center.w / 2} y={center.y + (line2 ? 22 : 31)} className="idea-core-text" textAnchor="middle">
          {line1}
        </text>
        {line2 && (
          <text x={center.x + center.w / 2} y={center.y + 40} className="idea-core-text" textAnchor="middle">
            {line2}
          </text>
        )}
      </g>
    </svg>
  );
}
