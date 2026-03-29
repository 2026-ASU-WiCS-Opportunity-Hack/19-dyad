"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TranslatedReadingView } from "@/components/common/TranslatedReadingView";
import { getProvisionedChapter } from "@/lib/workspace";
import type { ChapterRecord, CoachRecord, EventRecord, ProvisionedChapterRecord } from "@/lib/types";

type Props = {
  chapter: ChapterRecord;
  coaches: CoachRecord[];
  events: EventRecord[];
  audioEnabled?: boolean;
};

function mergePublishedChapter(base: ChapterRecord, provisioned: ProvisionedChapterRecord | null) {
  if (!provisioned || provisioned.status !== "published" || !provisioned.approvedDraft) return base;
  const draft = provisioned.approvedDraft;
  return {
    ...base,
    name: provisioned.chapterName,
    primaryLanguage: provisioned.primaryLanguage,
    contactEmail: provisioned.contactEmail,
    heroTitle: draft.heroTitle || base.heroTitle,
    heroSubtitle: draft.heroSubtitle || base.heroSubtitle,
    about: draft.overview || base.about,
    featuredEventTitle: draft.eventTeaser || base.featuredEventTitle,
    testimonialQuote: draft.testimonialBlock || base.testimonialQuote
  } satisfies ChapterRecord;
}

export function LiveChapterPage({ chapter, coaches, events, audioEnabled = false }: Props) {
  const [publishedChapter, setPublishedChapter] = useState<ChapterRecord>(chapter);
  const [provisioned, setProvisioned] = useState<ProvisionedChapterRecord | null>(null);

  useEffect(() => {
    const record = getProvisionedChapter(chapter.slug);
    setProvisioned(record);
    setPublishedChapter(mergePublishedChapter(chapter, record));
  }, [chapter]);

  const featuredCoaches = useMemo(() => coaches.slice(0, 6), [coaches]);

  return (
    <div className="pb-16">
      <section className="border-b border-black/8 bg-white">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <p className="kicker">{publishedChapter.name}</p>
            <h1 className="section-title">{publishedChapter.heroTitle}</h1>
            <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">{publishedChapter.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">Part of the WIAL global network</span>
              {publishedChapter.focusAreas.map((focus) => (
                <span key={focus} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">
                  {focus}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/coaches" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
                Find a coach
              </Link>
              <Link href={`/contact?chapter=${publishedChapter.slug}`} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
                Contact chapter
              </Link>
            </div>
          </div>

          <div className="surface rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Chapter snapshot</p>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Primary language</dt>
                <dd className="mt-1 font-semibold">{publishedChapter.primaryLanguage}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Public coach profiles</dt>
                <dd className="mt-1 font-semibold">{featuredCoaches.length || publishedChapter.coachCount}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Contact path</dt>
                <dd className="mt-1 font-semibold">{publishedChapter.contactEmail}</dd>
              </div>
              {provisioned ? (
                <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                  <dt className="text-[color:var(--muted-foreground)]">Publishing status</dt>
                  <dd className="mt-1 font-semibold capitalize">{provisioned.status}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <TranslatedReadingView
          label="Read this chapter in English, Portuguese, French, or Spanish"
          bundle={{
            sourceLanguage: publishedChapter.primaryLanguage,
            title: publishedChapter.heroTitle,
            subtitle: publishedChapter.heroSubtitle,
            paragraphs: [
              publishedChapter.about,
              `Featured event: ${publishedChapter.featuredEventTitle} — ${publishedChapter.featuredEventDate}.`,
              `Testimonial: ${publishedChapter.testimonialQuote}`
            ],
            badges: publishedChapter.focusAreas
          }}
          compact
          audioEnabled={audioEnabled}
        />
      </section>

      <section className="container-shell grid gap-10 py-2 lg:grid-cols-[1fr_0.92fr]">
        <div className="space-y-5">
          <div className="card-subtle p-6">
            <h2 className="text-2xl font-semibold tracking-tight">About this chapter</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">{publishedChapter.about}</p>
          </div>

          <div className="card-subtle p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Featured event</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
              {publishedChapter.featuredEventTitle} — {publishedChapter.featuredEventDate}
            </p>
          </div>

          <div className="card-subtle p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Client and participant perspective</h2>
            <blockquote className="mt-4 text-base leading-8 text-[color:var(--foreground)]">“{publishedChapter.testimonialQuote}”</blockquote>
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{publishedChapter.testimonialAuthor}</p>
          </div>

          <div className="card-subtle p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Organizations supported by this chapter</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {publishedChapter.organizationalClients.map((client) => (
                <span key={client} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-subtle p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">Local coach roster</h2>
              <Link href={`/coaches`} className="text-sm font-semibold text-black underline">
                View all coaches in this chapter
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {featuredCoaches.length > 0 ? (
                featuredCoaches.map((coach) => (
                  <div key={coach.id} className="rounded-[1.25rem] border border-black/8 bg-white p-4">
                    <p className="font-semibold">{coach.name}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{coach.locationText}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{coach.languages.join(", ")}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-black/10 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Coach profiles for this chapter are being updated.
                </div>
              )}
            </div>
          </div>

          <div className="card-subtle p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Events in the shared calendar</h2>
            <div className="mt-5 space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-[1.25rem] border border-black/8 bg-white p-4">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {event.date} • {event.format} • {event.location}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{event.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
