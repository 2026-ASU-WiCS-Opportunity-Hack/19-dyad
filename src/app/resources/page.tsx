import { TranslatedReadingView } from "@/components/common/TranslatedReadingView";
import { KnowledgeSearch } from "@/components/resources/KnowledgeSearch";
import { getKnowledgeItems } from "@/lib/data";
import { hasElevenLabsConfig } from "@/lib/server/elevenlabs";
export default function ResourcesPage() {
  const items = getKnowledgeItems();
  const featured = items[0];
  const audioEnabled = hasElevenLabsConfig();
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Resources</p>
        <h1 className="section-title">Research, webinars, and practical discovery support</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">WIAL research should be easier to scan, translate, and connect to coach discovery. This page keeps the library readable and searchable.</p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">{items.map((item) => <article key={item.id} className="card-subtle p-6"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{item.type}</p><h2 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{item.plainLanguageSummary}</p><div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">{tag}</span>)}</div></article>)}</div>
      {featured ? <div className="mt-10"><TranslatedReadingView label="Read this resource in English, Portuguese, French, or Spanish" bundle={{ sourceLanguage: "English", title: featured.title, subtitle: featured.plainLanguageSummary, paragraphs: [featured.summary, ...featured.keyFindings], badges: featured.tags }} audioEnabled={audioEnabled} /></div> : null}
      <div className="mt-10"><KnowledgeSearch /></div>
    </div>
  );
}
