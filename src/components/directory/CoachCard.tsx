import Link from "next/link";
import { ExternalLink, Globe, Mail, MapPin, Phone, ShieldAlert, Sparkles } from "lucide-react";
import type { RankedCoachMatch } from "@/lib/types";
import { formatPhone, getInitials } from "@/lib/utils";

export function CoachCard({ result }: { result: RankedCoachMatch }) {
  const { coach } = result;

  return (
    <article className="card-subtle flex h-full flex-col gap-4 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white text-sm font-semibold shadow-sm">
          {getInitials(coach.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">{coach.name}</h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">{coach.headline}</p>
            </div>
            <span className="rounded-full border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 px-3 py-1 text-xs font-medium text-[color:var(--warning)]">
              {coach.certificationLabel}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-[color:var(--muted-foreground)]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {coach.locationText}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe size={14} />
              {coach.languages.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">{coach.about}</p>

      {result.reasoning ? (
        <div className="rounded-[1.25rem] border border-black/8 bg-white p-4 text-sm text-[color:var(--muted-foreground)]">
          <p className="inline-flex items-center gap-2 font-medium text-[color:var(--foreground)]">
            <Sparkles size={14} />
            Why this profile surfaced
          </p>
          <p className="mt-2 leading-7">{result.reasoning}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {result.matchedFacets.map((facet) => (
          <span
            key={facet}
            className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[color:var(--foreground)]"
          >
            {facet}
          </span>
        ))}
        {coach.sourceGapFlags.includes("missing_verified_specializations") ? (
          <span className="rounded-full border border-[color:var(--warning)]/25 bg-[color:var(--warning)]/10 px-3 py-1 text-xs font-medium text-[color:var(--warning)]">
            specialization sync needed
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-black/8 bg-white/70 p-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2 text-[color:var(--muted-foreground)]">
            <Phone size={14} />
            {formatPhone(coach.phone)}
          </p>
          <p className="inline-flex items-center gap-2 text-[color:var(--muted-foreground)]">
            <Mail size={14} />
            {coach.email ?? "Email not listed"}
          </p>
        </div>
      </div>

      {result.caution.length > 0 ? (
        <div className="rounded-2xl border border-[color:var(--warning)]/25 bg-[color:var(--warning)]/10 p-4 text-sm text-[color:var(--warning)]">
          <p className="mb-2 inline-flex items-center gap-2 font-medium">
            <ShieldAlert size={15} />
            Data caution
          </p>
          <ul className="space-y-1">
            {result.caution.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-3 pt-2">
        {coach.externalUrl ? (
          <a
            href={coach.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Public profile
            <ExternalLink size={14} />
          </a>
        ) : null}
        <Link
          href={`/chapters/${coach.chapterSlug}`}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
        >
          View chapter
        </Link>
        <Link
          href={`/contact?chapter=${coach.chapterSlug}`}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Contact chapter
        </Link>
      </div>
    </article>
  );
}
