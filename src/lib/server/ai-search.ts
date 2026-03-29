import { getChapterBySlug } from "@/lib/data";
import coachEmbeddingsJson from "@/lib/data/coach-embeddings.json";
import { buildCriteria, getConceptVariants, searchCoaches } from "@/lib/search";
import type {
  CoachRecord,
  ConfidenceLabel,
  MatchResponse,
  RankedCoachMatch,
  SearchCriteria,
  SearchResponse,
  CertificationLevel
} from "@/lib/types";
import { normalizeText, titleCase, unique } from "@/lib/utils";
import { getConfiguredAIDisplayLabel, hasOpenAIKey, requestEmbedding, requestEmbeddings, requestStructuredOutput } from "@/lib/server/openai";

const parseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    queryLanguage: { type: "string" },
    translatedQuery: { type: "string" },
    countrySlugs: { type: "array", items: { type: "string" } },
    languages: { type: "array", items: { type: "string" } },
    certificationLevel: {
      anyOf: [{ type: "string", enum: ["CALC", "PALC", "SALC", "MALC"] }, { type: "null" }]
    },
    sectors: { type: "array", items: { type: "string" } },
    topics: { type: "array", items: { type: "string" } },
    semanticConcepts: { type: "array", items: { type: "string" } },
    organizationType: { anyOf: [{ type: "string" }, { type: "null" }] },
    conciseSummary: { type: "string" }
  },
  required: [
    "queryLanguage",
    "translatedQuery",
    "countrySlugs",
    "languages",
    "certificationLevel",
    "sectors",
    "topics",
    "semanticConcepts",
    "organizationType",
    "conciseSummary"
  ]
} as const;

const persistedEmbeddings = (coachEmbeddingsJson as Record<string, number[]>) || {};
const coachEmbeddingCache = new Map<string, number[]>(Object.entries(persistedEmbeddings));

function cosineSimilarity(left: number[], right: number[]) {
  if (!left.length || !right.length || left.length !== right.length) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index] || 0;
    const b = right[index] || 0;
    dot += a * b;
    leftNorm += a * a;
    rightNorm += b * b;
  }
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function coachEmbeddingText(coach: CoachRecord) {
  return [
    coach.name,
    coach.certificationLabel,
    coach.locationText,
    coach.chapterName,
    coach.region,
    coach.languages.join(", "),
    coach.about,
    coach.searchKeywords.join(", ")
  ]
    .filter(Boolean)
    .join("\n");
}

async function ensureCoachEmbeddings(coaches: CoachRecord[]) {
  const missing = coaches.filter((coach) => !coachEmbeddingCache.has(coach.id));
  if (missing.length === 0) return;

  const batchSize = 20;
  for (let index = 0; index < missing.length; index += batchSize) {
    const batch = missing.slice(index, index + batchSize);
    const vectors = await requestEmbeddings(batch.map(coachEmbeddingText));
    if (!vectors || vectors.length !== batch.length) return;
    batch.forEach((coach, coachIndex) => {
      coachEmbeddingCache.set(coach.id, vectors[coachIndex] || []);
    });
  }
}

function normalizeAIcriteria(rawQuery: string, base: SearchCriteria, parsed: Partial<SearchCriteria> & { conciseSummary?: string }): SearchCriteria {
  return {
    rawQuery,
    normalizedQuery: normalizeText(rawQuery),
    queryLanguage: parsed.queryLanguage || base.queryLanguage,
    translatedQuery: parsed.translatedQuery || base.translatedQuery,
    languages: parsed.languages && parsed.languages.length ? unique(parsed.languages) : base.languages,
    countrySlugs: parsed.countrySlugs && parsed.countrySlugs.length ? unique(parsed.countrySlugs) : base.countrySlugs,
    certificationLevel: (parsed.certificationLevel ?? base.certificationLevel) as CertificationLevel,
    sectors: parsed.sectors && parsed.sectors.length ? unique(parsed.sectors) : base.sectors,
    topics: parsed.topics && parsed.topics.length ? unique(parsed.topics) : base.topics,
    semanticConcepts:
      parsed.semanticConcepts && parsed.semanticConcepts.length ? unique(parsed.semanticConcepts) : base.semanticConcepts,
    organizationType: parsed.organizationType ?? base.organizationType,
    chapterSlug: base.chapterSlug,
    limit: base.limit
  };
}

