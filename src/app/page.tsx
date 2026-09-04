import { promises as fs } from "fs";
import path from "path";
import { Stage, type StageCard } from "@/components/stage";

export const revalidate = 300;

type NewsItem = {
  title: string;
  source: string;
  url: string;
  engagedAt: string;
  kind: string;
  detail?: string;
};
type Pr = {
  number: number;
  label: string;
  author: string;
  status: string;
  mergedAt?: string;
  openedAt?: string;
  url: string;
};
type Curiosity = { slug: string; question: string; tagline?: string };

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), "data", file), "utf8"),
  );
}

function todayNY(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function fmtDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00-04:00` : iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export default async function Home() {
  const news = await readJson<NewsItem[]>("news.json");
  const prs = await readJson<Pr[]>("prs.json");
  const curiosities = await readJson<Curiosity[]>("curiosities/index.json");
  const today = todayNY();

  const ranked = [...news].sort((a, b) => {
    const ad = a.engagedAt === today ? 1 : 0;
    const bd = b.engagedAt === today ? 1 : 0;
    if (ad !== bd) return bd - ad;
    if (a.kind === "ai-daily") return -1;
    if (b.kind === "ai-daily") return 1;
    return b.engagedAt.localeCompare(a.engagedAt);
  });

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const live = prs.filter(
    (p) => p.status !== "merged" || !p.mergedAt || now - Date.parse(p.mergedAt) < DAY,
  );
  const state = (p: Pr): "merged" | "ready" | "stale" => {
    if (p.status === "merged") return "merged";
    const opened = p.openedAt ? Date.parse(p.openedAt) : now;
    return now - opened > 2 * DAY ? "stale" : "ready";
  };
  const pile = live.map((p) => ({ ...p, state: state(p) }));
  const mergedToday = live.filter((p) => p.mergedAt?.startsWith(today));
  const stale = pile.filter((p) => p.state === "stale");
  const ready = pile.filter((p) => p.state === "ready");

  const latestBits: string[] = [];
  if (mergedToday.length > 0) {
    latestBits.push(`${mergedToday.length} PR${mergedToday.length === 1 ? "" : "s"} merged today`);
  }
  if (news.some((n) => n.kind === "ai-daily" && n.engagedAt === today)) {
    latestBits.push("the daily AI brief is up");
  }
  const latest = latestBits.length ? `Latest: ${latestBits.join(" & ")}` : "Latest: nothing new yet";

  const attentionBits: string[] = [];
  if (stale.length > 0) {
    attentionBits.push(
      `${stale.map((p) => `PR ${p.number} (${p.label})`).join(", ")} ${
        stale.length === 1 ? "is" : "are"
      } stale - merge it or close it`,
    );
  }
  if (ready.length > 0) {
    attentionBits.push(
      `${ready.map((p) => `PR ${p.number} (${p.label})`).join(", ")} ready to merge`,
    );
  }
  const attention = attentionBits.length ? `needs you: ${attentionBits.join(" · ")}` : null;

  const cards: StageCard[] = [
    ...ranked.map(
      (n): StageCard => ({
        kind: "news",
        id: `n:${n.url}:${n.engagedAt}:${n.title.slice(0, 12)}`,
        title: n.title,
        source: n.source,
        url: n.url,
        date: fmtDate(n.engagedAt),
        detail: n.detail,
        itemKind: n.kind,
      }),
    ),
    {
      kind: "prs",
      id: "prs",
      prs: pile.map(({ number, label, author, state, url }) => ({
        number,
        label,
        author,
        state,
        url,
      })),
      url: "https://github.com/defnegenc/learning-et-al/pulls",
    },
    {
      kind: "hw",
      id: "hw",
      curiosities: curiosities.map((c) => ({
        slug: c.slug,
        question: c.question,
        tagline: c.tagline ?? "",
      })),
      url: "/curiosities",
    },
  ];

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });

  return (
    <Stage
      cards={cards}
      summary={attention ? `${latest}  ·  ${attention}` : latest}
      date={dateStr}
    />
  );
}
