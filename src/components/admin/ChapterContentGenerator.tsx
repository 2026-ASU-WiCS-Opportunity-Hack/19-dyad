"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2, UploadCloud, Wand2 } from "lucide-react";
import type { ChapterDraftOutput, ChapterDraftStatus, CoachRecord } from "@/lib/types";
import { publishProvisionedChapter, saveChapterDraft, updateProvisionedChapter } from "@/lib/workspace";

export function ChapterContentGenerator({
  chapterOptions,
  coachOptions
}: {
  chapterOptions: { slug: string; name: string; region: string; primaryLanguage: string }[];
  coachOptions: CoachRecord[];
}) {
  const [chapterSlug, setChapterSlug] = useState(chapterOptions[0]?.slug ?? "brazil");
  const [chapterName, setChapterName] = useState(chapterOptions[0]?.name ?? "WIAL Brazil");
  const [region, setRegion] = useState(chapterOptions[0]?.region ?? "South America");
  const [language, setLanguage] = useState(chapterOptions[0]?.primaryLanguage ?? "Portuguese");
  const [valueProposition, setValueProposition] = useState(
    "A chapter page that helps local leaders understand Action Learning, discover relevant coaches, and find the next event without losing global consistency."
  );
  const [localContext, setLocalContext] = useState(
    "Reference the local business environment, preferred communication style, and the kinds of organizational challenges leaders in this region actually face."
  );
  const [eventTitle, setEventTitle] = useState("Action Learning for leadership teams");
  const [testimonial, setTestimonial] = useState(
    "The chapter site now feels local while still reflecting the same standards and trust signals as the parent WIAL platform."
  );
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([]);
  const [draft, setDraft] = useState<ChapterDraftOutput | null>(null);
  const [draftStatus, setDraftStatus] = useState<ChapterDraftStatus>("generated");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const coachChoices = useMemo(
    () => coachOptions.filter((coach) => coach.chapterSlug === chapterSlug).slice(0, 12),
    [coachOptions, chapterSlug]
  );

  function toggleCoach(id: string) {
    setSelectedCoaches((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id].slice(-3)
    );
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/chapter-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug,
          chapterName,
          region,
          language,
          valueProposition,
          localContext,
          selectedCoaches,
          eventTitle,
          testimonial
        })
      });

      const payload = (await response.json()) as ChapterDraftOutput & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Generation failed");
      setDraft(payload);
      setDraftStatus("generated");
      saveChapterDraft(chapterSlug, payload, "generated");
      updateProvisionedChapter(chapterSlug, { status: "ready" });
      setMessage(`Draft generated in ${payload.generatedLanguage || language}. Review before publish.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(
        [
          draft.heroTitle,
          draft.heroSubtitle,
          draft.overview,
          draft.eventTeaser,
          draft.coachSpotlight,
          draft.testimonialBlock,
          draft.callToAction
        ].join("\n\n")
      );
      setMessage("Draft copied to clipboard.");
    } catch {
      setMessage("Clipboard access is unavailable in this browser.");
    }
  }

  function markStatus(nextStatus: ChapterDraftStatus) {
    if (!draft) return;
    setDraftStatus(nextStatus);
    saveChapterDraft(chapterSlug, draft, nextStatus);
    if (nextStatus === "approved") {
      updateProvisionedChapter(chapterSlug, {
        approvedDraft: draft,
        status: "approved"
      });
      setMessage("Draft approved for publish. Publish to update the live chapter page.");
    } else if (nextStatus === "reviewed") {
      updateProvisionedChapter(chapterSlug, { status: "reviewed" });
      setMessage("Draft marked reviewed. One more step can approve it for publish.");
    }
  }

  function handlePublish() {
    if (!draft) return;
    setDraftStatus("published");
    saveChapterDraft(chapterSlug, draft, "published");
    publishProvisionedChapter(chapterSlug, draft);
    setMessage("Chapter published. Open the live chapter route to verify the governed output.");
  }

  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 space-y-2">
        <p className="kicker">AI-2 chapter-in-a-box</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Generate culturally adapted chapter copy with human review
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
          This workflow drafts chapter copy in the selected language, adapts tone to regional
          context, and keeps everything behind review before it can ever be published.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-black/8 bg-white p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            <span className="font-medium text-[color:var(--foreground)]">Governance note:</span> only local chapter
            narrative can be changed here. Shared header, footer, navigation, typography, and layout remain locked globally.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Chapter</span>
              <select
                value={chapterSlug}
                onChange={(event) => {
                  const next = chapterOptions.find((chapter) => chapter.slug === event.target.value);
                  setChapterSlug(event.target.value);
                  setSelectedCoaches([]);
                  if (next) {
                    setChapterName(next.name);
                    setRegion(next.region);
                    setLanguage(next.primaryLanguage);
                  }
                }}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              >
                {chapterOptions.map((chapter) => (
                  <option key={chapter.slug} value={chapter.slug}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium">Output language</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              >
                {["English", "Portuguese", "French", "Spanish"].map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Value proposition</span>
            <textarea
              value={valueProposition}
              onChange={(event) => setValueProposition(event.target.value)}
              rows={3}
              className="w-full rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Local context</span>
            <textarea
              value={localContext}
              onChange={(event) => setLocalContext(event.target.value)}
              rows={4}
              className="w-full rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Featured event</span>
              <input
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium">Region</span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Testimonial</span>
            <textarea
              value={testimonial}
              onChange={(event) => setTestimonial(event.target.value)}
              rows={3}
              className="w-full rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Coach roster input (choose up to 3)</p>
              <span className="text-xs text-[color:var(--muted-foreground)]">{selectedCoaches.length}/3 selected</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {coachChoices.length > 0 ? (
                coachChoices.map((coach) => {
                  const active = selectedCoaches.includes(coach.id);
                  return (
                    <button
                      key={coach.id}
                      type="button"
                      onClick={() => toggleCoach(coach.id)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-black/18 bg-white shadow-sm"
                          : "border-black/8 bg-[color:var(--background)]"
                      }`}
                    >
                      <span className="block font-medium">{coach.name}</span>
                      <span className="mt-1 block text-[color:var(--muted-foreground)]">{coach.locationText}</span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-black/10 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)] md:col-span-2">
                  No chapter coach profiles are available for this chapter yet. The generator still works, but the coach spotlight stays more general until roster data is curated.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={16} />}
              Generate chapter draft
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!draft}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold disabled:opacity-50"
            >
              <Copy size={16} />
              Copy draft
            </button>
            <button
              type="button"
              onClick={() => markStatus("reviewed")}
              disabled={!draft}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold disabled:opacity-50"
            >
              Mark reviewed
            </button>
            <button
              type="button"
              onClick={() => markStatus("approved")}
              disabled={!draft}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              Approve for publish
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!draft || draftStatus !== "approved"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <UploadCloud size={16} />
              Publish chapter
            </button>
          </div>

          {message ? (
            <div className="rounded-[1.25rem] border border-black/8 bg-white p-4 text-sm text-[color:var(--muted-foreground)]">
              {message}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          {draft ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Draft output</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{draft.heroTitle}</h3>
                </div>
                <span className="rounded-full border border-black/10 bg-[color:var(--background)] px-3 py-1 text-xs capitalize">
                  {draftStatus}
                </span>
              </div>

              <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">{draft.heroSubtitle}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Overview</p>
                  <p className="mt-2 text-sm leading-7">{draft.overview}</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Event teaser</p>
                  <p className="mt-2 text-sm leading-7">{draft.eventTeaser}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Coach spotlight</p>
                  <p className="mt-2 text-sm leading-7">{draft.coachSpotlight}</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Call to action</p>
                  <p className="mt-2 text-sm leading-7">{draft.callToAction}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Testimonial block</p>
                <p className="mt-2 text-sm leading-7">{draft.testimonialBlock}</p>
              </div>

              {draft.culturalAdaptationNotes?.length ? (
                <div className="rounded-[1.5rem] border border-black/8 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Cultural adaptation notes</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {draft.culturalAdaptationNotes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-[color:var(--warning)]/25 bg-[color:var(--warning)]/10 p-4 text-sm text-[color:var(--warning)]">
                <p className="font-medium">Review required before publish</p>
                <ul className="mt-2 space-y-1">
                  {draft.warnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {(draft.toneNotes || []).map((note) => (
                  <span key={note} className="rounded-full border border-black/10 bg-[color:var(--background)] px-3 py-1 text-xs">
                    {note}
                  </span>
                ))}
              </div>

              {draftStatus === "published" ? (
                <Link href={`/chapters/${chapterSlug}`} className="inline-flex items-center gap-2 text-sm font-semibold underline">
                  Open live chapter page
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-96 items-center justify-center rounded-[1.5rem] border border-dashed border-black/10 bg-[color:var(--background)] p-8 text-center text-sm leading-7 text-[color:var(--muted-foreground)]">
              Generate a chapter draft to begin the AI-assisted publishing workflow. The right-hand
              panel is designed for reviewed copy, not auto-published content.
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
