import { CHAPTERS, getChapterBySlug } from "@/lib/data";
import type {
  ChapterRecord,
  CoachRecord,
  MatchResponse,
  RankedCoachMatch,
  SearchCriteria,
  SearchResponse
} from "@/lib/types";
import { normalizeText, titleCase, unique } from "@/lib/utils";

const COUNTRY_SYNONYMS: Record<string, string[]> = {
  brazil: ["brazil", "brasil", "brazilian", "sao paulo", "são paulo"],
  "united-states": ["usa", "us", "united states", "america", "american"],
  poland: ["poland", "polish", "warsaw", "gdansk", "gdańsk"],
  malaysia: ["malaysia", "malay", "kuala lumpur"],
  netherlands: ["netherlands", "dutch", "amsterdam", "barneveld", "nieuwegein"],
  thailand: ["thailand", "thai", "bangkok"],
  singapore: ["singapore"],
  vietnam: ["vietnam", "vietnamese", "ho chi minh", "saigon"],
  china: ["china", "chinese", "shanghai", "beijing"],
  "hong-kong": ["hong kong"],
  france: ["france", "french", "paris"],
  philippines: ["philippines", "filipino", "tagalog", "manila"],
  cambodia: ["cambodia", "khmer", "phnom penh"],
  nigeria: ["nigeria", "lagos", "abuja"],
  "united-kingdom": ["united kingdom", "uk", "britain", "british", "london"],
  ireland: ["ireland", "irish", "dublin"],
  "south-africa": ["south africa", "johannesburg", "cape town"],
  canada: ["canada", "canadian", "toronto", "montreal"],
  taiwan: ["taiwan", "taipei"],
  syria: ["syria", "syrian", "damascus"]
};

const LANGUAGE_SYNONYMS: Record<string, string[]> = {
  English: ["english", "inglês", "ingles", "anglais", "inglés"],
  Portuguese: ["portuguese", "português", "portugues", "brazilian portuguese", "portugais"],
  French: ["french", "français", "francais", "francês", "francés"],
  Spanish: ["spanish", "español", "espanol", "espagnol"],
  Polish: ["polish", "polski"],
  Dutch: ["dutch", "nederlands"],
  Malay: ["malay", "bahasa melayu", "bahasa"],
  Mandarin: ["mandarin", "chinese", "中文"],
  Cantonese: ["cantonese", "廣東話"],
  Thai: ["thai"],
  Vietnamese: ["vietnamese"],
  Filipino: ["filipino", "tagalog"],
  Khmer: ["khmer"],
  Arabic: ["arabic", "العربية"]
};

const CERTIFICATION_SYNONYMS: Record<Exclude<SearchCriteria["certificationLevel"], null>, string[]> = {
  CALC: ["calc", "certified action learning coach", "coach entry level", "coach certification"],
  PALC: ["palc", "professional action learning coach"],
  SALC: ["salc", "senior action learning coach"],
  MALC: ["malc", "master action learning coach"]
};

export const CONCEPT_SYNONYMS: Record<string, string[]> = {
  leadership: [
    "leadership",
    "liderança",
    "lideranca",
    "leadership development",
    "desarrollo de liderazgo",
    "développement du leadership",
    "liderazgo"
  ],
  manufacturing: [
    "manufacturing",
    "industrial",
    "factory",
    "fábrica",
    "fabrication",
    "manufatura",
    "operations"
  ],
  "team performance": [
    "team performance",
    "team dynamics",
    "team effectiveness",
    "cross-functional",
    "collaboration",
    "desempenho da equipe",
    "desempeño del equipo",
    "performance d'équipe"
  ],
  government: ["government", "public sector", "policy", "govt", "governo", "gobierno", "secteur public"],
  healthcare: ["healthcare", "hospital", "clinical", "patient safety", "saúde", "salud", "santé"],
  nonprofit: ["nonprofit", "ngo", "charity", "social impact", "ong", "association"],
  finance: ["finance", "financial services", "bank", "banking", "banco", "banque"],
  education: ["education", "university", "faculty", "higher education", "educação", "educación"],
  training: [
    "training",
    "trainer",
    "facilitation",
    "facilitator",
    "workshop",
    "workshops",
    "learning program",
    "capacitacion",
    "capacitación",
    "entrenamiento",
    "formacion",
    "formación",
    "treinamento",
    "formacao",
    "formação",
    "desenvolvimento",
    "desarrollo"
  ],
  "human resources": [
    "human resources",
    "hr",
    "people team",
    "people function",
    "talent",
    "talent development",
    "people operations",
    "employee development",
    "recursos humanos",
    "rrhh",
    "rh",
    "gestao de pessoas",
    "gestão de pessoas",
    "desarrollo de talento",
    "desenvolvimento de talentos"
  ],
  innovation: ["innovation", "inovação", "innovacion", "innovation capability"],
  translation: ["translation", "multilingual", "cross-lingual", "idioma", "language support", "traduction", "traducción"],
  "operational excellence": [
    "operational excellence",
    "operational change",
    "process improvement",
    "excelência operacional",
    "excelencia operativa"
  ],
  certification: ["certification", "certificação", "certificacion", "certification pathway", "coach training"]
};