async function parseCriteria(rawQuery: string, base: SearchCriteria) {
  if (!hasOpenAIKey() || !rawQuery.trim()) return { criteria: base, summary: "" };

  try {
    const parsed = await requestStructuredOutput<
      Pick<
        SearchCriteria,
        | "queryLanguage"
        | "translatedQuery"
        | "countrySlugs"
        | "languages"
        | "certificationLevel"
        | "sectors"
        | "topics"
        | "semanticConcepts"
        | "organizationType"
      > & { conciseSummary: string }
    >({
      schemaName: "WialCoachSearchIntent",
      schema: parseSchema,
      systemPrompt:
        "You interpret natural-language coach discovery requests for WIAL. Convert the request into structured fields for coach search. Keep country slugs consistent with website paths such as brazil, nigeria, united-states, poland, malaysia, kenya, france, united-kingdom, south-africa, hong-kong. Translate the request into concise English for retrieval, but never invent needs or certifications that were not asked for.",
      userPrompt: JSON.stringify({ rawQuery, heuristicBase: base }, null, 2),
      temperature: 0,
      maxOutputTokens: 700
    });

    if (!parsed) return { criteria: base, summary: "" };
    return {
      criteria: normalizeAIcriteria(rawQuery, base, parsed),
      summary: parsed.conciseSummary || ""
    };
  } catch {
    return { criteria: base, summary: "" };
  }
}

function buildFacetMatches(criteria: SearchCriteria, coach: CoachRecord) {
  const facets: string[] = [];
  const caution: string[] = [];
  const semanticOverlap: string[] = [];
  const text = normalizeText(coach.searchDocument);

  let bonus = 0;
  if (criteria.chapterSlug && coach.chapterSlug === criteria.chapterSlug) {
    bonus += 8;
    facets.push(`chapter: ${coach.chapterName}`);
  }

  if (criteria.countrySlugs.includes(coach.countrySlug)) {
    bonus += 14;
    facets.push(`location: ${coach.countryName}`);
  }

  for (const language of criteria.languages) {
    if (coach.languages.includes(language)) {
      bonus += 10;
      facets.push(`language: ${language}`);
    }
  }

  if (criteria.certificationLevel && coach.certificationLevel === criteria.certificationLevel) {
    bonus += 12;
    facets.push(`certification: ${criteria.certificationLevel}`);
  }

  for (const concept of criteria.semanticConcepts) {
    const variants = getConceptVariants(concept);
    if (variants.some((variant) => text.includes(normalizeText(variant)))) {
      bonus += 4;
      semanticOverlap.push(concept);
    }
  }

  if (criteria.organizationType) {
    const normalizedOrg = normalizeText(criteria.organizationType);
    if (text.includes(normalizedOrg)) {
      bonus += 4;
      facets.push(`organization: ${criteria.organizationType}`);
    }
  }

  if (coach.dataCompleteness < 0.55) {
    caution.push("Imported profile is still sparse and may need chapter verification.");
  }
  if (coach.sourceGapFlags.includes("missing_certification_sync")) {
    caution.push("Certification display still needs external verification sync.");
  }
  if (coach.sourceGapFlags.includes("missing_verified_specializations")) {
    caution.push("Specializations come from public profile text and may need review.");
  }

  return { bonus, facets: unique(facets), semanticOverlap: unique(semanticOverlap), caution: unique(caution) };
}

function confidenceFromTopScore(topScore: number, matchCount: number): ConfidenceLabel {
  if (matchCount === 0) return "limited";
  if (topScore >= 82) return "strong";
  if (topScore >= 56) return "moderate";
  return "limited";
}

function buildExplanation(criteria: SearchCriteria, matches: RankedCoachMatch[], usedFallback: boolean) {
  if (!criteria.rawQuery.trim()) {
    return "Showing public WIAL coach profiles. Add a language, geography, or coaching need to activate multilingual AI discovery.";
  }
  if (matches.length === 0) {
    return "No strong coach match was found. Route the enquiry to the relevant chapter so a human can confirm fit and availability.";
  }

  const signals = unique(matches.flatMap((match) => [...match.matchedFacets, ...match.semanticOverlap.map((entry) => `topic: ${entry}`)]))
    .slice(0, 5)
    .join(", ");
  const method = usedFallback
    ? "Fallback ranking is active because the live retrieval path is unavailable right now."
    : "OpenAI embeddings ranked the multilingual meaning of the request before the final result explanation was generated.";
  return `${method} Strongest visible match signals: ${signals || "broad public profile overlap"}.`;
}

function buildReasoning(criteria: SearchCriteria, coach: CoachRecord, similarity: number, facets: string[], semanticOverlap: string[]) {
  const parts = [];
  if (similarity >= 0.82) parts.push("very strong cross-language semantic similarity");
  else if (similarity >= 0.68) parts.push("strong semantic similarity");
  else if (similarity >= 0.54) parts.push("moderate semantic similarity");
  if (facets.length) parts.push(facets.slice(0, 2).join(" and "));
  if (semanticOverlap.length) parts.push(`topic overlap in ${semanticOverlap.slice(0, 2).join(" and ")}`);
  if (parts.length === 0) {
    return `Matched on broader Action Learning context from ${coach.chapterName}.`;
  }
  return `Matched on ${parts.join(", ")}.`;
}

