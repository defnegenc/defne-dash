import { promises as fs } from "fs";
import path from "path";

interface Curiosity {
  slug: string;
  question: string;
  tagline: string;
}

/**
 * Curiosities: the standing list of questions she's asked the agent to
 * research. One glass tile per question; click through to the research.
 * Add a question by dropping an entry in data/curiosities/index.json plus
 * a markdown file next to it.
 */
export default async function Curiosities() {
  const raw = await fs.readFile(
    path.join(process.cwd(), "data", "curiosities", "index.json"),
    "utf8",
  );
  const items = JSON.parse(raw) as Curiosity[];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Curiosities</h1>
        <p className="mt-1 text-sm text-ink-soft">Questions being researched. Click one.</p>
      </header>
      <ul className="flex flex-col gap-4">
        {items.map((c) => (
          <li key={c.slug}>
            <a href={`/curiosities/${c.slug}`} className="glass glass-deep block p-5 transition hover:bg-white/40">
              <p className="text-[15px] leading-snug font-medium text-ink">{c.question}</p>
              <p className="mt-1.5 text-xs leading-snug text-ink-soft">{c.tagline}</p>
            </a>
          </li>
        ))}
      </ul>
      <footer className="mt-8">
        <a href="/" className="glass-chip inline-block px-3 py-1.5 text-xs font-medium text-ink">
          ← dash
        </a>
      </footer>
    </main>
  );
}