const ORGANIZATION_SYNONYMS: Record<string, string[]> = {
  corporate: ["company", "corporate", "business", "enterprise", "empresa", "entreprise"],
  nonprofit: ["nonprofit", "charity", "ngo", "foundation", "association", "social sector"],
  public: ["government", "public sector", "municipal", "state agency"],
  education: ["university", "school", "faculty", "education"],
  healthcare: ["hospital", "health system", "clinic", "healthcare"]
};

const LANGUAGE_HINTS: Record<string, string[]> = {
  Portuguese: ["liderança", "equipe", "organização", "capítulo", "procuro", "coach", "brasil", "treinamento"],
  French: ["équipe", "organisation", "chapitre", "recherche", "coach", "france"],
  Spanish: ["liderazgo", "equipo", "organización", "capítulo", "busco", "coach", "españa", "entrenamiento"],
  English: ["leadership", "team", "organization", "chapter", "looking", "coach", "training"]
};

const CHAPTER_FOCUS_MAP = new Map(
  CHAPTERS.map((chapter) => [chapter.slug, chapter.focusAreas.map(normalizeText)])
);

function includesAny(value: string, variants: string[]) {
  return variants.some((variant) => value.includes(normalizeText(variant)));
}

function extractCountries(query: string) {
  return Object.entries(COUNTRY_SYNONYMS)
    .filter(([, variants]) => includesAny(query, variants))
    .map(([country]) => country);
}

function extractLanguages(query: string) {
  return Object.entries(LANGUAGE_SYNONYMS)
    .filter(([, variants]) => includesAny(query, variants))
    .map(([language]) => language);
}

function extractCertification(query: string) {
  const match = Object.entries(CERTIFICATION_SYNONYMS).find(([, variants]) => includesAny(query, variants));
  return match ? (match[0] as SearchCriteria["certificationLevel"]) : null;
}

function extractConcepts(query: string) {
  return Object.entries(CONCEPT_SYNONYMS)
    .filter(([, variants]) => includesAny(query, variants))
    .map(([concept]) => concept);
}

function extractOrganizationType(query: string) {
  const match = Object.entries(ORGANIZATION_SYNONYMS).find(([, variants]) => includesAny(query, variants));
  return match?.[0] ?? null;
}

function detectQueryLanguage(query: string) {
  const scores = Object.entries(LANGUAGE_HINTS).map(([language, variants]) => ({
    language,
    score: variants.reduce((sum, variant) => sum + (query.includes(normalizeText(variant)) ? 1 : 0), 0)
  }));

  const best = scores.sort((left, right) => right.score - left.score)[0];
  return best && best.score > 0 ? best.language : "English";
}

function translateQueryToEnglish(normalizedQuery: string) {
  let translated = normalizedQuery;
  const reverseDictionaries: Record<string, string> = {};

  for (const [concept, variants] of Object.entries(CONCEPT_SYNONYMS)) {
    for (const variant of variants) {
      reverseDictionaries[normalizeText(variant)] = concept;
    }
  }
  for (const [language, variants] of Object.entries(LANGUAGE_SYNONYMS)) {
    for (const variant of variants) {
      reverseDictionaries[normalizeText(variant)] = language.toLowerCase();
    }
  }

  const ordered = Object.entries(reverseDictionaries).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of ordered) {
    const pattern = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    translated = translated.replace(pattern, target);
  }

  return translated;
}