export async function searchCoachesWithAI(rawQuery: string, coaches: CoachRecord[], options: Partial<Pick<SearchCriteria, "chapterSlug" | "limit">> = {}): Promise<SearchResponse> {
  const heuristicBase = buildCriteria(rawQuery, options);
  const scopedCoaches = heuristicBase.chapterSlug
    ? coaches.filter((coach) => coach.chapterSlug === heuristicBase.chapterSlug)
    : coaches;

  if (!hasOpenAIKey() || !rawQuery.trim()) {
    return {
      ...searchCoaches(rawQuery, scopedCoaches, options),
      searchMethod: "heuristic-fallback",
      aiLabel: undefined
    };
  }

  try {
    const parsed = await parseCriteria(rawQuery, heuristicBase);
    const criteria = parsed.criteria;
    await ensureCoachEmbeddings(scopedCoaches);

    const queryEmbedding = await requestEmbedding(
      [rawQuery, criteria.translatedQuery, criteria.semanticConcepts.join(", "), criteria.organizationType || ""].filter(Boolean).join("\n")
    );

    if (!queryEmbedding) {
      return {
        ...searchCoaches(rawQuery, scopedCoaches, options),
        searchMethod: "heuristic-fallback",
        aiLabel: undefined
      };
    }

    const ranked = scopedCoaches
      .map((coach) => {
        const coachEmbedding = coachEmbeddingCache.get(coach.id) || [];
        const similarity = cosineSimilarity(queryEmbedding, coachEmbedding);
        const { bonus, facets, semanticOverlap, caution } = buildFacetMatches(criteria, coach);
        const score = Number((similarity * 100 * 0.76 + bonus).toFixed(2));
        return {
          coach,
          score,
          matchedFacets: facets,
          caution,
          semanticOverlap,
          reasoning: buildReasoning(criteria, coach, similarity, facets, semanticOverlap)
        } satisfies RankedCoachMatch;
      })
      .filter((entry) => entry.score > 12)
      .sort((left, right) => right.score - left.score)
      .slice(0, criteria.limit);

    const confidenceLabel = confidenceFromTopScore(ranked[0]?.score || 0, ranked.length);
    return {
      criteria,
      explanation: buildExplanation(criteria, ranked, false),
      matches: ranked,
      usedFallback: false,
      lowConfidence: confidenceLabel === "limited",
      confidenceLabel,
      searchMethod: "openai-embeddings",
      aiLabel: getConfiguredAIDisplayLabel()
    };
  } catch {
    return {
      ...searchCoaches(rawQuery, scopedCoaches, options),
      searchMethod: "heuristic-fallback",
      aiLabel: undefined
    };
  }
}

export async function matchCoachesWithAI(rawQuery: string, coaches: CoachRecord[]): Promise<MatchResponse> {
  const search = await searchCoachesWithAI(rawQuery, coaches, { limit: 5 });
  const preferredChapter = search.criteria.chapterSlug || search.criteria.countrySlugs[0] || null;
  const fallbackChapter = preferredChapter ? getChapterBySlug(preferredChapter) : null;
  const parts = [
    search.criteria.countrySlugs[0] ? `geography: ${titleCase(search.criteria.countrySlugs.join(", "))}` : null,
    search.criteria.languages[0] ? `language: ${search.criteria.languages.join(", ")}` : null,
    search.criteria.certificationLevel ? `certification: ${search.criteria.certificationLevel}` : null,
    search.criteria.organizationType ? `organization: ${search.criteria.organizationType}` : null,
    search.criteria.semanticConcepts[0] ? `need: ${search.criteria.semanticConcepts.join(", ")}` : null
  ].filter(Boolean);

  const recommendedNextStep =
    search.confidenceLabel === "strong"
      ? "Use this shortlist to contact a coach or chapter directly and confirm availability."
      : fallbackChapter
        ? `Use the shortlist as a starting point, then ask ${fallbackChapter.name} to confirm fit.`
        : "Use the shortlist as a starting point, then route the enquiry to WIAL Global for human review.";

  return {
    ...search,
    extractedNeed: rawQuery,
    parsedCriteriaSummary: parts.length ? parts.join(" • ") : "Broad coach discovery request",
    recommendedNextStep,
    fallbackChapter
  };
}
