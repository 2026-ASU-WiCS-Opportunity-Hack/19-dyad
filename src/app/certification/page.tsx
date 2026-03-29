import Link from "next/link";
import { CertificationFitAssessment } from "@/components/certification/CertificationFitAssessment";
import { CERTIFICATION_TRACKS } from "@/lib/data";

export default function CertificationPage() {
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Certification</p>
        <h1 className="section-title">Clear pathways from first certification to advanced practice</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">
          This page explains the visible WIAL certification paths and helps prospective coaches
          understand where they likely fit. Course delivery stays in the existing learning
          environment; this site focuses on clarity, routing, and trusted next steps.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-subtle p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            How to use this page
          </p>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            <li>
              <span className="font-semibold text-black">1.</span> Review the certification path
              cards below.
            </li>
            <li>
              <span className="font-semibold text-black">2.</span> Use the AI fit check to compare
              your background to the visible pathways.
            </li>
            <li>
              <span className="font-semibold text-black">3.</span> Start an application online when
              you are ready to submit your details.
            </li>
          </ol>
        </div>
        <div className="card-subtle p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Pathway principle
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Visible pathways are progressive. CALC is the normal entry point, while PALC, SALC, and
            MALC depend on documented practice, mentoring, and institute-level review.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-2">
        {CERTIFICATION_TRACKS.map((track) => (
          <article key={track.level} className="card-subtle p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              {track.level}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{track.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
              {track.summary}
            </p>
            <div className="mt-4 rounded-[1.25rem] border border-black/8 bg-white p-4">
              <p className="text-sm text-[color:var(--muted-foreground)]">Typical scope</p>
              <p className="mt-1 font-semibold">{track.hours}</p>
              <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{track.audience}</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[color:var(--muted-foreground)]">
              {track.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-black">{track.cta}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/certification/apply/${track.level.toLowerCase()}`}
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Apply online
              </Link>
              <span className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
                Review before final submission
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <CertificationFitAssessment />
      </div>
    </div>
  );
}
