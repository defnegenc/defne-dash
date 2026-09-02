import { promises as fs } from "fs";
import path from "path";
import type { DashboardModule } from "@/model/types";

/**
 * Module: the PR pile.
 *
 * One long pile of pull requests across her repos: number, three-word
 * label, whose it is (you / agent), and a muted staleness tone:
 *   green  - fresh (open < 2 days)
 *   amber  - aging (open 2-5 days)
 *   gray   - stale (open > 5 days) or merged (on its way out)
 * Merged PRs auto-expire 24 hours after merge. Sources: data/prs.json.
 */

type Tone = "green" | "amber" | "gray";

interface Pr {
  number: number;
  label: string;
  author: "you" | "agent";
  status: "open" | "merged";
  openedAt?: string;
  mergedAt?: string;
  url: string;
}

const DAY = 24 * 60 * 60 * 1000;

function tone(p: Pr, now: number): Tone {
  if (p.status === "merged") return "gray";
  const age = now - +(p.openedAt ? new Date(p.openedAt) : now);
  if (age < 2 * DAY) return "green";
  if (age < 5 * DAY) return "amber";
  return "gray";
}

async function loadPrs() {
  const raw = await fs.readFile(path.join(process.cwd(), "data", "prs.json"), "utf8");
  const all = JSON.parse(raw) as Pr[];
  const now = Date.now();

  // Merged + seen: the pile drops them 24h after merge.
  const live = all.filter(
    (p) => p.status !== "merged" || now - +new Date(p.mergedAt ?? 0) < DAY,
  );

  return {
    pile: live.map((p) => ({
      label: p.label,
      number: `#${p.number}`,
      author: p.author === "agent" ? "agent" : "you",
      tone: tone(p, now),
      url: p.url,
    })),
  };
}

export const prsModule: DashboardModule = {
  id: "prs",
  entity: {
    name: "PrPile",
    title: "PR pile",
    attributes: [
      {
        key: "pile",
        label: "Open and recently merged",
        kind: "ARRY",
        entity: "PullRequest",
        ui: {
          function: "display",
          render: "expanded",
          editable: true,
          thumbnail: ["label", "number", "author"],
        },
      },
    ],
  },
  load: loadPrs,
};