function confidenceLabel(matches: RankedCoachMatch[], concepts: string[]) {
  if (matches.length === 0) return "limited" as const;
  const top = matches[0];
  const strongSemantic = top.semanticOverlap.length >= Math.min(2, concepts.length || 1);
  if (top.score >= 60 || strongSemantic) return "strong" as const;
  if (top.score >= 28) return "moderate" as const;
  return "limited" as const;
}

function buildCoachSearchHaystack(coach: CoachRecord) {
  const chapterFocus = CHAPTER_FOCUS_MAP.get(coach.chapterSlug) ?? [];
  return normalizeText(
    [
      coach.searchDocument,
      coach.searchKeywords.join(" "),
      chapterFocus.join(" "),
      coach.languages.join(" "),
      coach.countryName,
      coach.chapterName,
      coach.region
    ].join(" ")
  );
}

export function getConceptVariants(concept: string) {
  return CONCEPT_SYNONYMS[concept] || [concept];
}

function computeSemanticOverlap(criteria: SearchCriteria, coach: CoachRecord) {
  const haystack = buildCoachSearchHaystack(coach);
  const overlap: string[] = [];

  for (const concept of criteria.semanticConcepts) {
    const variants = getConceptVariants(concept);
    if (variants.some((variant) => haystack.includes(normalizeText(variant)))) {
      overlap.push(concept);
    }
  }

  return unique(overlap);
}

function computeCoachScore(criteria: SearchCriteria, coach: CoachRecord): RankedCoachMatch {
  let score = 0;
  const matchedFacets: string[] = [];
  const caution: string[] = [];
  const semanticOverlap = computeSemanticOverlap(criteria, coach);
  const coachText = buildCoachSearchHaystack(coach);
  const chapter = getChapterBySlug(coach.chapterSlug);

  if (!criteria.normalizedQuery) {
    score += 10;
  }

  if (criteria.chapterSlug && coach.chapterSlug === criteria.chapterSlug) {
    score += 24;
    matchedFacets.push(`chapter: ${coach.chapterName}`);
  }

  for (const country of criteria.countrySlugs) {
    if (coach.countrySlug === country) {
      score += 26;
      matchedFacets.push(`country: ${coach.countryName}`);
    }
  }

  for (const language of criteria.languages) {
    if (coach.languages.includes(language)) {
      score += 18;
      matchedFacets.push(`language: ${language}`);
    } else if (chapter?.primaryLanguage === language) {
      score += 12;
      matchedFacets.push(`chapter language: ${language}`);
    }
  }

  if (criteria.certificationLevel) {
    if (coach.certificationLevel === criteria.certificationLevel) {
      score += 18;
      matchedFacets.push(`certification: ${criteria.certificationLevel}`);
    } else if (!coach.certificationLevel) {
      caution.push("Certification level still needs verified sync.");
    }
  }

  if (criteria.organizationType) {
    const orgVariants = ORGANIZATION_SYNONYMS[criteria.organizationType] || [criteria.organizationType];
    if (orgVariants.some((variant) => coachText.includes(normalizeText(variant)))) {
      score += 8;
      matchedFacets.push(`organization: ${criteria.organizationType}`);
    }
  }

  if (semanticOverlap.length > 0) {
    score += semanticOverlap.length * 14;
    for (const concept of semanticOverlap.slice(0, 3)) {
      matchedFacets.push(`topic: ${concept}`);
    }
  }

  const tokens = unique(
    criteria.translatedQuery
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
  );

  for (const token of tokens) {
    if (coachText.includes(token)) score += 2;
  }

  if (coach.phone) score += 1;
  if (coach.email) score += 1;
  if (coach.dataCompleteness < 0.5) {
    caution.push("Imported profile is still sparse and may need chapter verification.");
  }

  const reasoning = semanticOverlap.length
    ? `Matched on ${semanticOverlap.slice(0, 2).join(" + ")} with ${coach.chapterName} context.`
    : `Matched on location, language, and public profile metadata.`;

  return {
    coach,
    score,
    matchedFacets: unique(matchedFacets),
    caution: unique(caution),
    semanticOverlap,
    reasoning
  };
}

function buildExplanation(criteria: SearchCriteria, matches: RankedCoachMatch[], label: SearchResponse["confidenceLabel"]) {
  if (!criteria.rawQuery.trim()) {
    return "Showing all public coach profiles. Search naturally in English, Spanish, or Portuguese to find a relevant coach.";
  }

  if (matches.length === 0) {
    return "No strong match was found in the current directory metadata. Try a broader business need or different country filter to widen the search.";
  }

  const facets = unique(matches.flatMap((result) => result.matchedFacets)).slice(0, 4).join(", ");
  return `Results are ranked using location, language, chapter context, and multilingual concept matching. Confidence: ${label}. Strongest signals: ${facets || "broad public profile overlap"}.`;
}

