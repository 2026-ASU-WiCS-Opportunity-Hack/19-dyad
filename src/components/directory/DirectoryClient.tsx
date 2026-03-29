"use client";

import { type FormEvent, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Search, Sparkles } from "lucide-react";
import type { CoachRecord, RankedCoachMatch, SearchMethod, SearchResponse } from "@/lib/types";
import { CoachCard } from "@/components/directory/CoachCard";

function makeFallbackResults(coaches: CoachRecord[]): RankedCoachMatch[] {
  return coaches.map((coach) => ({
    coach,
    score: 0,
    matchedFacets: [],
    caution: coach.sourceGapFlags.includes("missing_certification_sync")
      ? ["Certification data still needs external verification."]
      : [],
    semanticOverlap: [],
    reasoning: "Shown from the current public directory source."
  }));
}

export function DirectoryClient({
  coaches,
  chapterSlug,
  languageOptions,
  countryOptions
}: {
  coaches: CoachRecord[];
  chapterSlug?: string | null;
  languageOptions: string[];
  countryOptions: string[];
}) {
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [results, setResults] = useState<RankedCoachMatch[]>(makeFallbackResults(coaches));
  const [explanation, setExplanation] = useState(
    "Public coach profiles are shown below. Search naturally in English, Spanish, or Portuguese to find the most relevant coach."
  );
  const [confidenceLabel, setConfidenceLabel] = useState<SearchResponse["confidenceLabel"]>("limited");
  const [criteriaSummary, setCriteriaSummary] = useState<string[]>([]);
  const [searchMethod, setSearchMethod] = useState<SearchMethod | null>(null);
  const [aiLabel, setAiLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const filteredResults = useMemo(
    () =>
      results.filter(
        (result) =>
          (languageFilter === "all" || result.coach.languages.includes(languageFilter)) &&
          (countryFilter === "all" || result.coach.countryName === countryFilter)
      ),
    [countryFilter, languageFilter, results]
  );

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setResults(makeFallbackResults(coaches));
      setExplanation(
        "Showing the public WIAL directory. Search naturally in English, Spanish, or Portuguese to activate multilingual coach matching."
      );
      setLowConfidence(false);
      setConfidenceLabel("limited");
      setCriteriaSummary([]);
      setSearchMethod(null);
      setAiLabel(null);
      setFallbackNotice(null);
      return;
    }

    setLoading(true);
    setFallbackNotice(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, chapterSlug })
      });
      if (!response.ok) throw new Error("Search service unavailable.");
      const data = (await response.json()) as SearchResponse;

      setResults(data.matches);
      setExplanation(data.explanation);
      setLowConfidence(data.lowConfidence);
      setConfidenceLabel(data.confidenceLabel);
      setSearchMethod(data.searchMethod || null);
      setAiLabel(data.aiLabel || null);
      setFallbackNotice(
        data.usedFallback
          ? "Live AI retrieval is unavailable right now, so the directory is temporarily using metadata-based ranking."
          : null
      );
      setCriteriaSummary(
        [
          data.criteria.countrySlugs[0] ? `Geography: ${data.criteria.countrySlugs.join(", ")}` : null,
          data.criteria.languages[0] ? `Preferred language: ${data.criteria.languages.join(", ")}` : null,
          data.criteria.certificationLevel ? `Certification: ${data.criteria.certificationLevel}` : null,
          data.criteria.semanticConcepts[0] ? `Need: ${data.criteria.semanticConcepts.join(", ")}` : null
        ].filter(Boolean) as string[]
      );
    } catch {
      setResults(makeFallbackResults(coaches));
      setExplanation(
        "Live AI retrieval is unavailable right now. Showing the public directory with metadata and chapter signals."
      );
      setLowConfidence(true);
      setConfidenceLabel("limited");
      setCriteriaSummary([]);
      setSearchMethod("heuristic-fallback");
      setAiLabel(null);
      setFallbackNotice(
        "Live AI retrieval is unavailable right now, so the directory is temporarily using metadata-based ranking."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSearch}
        className="grid gap-4 rounded-[1.75rem] border border-black/8 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_170px_190px_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search coaches</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]"
            size={18}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-13 w-full rounded-full border border-black/8 bg-[color:var(--background)] pl-11 pr-4 text-sm outline-none ring-0 transition focus:border-black/20"
            placeholder="Search by need, location, or language"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          Language
          <select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            className="h-13 rounded-full border border-black/8 bg-[color:var(--background)] px-4 text-sm text-[color:var(--foreground)] outline-none"
          >
            <option value="all">All</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          Country
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="h-13 rounded-full border border-black/8 bg-[color:var(--background)] px-4 text-sm text-[color:var(--foreground)] outline-none"
          >
            <option value="all">All</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-13 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Search directory"}
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="mt-1 text-[color:var(--accent)]" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  Why these results
                </p>
                {aiLabel && searchMethod === "openai-embeddings" ? (
                  <span className="rounded-full border border-black/10 bg-[color:var(--background)] px-3 py-1 text-[11px] font-medium text-[color:var(--muted-foreground)]">
                    Live {aiLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{explanation}</p>
            </div>
          </div>

          {criteriaSummary.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {criteriaSummary.map((entry) => (
                <span
                  key={entry}
                  className="rounded-full border border-black/10 bg-[color:var(--background)] px-3 py-1 text-xs"
                >
                  {entry}
                </span>
              ))}
            </div>
          ) : null}

          {fallbackNotice ? (
            <div className="mt-4 rounded-[1.25rem] border border-[color:var(--warning)]/25 bg-[color:var(--warning)]/10 p-4 text-sm text-[color:var(--warning)]">
              <p className="inline-flex items-center gap-2 font-medium">
                <AlertTriangle size={15} />
                Temporary fallback
              </p>
              <p className="mt-2 leading-7">{fallbackNotice}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Confidence</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight capitalize">{confidenceLabel}</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            {lowConfidence
              ? "Some results still depend on sparse public metadata. Use the shortlist as a starting point, then verify fit with the relevant chapter."
              : "These results are shaped by multilingual matching, profile context, and visible chapter signals."}
          </p>
          <div className="mt-4 rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm text-[color:var(--muted-foreground)]">
            Search method:{" "}
            {searchMethod === "openai-embeddings"
              ? "Live AI multilingual retrieval"
              : searchMethod === "heuristic-fallback"
                ? "Metadata fallback"
                : "Not run yet"}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {filteredResults.length > 0 ? (
          filteredResults.map((result) => <CoachCard key={result.coach.id} result={result} />)
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white p-8 text-sm leading-7 text-[color:var(--muted-foreground)] xl:col-span-3">
            No visible results match the current filters. Reset the country or language filter to widen the directory.
          </div>
        )}
      </div>
    </div>
  );
}
