import { promises as fs } from "fs";
import path from "path";
import type { DashboardModule } from "@/model/types";

/**
 * Module: news.
 *
 * What she has engaged with in the last week, ranked by recency:
 * anything touched in the last day floats to the top, and the daily AI
 * brief pins above everything. Sources live in data/news.json; the agent
 * keeps the file current as engagement happens.
 */

interface NewsItem {
  title: string;
  source: string;
  url: string;
  engagedAt: string; // ISO date
  kind: "ai-daily" | "topic";
  detail: string;
}

const DAY = 24 * 60 * 60 * 1000;

async function loadNews() {
  const raw = await fs.readFile(path.join(process.cwd(), "data", "news.json"), "utf8");
  const items = JSON.parse(raw) as NewsItem[];
  const now = Date.now();
  const weekAgo = now - 7 * DAY;

  const withinWeek = items.filter((i) => new Date(i.engagedAt).getTime() >= weekAgo);
  withinWeek.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "ai-daily" ? -1 : 1;
    return +new Date(b.engagedAt) - +new Date(a.engagedAt);
  });

  return { items: withinWeek };
}

export const newsModule: DashboardModule = {
  id: "news",
  entity: {
    name: "NewsFeed",
    title: "News",
    attributes: [
      {
        key: "items",
        label: "This week, by recency",
        kind: "ARRY",
        entity: "NewsItem",
        ui: {
          function: "display",
          render: "expanded",
          editable: true,
          thumbnail: ["title", "source", "engagedAt"],
        },
      },
    ],
  },
  load: loadNews,
};
