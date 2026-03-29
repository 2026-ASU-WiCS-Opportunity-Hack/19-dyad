"use client";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
import type { CertificationFitResponse } from "@/lib/types";
export function CertificationFitAssessment() {
  const [name, setName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [country, setCountry] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [targetCertification, setTargetCertification] = useState<"CALC"|"PALC"|"SALC"|"MALC"|"unsure">("unsure");
  const [backgroundText, setBackgroundText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CertificationFitResponse | null>(null);
  const providerLabel = useMemo(() => !result ? "Live GPT-assisted fit review" : result.usedFallback ? "Guided pathway review" : `${result.aiLabel || "GPT-4o"} fit review`, [result]);
  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    try { const text = await file.text(); setBackgroundText((current) => `${current}\n\n${text}`.trim()); }
    catch { setError("Unable to read that file. Paste the resume or profile summary instead."); }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const response = await fetch('/api/certification-fit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, currentRole, country, preferredLanguage, targetCertification, backgroundText }) });
      const payload = await response.json() as CertificationFitResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Unable to review fit right now.');
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to review fit right now.');
    } finally { setLoading(false); }
  }
  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="max-w-3xl space-y-3">
        <p className="kicker">AI fit check</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">See which WIAL path fits your background</h2>
        <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">Paste a resume, LinkedIn summary, or coaching background. The system reviews your experience and recommends the visible certification path that looks most realistic now.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm"><span className="font-medium">Name</span><input value={name} onChange={(event)=>setName(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium">Current role</span><input value={currentRole} onChange={(event)=>setCurrentRole(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium">Country</span><input value={country} onChange={(event)=>setCountry(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium">Preferred language</span><select value={preferredLanguage} onChange={(event)=>setPreferredLanguage(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4">{['English','Portuguese','French','Spanish'].map((option) => <option key={option}>{option}</option>)}</select></label>
          </div>
          <label className="space-y-2 text-sm"><span className="font-medium">Target pathway</span><select value={targetCertification} onChange={(event)=>setTargetCertification(event.target.value as typeof targetCertification)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"><option value="unsure">Not sure yet</option><option value="CALC">CALC</option><option value="PALC">PALC</option><option value="SALC">SALC</option><option value="MALC">MALC</option></select></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Resume or background summary</span><textarea value={backgroundText} onChange={(event)=>setBackgroundText(event.target.value)} rows={10} placeholder="please give your response here!" className="w-full rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4 leading-7" /></label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"><FileText size={15} />Upload text resume<input type="file" accept=".txt,.md,.rtf" className="hidden" onChange={handleFileUpload} /></label>
            <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={15} />}Review fit</button>
          </div>
          {error ? <div className="rounded-[1.25rem] border border-[color:var(--danger)]/20 bg-[color:var(--danger)]/8 p-4 text-sm text-[color:var(--danger)]">{error}</div> : null}
        </div>
        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Assessment</p><span className="rounded-full border border-black/10 bg-[color:var(--background)] px-3 py-1 text-[11px] font-medium text-[color:var(--muted-foreground)]">{providerLabel}</span></div>
          {result ? <div className="mt-5 space-y-5"><div><p className="text-sm text-[color:var(--muted-foreground)]">Recommended path</p><h3 className="mt-1 text-3xl font-semibold tracking-tight">{result.recommendedTrack}</h3><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{result.summary}</p></div><div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4"><p className="text-sm font-medium capitalize">Fit level: {result.fitLabel}</p><p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{result.caution}</p></div><div><p className="text-sm font-medium">Why this path fits</p><ul className="mt-2 space-y-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{result.whyItFits.map((entry) => <li key={entry}>• {entry}</li>)}</ul></div><div><p className="text-sm font-medium">Readiness gaps</p><ul className="mt-2 space-y-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{result.readinessGaps.map((entry) => <li key={entry}>• {entry}</li>)}</ul></div><div><p className="text-sm font-medium">Next steps</p><ul className="mt-2 space-y-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{result.nextSteps.map((entry) => <li key={entry}>• {entry}</li>)}</ul></div></div> : <div className="mt-5 rounded-[1.5rem] border border-dashed border-black/10 bg-[color:var(--background)] p-5 text-sm leading-7 text-[color:var(--muted-foreground)]">The fit review will recommend the most realistic visible path now, explain why, and point out the gaps you should clarify with a chapter or WIAL Global.</div>}
        </div>
      </form>
    </section>
  );
}
