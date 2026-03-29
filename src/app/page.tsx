import Link from "next/link";
import { ArrowRight, Globe2, Languages, ShieldCheck } from "lucide-react";
import { FindCoachWidget } from "@/components/home/FindCoachWidget";
import { CHAPTERS, getGlobalStats } from "@/lib/data";

export default function HomePage() {
  const stats = getGlobalStats();
  const featuredChapters = CHAPTERS.filter((chapter) => ["nigeria", "brazil", "united-states", "malaysia", "kenya"].includes(chapter.slug)).slice(0, 4);
  return (
    <div className="pb-20">
      <section className="border-b border-black/6 bg-white">
        <div className="container-shell grid gap-10 py-18 lg:grid-cols-[1.08fr_0.92fr] lg:py-22">
          <div className="space-y-6">
            <p className="kicker">World Institute for Action Learning</p>
            <h1 className="section-title max-w-4xl text-balance">One governed platform for WIAL Global and every chapter.</h1>
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">Find coaches, explore chapters, view certification paths, and publish local chapter content without fragmenting the WIAL brand.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/coaches" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">Find a coach<ArrowRight size={14} /></Link>
              <Link href="/chapters" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">Explore chapters</Link>
            </div>
            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              <div className="card-subtle p-5"><p className="text-sm text-[color:var(--muted-foreground)]">Public coach profiles</p><p className="mt-2 text-3xl font-semibold tracking-tight">{stats.coachCount}</p></div>
              <div className="card-subtle p-5"><p className="text-sm text-[color:var(--muted-foreground)]">Active chapters</p><p className="mt-2 text-3xl font-semibold tracking-tight">{stats.activeChapters}</p></div>
              <div className="card-subtle p-5"><p className="text-sm text-[color:var(--muted-foreground)]">Visible languages</p><p className="mt-2 text-3xl font-semibold tracking-tight">{stats.languageCount}</p></div>
            </div>
          </div>
          <div className="surface rounded-[2rem] p-6 md:p-8">
            <div className="grid gap-4">
              {[
                { icon: Globe2, title: "Global consistency", body: "WIAL Global controls structure, navigation, and brand while chapters publish local content in approved zones." },
                { icon: Languages, title: "Live multilingual AI", body: "Coach discovery, translation, and chapter publishing use GPT-powered flows instead of static content blocks." },
                { icon: ShieldCheck, title: "Trusted public visibility", body: "Certification uncertainty stays visible and public profiles avoid claims that still need approval or sync." }
              ].map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-5">
                  <item.icon size={18} className="text-[color:var(--accent)]" />
                  <h2 className="mt-3 text-lg font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container-shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="kicker">Chapter network</p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Local chapters, one recognizable WIAL experience</h2>
          </div>
          <Link href="/chapters" className="text-sm font-semibold text-black underline">View all chapters</Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {featuredChapters.map((chapter) => (
            <Link key={chapter.slug} href={`/chapters/${chapter.slug}`} className="card-subtle block p-6 transition hover:-translate-y-0.5">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{chapter.region}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{chapter.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)] line-clamp-4">{chapter.heroSubtitle}</p>
              <div className="mt-4 flex items-center justify-between text-sm"><span className="text-[color:var(--muted-foreground)]">{chapter.coachCount} coach profiles</span><span className="font-semibold text-black">Open chapter</span></div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container-shell pb-16"><FindCoachWidget /></section>
      <section className="container-shell grid gap-5 pb-16 lg:grid-cols-3">
        <div className="card-subtle p-6"><h2 className="text-xl font-semibold tracking-tight">Cross-lingual coach search</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">Search in Portuguese, French, Spanish, or English and retrieve relevant coach profiles across languages.</p></div>
        <div className="card-subtle p-6"><h2 className="text-xl font-semibold tracking-tight">Chapter content generation</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">Generate chapter copy in the selected language, review it, and publish it into the live chapter site.</p></div>
        <div className="card-subtle p-6"><h2 className="text-xl font-semibold tracking-tight">Need-based coach matching</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">Describe the organizational need in plain language and receive a confidence-aware shortlist with human fallback.</p></div>
      </section>
    </div>
  );
}
