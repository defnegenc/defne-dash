import { promises as fs } from "fs";
import path from "path";
import { Dash } from "@/components/dash";

export const revalidate = 300;

type NewsItem = {
  title: string;
  source: string;
  url: string;
  engagedAt: string;
  kind: string;
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
type Curiosity = { slug: string; question: string };

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), "data", file), "utf8"),
  );
}

function todayNY(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
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
  // merged PRs expire ~24h after merge
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
  const ready = pile.filter((p) => p.state === "ready");
  if (ready.length > 0) {
    attentionBits.push(
      `${ready.map((p) => `PR ${p.number} (${p.label})`).join(", ")} ready to merge`,
    );
  }
  const attention = attentionBits.length ? `needs you: ${attentionBits.join(" · ")}` : null;

  void prs;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(60,70,150,0.5)] sm:text-6xl">defne dash</h1>
      <p className="mt-2 text-base text-white/90">{latest}</p>
      {attention && <p className="mt-1 text-base text-white">{attention}</p>}

      <Dash
        news={ranked.map(({ title, source, url }) => ({ title, source, url }))}
        prs={pile.map(({ number, label, author, state, url }) => ({
          number,
          label,
          author,
          state,
          url,
        }))}
        curiosities={curiosities}
      />
    </main>
  );
}
