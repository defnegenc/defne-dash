import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

/**
 * One curiosity: the research write-up, split into modular glass sections
 * (one card per markdown ## section) so it never reads as a block of text.
 */
export default async function CuriosityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();

  let md: string;
  try {
    md = await fs.readFile(
      path.join(process.cwd(), "data", "curiosities", `${slug}.md`),
      "utf8",
    );
  } catch {
    notFound();
  }

  // Split: leading # title + tagline, then one section per ## heading.
  const titleMatch = md.match(/^#\s+(.+)\n([\s\S]*?)(?=^##\s)/m);
  const title = titleMatch?.[1] ?? slug;
  const lede = titleMatch?.[2]?.replace(/^\*|\*$/g, "").trim() ?? "";
  const sections = [...md.matchAll(/^##\s+(.+)\n([\s\S]*?)(?=^##\s|\s*$)/gm)].map((m) => ({
    heading: m[1].trim(),
    body: m[2].trim(),
  }));

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-8">
        <a href="/curiosities" className="text-xs text-ink-soft hover:text-ink">← curiosities</a>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {lede && <p className="mt-1 text-sm text-ink-soft italic">{lede}</p>}
      </header>
      <div className="flex flex-col gap-4">
        {sections.map((s, i) => (
          <section key={i} className="glass glass-deep p-5 sm:p-6">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {s.heading}
            </h2>
            <div className="research text-[15px] leading-relaxed text-ink">
              <ReactMarkdown>{s.body}</ReactMarkdown>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
