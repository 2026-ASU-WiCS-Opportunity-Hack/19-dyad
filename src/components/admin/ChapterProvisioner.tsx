"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Globe2, LockKeyhole, PlusSquare } from "lucide-react";
import { titleCase } from "@/lib/utils";
import { saveProvisionedChapter } from "@/lib/workspace";
import type { PaymentProvider, ProvisionedChapterRecord } from "@/lib/types";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ChapterProvisioner() {
  const [chapterName, setChapterName] = useState("WIAL Kenya");
  const [region, setRegion] = useState("Africa");
  const [language, setLanguage] = useState("English");
  const [pathMode, setPathMode] = useState<"subdirectory" | "subdomain">("subdirectory");
  const [contactEmail, setContactEmail] = useState("kenya@wial.org");
  const [leadName, setLeadName] = useState("Kenya Chapter Lead");
  const [leadEmail, setLeadEmail] = useState("kenya@wial.org");
  const [paymentMode, setPaymentMode] = useState<PaymentProvider>("stripe");
  const [provisioned, setProvisioned] = useState<ProvisionedChapterRecord | null>(null);

  const slug = useMemo(() => slugify(chapterName.replace(/^WIAL\s+/i, "")) || "new-chapter", [chapterName]);
  const publicUrl = pathMode === "subdirectory" ? `wial.org/${slug}` : `${slug}.wial.org`;

  function handleProvision() {
    const timestamp = new Date().toISOString();
    const record: ProvisionedChapterRecord = {
      slug,
      chapterName,
      region,
      primaryLanguage: language,
      contactEmail,
      pathMode,
      templateVersion: "v1.0-governed",
      paymentMode,
      leadName,
      leadEmail,
      status: "ready",
      createdAt: timestamp,
      updatedAt: timestamp,
      approvedDraft: null,
      publishedAt: null
    };
    saveProvisionedChapter(record);
    setProvisioned(record);
  }

  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 space-y-2">
        <p className="kicker">Chapter provisioning</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          One-click chapter setup with governed template inheritance
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
          Create a chapter site, assign its lead, lock the global template, and prepare the chapter
          for reviewed local publishing.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Chapter name</span>
              <input
                value={chapterName}
                onChange={(event) => setChapterName(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Primary language</span>
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Region</span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Contact email</span>
              <input
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Chapter owner</span>
              <input
                value={leadName}
                onChange={(event) => setLeadName(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Owner email</span>
              <input
                value={leadEmail}
                onChange={(event) => setLeadEmail(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Site path mode</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { value: "subdirectory", label: "wial.org/region" },
                  { value: "subdomain", label: "region.wial.org" }
                ].map((option) => {
                  const active = pathMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPathMode(option.value as typeof pathMode)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        active ? "border-black/18 bg-white shadow-sm" : "border-black/8 bg-[color:var(--background)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Dues provider</span>
              <select
                value={paymentMode}
                onChange={(event) => setPaymentMode(event.target.value as PaymentProvider)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="manual">Manual / bank transfer</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleProvision}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white"
          >
            <PlusSquare size={16} />
            Create chapter site
          </button>
        </div>

        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          <div className="flex items-center gap-3">
            <Globe2 size={18} className="text-[color:var(--accent)]" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Chapter creation summary</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">{chapterName}</h3>
            </div>
          </div>

          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-[color:var(--muted-foreground)]">Public URL</p>
              <p className="mt-2 font-semibold">{publicUrl}</p>
            </div>
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-[color:var(--muted-foreground)]">Template version</p>
              <p className="mt-2 font-semibold">v1.0-governed</p>
            </div>
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-[color:var(--muted-foreground)]">Chapter owner</p>
              <p className="mt-2 font-semibold">{leadName}</p>
            </div>
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-[color:var(--muted-foreground)]">Publish status</p>
              <p className="mt-2 font-semibold capitalize">{provisioned?.status || "Ready after creation"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            <p className="inline-flex items-center gap-2 font-medium text-[color:var(--foreground)]">
              <LockKeyhole size={15} />
              Locked globally
            </p>
            <p className="mt-2">
              Header, footer, navigation, typography, layout rhythm, and design tokens remain governed by WIAL Global.
            </p>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            <p className="inline-flex items-center gap-2 font-medium text-[color:var(--foreground)]">
              <CheckCircle2 size={15} />
              Editable locally
            </p>
            <p className="mt-2">
              Hero copy, events, testimonials, client list, and chapter roster can be updated by the assigned chapter lead.
            </p>
          </div>

          {provisioned ? (
            <div className="mt-5 rounded-[1.5rem] border border-[color:var(--success)]/25 bg-[color:var(--success)]/10 p-4 text-sm text-[color:var(--success)]">
              <p className="font-medium">Chapter site created</p>
              <p className="mt-2 leading-7">
                The chapter record has been created with a governed URL, owner, payment mode, and template version. Next, generate and publish local chapter content.
              </p>
              <Link href={`/chapters/${slug}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline">
                Open live chapter page
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