function chooseFallbackChapter(criteria: SearchCriteria): ChapterRecord | null {
  const preferredChapter = criteria.chapterSlug ?? criteria.countrySlugs[0] ?? null;
  if (preferredChapter) return getChapterBySlug(preferredChapter);

  const languageMatch = CHAPTERS.find((chapter) => criteria.languages.includes(chapter.primaryLanguage));
  return languageMatch ?? null;
}

function criteriaSummary(criteria: SearchCriteria) {
  const parts = [
    criteria.countrySlugs[0] ? `Geography: ${titleCase(criteria.countrySlugs[0])}` : null,
    criteria.languages[0] ? `Preferred language: ${criteria.languages.join(", ")}` : null,
    criteria.certificationLevel ? `Certification: ${criteria.certificationLevel}` : null,
    criteria.organizationType ? `Organization: ${criteria.organizationType}` : null,
    criteria.semanticConcepts[0] ? `Need: ${criteria.semanticConcepts.join(", ")}` : null
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : "Broad coach discovery request";
}

function nextStep(criteria: SearchCriteria, label: SearchResponse["confidenceLabel"], fallbackChapter: ChapterRecord | null) {
  if (label === "strong") {
    return "Use the ranked list as a confident short list, then confirm availability directly with the coach or chapter.";
  }

  if (fallbackChapter) {
    return `Use the ranked list as a starting point, then contact ${fallbackChapter.name} to verify fit and current availability.`;
  }

  return "Use the ranked list as a starting point, then route the enquiry to WIAL Global for human verification.";
}

export function buildCriteria(
  rawQuery: string,
  options: Partial<Pick<SearchCriteria, "chapterSlug" | "limit">> = {}
): SearchCriteria {
  const normalizedQuery = normalizeText(rawQuery || "");
  const queryLanguage = detectQueryLanguage(normalizedQuery);
  const translatedQuery = translateQueryToEnglish(normalizedQuery);
  const semanticConcepts = extractConcepts(translatedQuery);

  return {
    rawQuery,
    normalizedQuery,
    queryLanguage,
    translatedQuery,
    languages: extractLanguages(normalizedQuery),
    countrySlugs: extractCountries(normalizedQuery),
    certificationLevel: extractCertification(normalizedQuery),
    sectors: semanticConcepts.filter((concept) =>
      ["manufacturing", "government", "healthcare", "finance", "education", "nonprofit"].includes(concept)
    ),
    topics: semanticConcepts.filter(
      (concept) =>
        !["manufacturing", "government", "healthcare", "finance", "education", "nonprofit"].includes(concept)
    ),
    semanticConcepts,
    organizationType: extractOrganizationType(normalizedQuery),
    chapterSlug: options.chapterSlug ?? null,
    limit: options.limit ?? 8
  };
}

export function searchCoaches(
  rawQuery: string,
  coaches: CoachRecord[],
  options: Partial<Pick<SearchCriteria, "chapterSlug" | "limit">> = {}
): SearchResponse {
  const criteria = buildCriteria(rawQuery, options);
  const ranked = coaches
    .map((coach) => computeCoachScore(criteria, coach))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, criteria.limit);

  const label = confidenceLabel(ranked, criteria.semanticConcepts);
  const lowConfidence = label === "limited" || ranked.length === 0;

  return {
    criteria,
    explanation: buildExplanation(criteria, ranked, label),
    matches: ranked,
    usedFallback: true,
    lowConfidence,
    confidenceLabel: label,
    searchMethod: "heuristic-fallback"
  };
}

export function matchCoaches(rawQuery: string, coaches: CoachRecord[]): MatchResponse {
  const search = searchCoaches(rawQuery, coaches, { limit: 5 });
  const fallbackChapter = chooseFallbackChapter(search.criteria);

  return {
    ...search,
    extractedNeed: rawQuery,
    parsedCriteriaSummary: criteriaSummary(search.criteria),
    recommendedNextStep: nextStep(search.criteria, search.confidenceLabel, fallbackChapter),
    fallbackChapter
  };
}
