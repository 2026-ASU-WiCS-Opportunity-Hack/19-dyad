import Link from "next/link";
import { getChapters } from "@/lib/data";
export default function ChaptersPage() {
  const chapters = getChapters();
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Chapter network</p>
        <h1 className="section-title">Chapter sites that feel local without fragmenting the brand</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">Every chapter inherits the shared WIAL structure while keeping room for local events, chapter contact, coach visibility, and chapter-specific messaging.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{chapters.map((chapter) => <Link key={chapter.slug} href={`/chapters/${chapter.slug}`} className="card-subtle block p-6 transition hover:-translate-y-0.5"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{chapter.region}</p><h2 className="mt-3 text-xl font-semibold tracking-tight">{chapter.name}</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)] line-clamp-4">{chapter.about}</p><div className="mt-5 flex items-center justify-between text-sm"><span className="text-[color:var(--muted-foreground)]">{chapter.coachCount} coach profiles</span><span className="font-semibold">Open chapter</span></div></Link>)}</div>
    </div>
  );
}
