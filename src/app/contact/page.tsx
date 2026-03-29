import { Mail, MapPinned, MessageSquareText } from "lucide-react";
import { getChapterBySlug } from "@/lib/data";
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ chapter?: string }> }) {
  const { chapter: chapterSlug } = await searchParams;
  const chapter = chapterSlug ? getChapterBySlug(chapterSlug) : null;
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Contact</p>
        <h1 className="section-title">Start with the chapter when local context matters</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">WIAL Global remains the top-level public contact path, while chapter-aware routing helps visitors begin with the most relevant regional contact whenever geography is already known.</p>
      </div>
      {chapter ? <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm leading-7 text-[color:var(--muted-foreground)]">You arrived through <span className="font-semibold text-black">{chapter.name}</span>. The recommended route is to start with that chapter and escalate to WIAL Global only if needed.</div> : null}
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="card-subtle p-6"><Mail size={18} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-xl font-semibold tracking-tight">Global contact</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">Executive Director route for the main public contact path.</p><a href="mailto:global@wial.org" className="mt-4 inline-flex text-sm font-semibold text-black underline">global@wial.org</a></div>
        <div className="card-subtle p-6"><MapPinned size={18} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-xl font-semibold tracking-tight">Chapter-aware routing</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{chapter ? `Direct this enquiry first to ${chapter.name} at ${chapter.contactEmail}.` : "When a visitor already knows their region, the platform should route them to the right chapter first."}</p>{chapter ? <a href={`mailto:${chapter.contactEmail}`} className="mt-4 inline-flex text-sm font-semibold text-black underline">{chapter.contactEmail}</a> : null}</div>
        <div className="card-subtle p-6"><MessageSquareText size={18} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-xl font-semibold tracking-tight">Newsletter and CRM</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">The MVP keeps contact clean and easy to maintain. Newsletter and deeper CRM automation can follow later.</p></div>
      </div>
    </div>
  );
}
