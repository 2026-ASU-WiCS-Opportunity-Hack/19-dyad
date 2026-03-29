"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApprovedChapterDraft, getProvisionedChapter } from "@/lib/workspace";
import type { ChapterDraftOutput, ProvisionedChapterRecord } from "@/lib/types";

export default function ChapterPreviewPage({ params }: { params: { slug: string } }) {
  const [chapter, setChapter] = useState<ProvisionedChapterRecord | null>(null);
  const [draft, setDraft] = useState<{ status: string; data: ChapterDraftOutput; generatedAt: string } | null>(null);

  useEffect(() => {
    setChapter(getProvisionedChapter(params.slug));
    setDraft(getApprovedChapterDraft(params.slug));
  }, [params.slug]);

  if (!chapter) {
    return (
      <div className="container-shell py-16">
        <div className="surface rounded-[2rem] p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Chapter staging route not found</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Create the chapter in the administrative workspace first, then return here if you need a staging-only view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <section className="border-b border-black/8 bg-white">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <p className="kicker">Chapter staging route</p>
            <h1 className="section-title">{draft?.data.heroTitle || `${chapter.chapterName} chapter`}</h1>
            <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">
              {draft?.data.heroSubtitle || `This staging route shows local chapter content before it is treated as published.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">{chapter.primaryLanguage}</span>
              <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm capitalize">{chapter.status}</span>
              <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">Template {chapter.templateVersion}</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
                Back to workspace
              </Link>
              <Link href={`/chapters/${params.slug}`} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
                Open live chapter page
              </Link>
            </div>
          </div>

          <div className="surface rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Staging status</p>
            <dl className="mt-5 grid gap-4 text-sm">
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Chapter owner</dt>
                <dd className="mt-1 font-semibold">{chapter.leadName}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Contact</dt>
                <dd className="mt-1 font-semibold">{chapter.contactEmail}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Draft status</dt>
                <dd className="mt-1 font-semibold capitalize">{draft?.status || "No approved draft yet"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
