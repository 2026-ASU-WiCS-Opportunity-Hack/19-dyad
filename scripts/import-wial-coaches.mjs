import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const csvPath = path.join(repoRoot, "data", "wial_coaches.csv");
const outDir = path.join(repoRoot, "src", "lib", "data");
const showcasePath = path.join(outDir, "showcase-overrides.json");
const embeddingsOutPath = path.join(outDir, "coach-embeddings.json");
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

const COUNTRY_NORMALIZATION = {
  virginia: "united-states",
  "ho-chi-minh-city": "vietnam",
  us: "united-states"
};

const COUNTRY_NAME_OVERRIDES = {
  "united-states": "United States",
  "united-kingdom": "United Kingdom",
  "hong-kong": "Hong Kong",
  "south-africa": "South Africa",
  "syrian-arab-republic": "Syria",
  taiwan: "Taiwan"
};

const REGION_MAP = {
  "united-states": "North America",
  canada: "North America",
  brazil: "South America",
  poland: "Europe",
  netherlands: "Europe",
  france: "Europe",
  "united-kingdom": "Europe",
  ireland: "Europe",
  malaysia: "Asia-Pacific",
  singapore: "Asia-Pacific",
  thailand: "Asia-Pacific",
  vietnam: "Asia-Pacific",
  china: "Asia-Pacific",
  "hong-kong": "Asia-Pacific",
  taiwan: "Asia-Pacific",
  philippines: "Asia-Pacific",
  cambodia: "Asia-Pacific",
  nigeria: "Africa",
  "south-africa": "Africa",
  syria: "Middle East"
};

const LANGUAGE_MAP = {
  "united-states": ["English"],
  canada: ["English", "French"],
  brazil: ["Portuguese"],
  poland: ["Polish", "English"],
  netherlands: ["Dutch", "English"],
  france: ["French", "English"],
  "united-kingdom": ["English"],
  ireland: ["English"],
  malaysia: ["Malay", "English"],
  singapore: ["English", "Mandarin"],
  thailand: ["Thai", "English"],
  vietnam: ["Vietnamese", "English"],
  china: ["Mandarin", "English"],
  "hong-kong": ["Cantonese", "English"],
  taiwan: ["Mandarin", "English"],
  philippines: ["Filipino", "English"],
  cambodia: ["Khmer", "English"],
  nigeria: ["English"],
  "south-africa": ["English"],
  syria: ["Arabic", "English"]
};

const LANGUAGE_CODES = {
  English: "en",
  French: "fr",
  Portuguese: "pt",
  Spanish: "es",
  Polish: "pl",
  Dutch: "nl",
  Malay: "ms",
  Mandarin: "zh",
  Thai: "th",
  Vietnamese: "vi",
  Cantonese: "yue",
  Filipino: "fil",
  Khmer: "km",
  Arabic: "ar"
};

const CHAPTER_EDITORIAL = {
  nigeria: {
    name: "WIAL Nigeria",
    region: "Africa",
    primaryLanguage: "English",
    heroTitle: "Action Learning for West African leadership teams",
    heroSubtitle: "A chapter presence that supports practical leadership development and clearer coach discovery.",
    about: "WIAL Nigeria shows why chapter governance matters: local relevance, clear contact pathways, and global brand consistency.",
    focusAreas: ["Leadership development", "Team effectiveness", "Corporate transformation"],
    contactEmail: "global@wial.org",
    featuredEventTitle: "Certified Action Learning Foundations Session",
    featuredEventDate: "2026-05-14",
    testimonialQuote: "Action Learning gave our leadership team a practical way to solve live business problems together.",
    testimonialAuthor: "Regional chapter participant",
    organizationalClients: ["Financial services", "Public sector", "Energy"]
  },
  "united-states": {
    name: "WIAL USA",
    region: "North America",
    primaryLanguage: "English",
    heroTitle: "A chapter platform built for scale across the U.S.",
    heroSubtitle: "Consistent branding, chapter-level events, and a governed global directory.",
    about: "The U.S. chapter is the clearest example of a larger affiliate that benefits from template inheritance and editorial zones.",
    focusAreas: ["Corporate learning", "Higher education", "Nonprofit leadership"],
    contactEmail: "global@wial.org",
    featuredEventTitle: "Action Learning for complex organizational change",
    featuredEventDate: "2026-06-10",
    testimonialQuote: "The chapter model finally makes local content visible without fragmenting the WIAL brand.",
    testimonialAuthor: "U.S. affiliate director",
    organizationalClients: ["Healthcare systems", "Universities", "Technology firms"]
  },
  brazil: {
    name: "WIAL Brazil",
    region: "South America",
    primaryLanguage: "Portuguese",
    heroTitle: "Aprendizagem em ação com identidade local",
    heroSubtitle: "Conteúdo de capítulo culturalmente adaptado, sem perder a consistência global da marca.",
    about: "Brazil is the ideal chapter to demonstrate multilingual discovery and culturally adapted content generation.",
    focusAreas: ["Leadership development", "Operational excellence", "Team learning"],
    contactEmail: "global@wial.org",
    featuredEventTitle: "Sessão aberta de Action Learning para líderes de equipes",
    featuredEventDate: "2026-06-03",
    testimonialQuote: "A nova plataforma facilita descobrir coaches e divulgar eventos locais com muito mais clareza.",
    testimonialAuthor: "Participante do capítulo",
    organizationalClients: ["Industrial teams", "Healthcare", "Financial services"]
  },
  malaysia: {
    name: "WIAL Malaysia",
    region: "Asia-Pacific",
    primaryLanguage: "Malay",
    heroTitle: "Action Learning for regional leadership teams",
    heroSubtitle: "A shared public structure with local chapter language, events, and coach visibility.",
    about: "Malaysia represents the need for a multilingual chapter model across rapidly evolving regional business contexts.",
    focusAreas: ["Leadership development", "Regional collaboration", "Operational excellence"],
    contactEmail: "global@wial.org",
    featuredEventTitle: "Leadership problem-solving roundtable",
    featuredEventDate: "2026-07-08",
    testimonialQuote: "A single chapter platform makes it easier to explain the method and introduce local coaches.",
    testimonialAuthor: "Chapter participant",
    organizationalClients: ["Manufacturing", "Technology", "Public sector"]
  }
};

const CITY_COUNTRY_OVERRIDES = {
  gdańsk: "poland",
  gdansk: "poland"
};

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines[0]).map((header) => header.replace(/^\uFEFF/, "").trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = (cells[index] || "").trim();
      return acc;
    }, {});
  });
}

function slugify(value) {
  return decodeURIComponent(String(value || ""))
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\u00C0-\u024F]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";
}

function normalizeCountry(slug) {
  const normalized = COUNTRY_NORMALIZATION[slugify(slug)] || slugify(slug);
  return normalized === "syrian-arab-republic" ? "syria" : normalized;
}

function titleizeSlug(slug) {
  if (!slug) return null;
  if (COUNTRY_NAME_OVERRIDES[slug]) return COUNTRY_NAME_OVERRIDES[slug];
  return slug.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function sanitizeWebsite(value) {
  if (!value || value.includes("translate.google.com")) return null;
  return value;
}

const showcase = fs.existsSync(showcasePath) ? JSON.parse(fs.readFileSync(showcasePath, "utf8")) : {};
const coachOverrides = showcase.coachOverrides || {};
const chapterOverrides = showcase.chapterOverrides || {};
const manualShowcaseCoaches = showcase.manualShowcaseCoaches || [];

const csv = fs.readFileSync(csvPath, "utf8");
const rows = parseCsv(csv);
const coaches = [];
const chapterMap = new Map();

for (const [index, row] of rows.entries()) {
  const url = row.profile_url || "";
  const urlPath = url ? new URL(url).pathname : "";
  const parts = decodeURIComponent(urlPath).replace(/^\//, "").split("/").filter(Boolean);
  let countrySlug = normalizeCountry(parts[0] || "global");
  let citySlug = parts.includes("coaches") && parts.indexOf("coaches") >= 2 ? slugify(parts[1]) : null;

  if (citySlug && CITY_COUNTRY_OVERRIDES[citySlug]) {
    countrySlug = CITY_COUNTRY_OVERRIDES[citySlug];
  }

  const countryName = titleizeSlug(countrySlug);
  const cityName = citySlug ? titleizeSlug(citySlug) : null;
  const chapterName = countrySlug === "united-states" ? "WIAL USA" : `WIAL ${countryName}`;
  const editorial = CHAPTER_EDITORIAL[countrySlug] || {};
  const languages = LANGUAGE_MAP[countrySlug] || ["English"];
  const website = sanitizeWebsite(row.website || "");
  const headline = row.subtitle === "Coach’s Contact Information"
    ? "Action Learning Coach"
    : row.subtitle || "Action Learning Coach";
  const about = row.about || `Public coach record imported from the WIAL directory export for ${countryName}. Detailed biography, certification level, and verified specialization data still need confirmation from source systems.`;

  const sourceGapFlags = [];
  if (!row.about) sourceGapFlags.push("missing_bio");
  if (!row.phone) sourceGapFlags.push("missing_phone");
  if (!row.email) sourceGapFlags.push("missing_email");
  sourceGapFlags.push("missing_certification_sync", "missing_verified_specializations");

  const searchKeywords = [
    countryName,
    chapterName,
    REGION_MAP[countrySlug] || "Global",
    ...languages,
    ...(cityName ? [cityName] : []),
    ...(editorial.focusAreas || [])
  ];

  const searchDocument = [
    row.name,
    headline,
    about,
    countryName,
    cityName || "",
    chapterName,
    languages.join(" "),
    REGION_MAP[countrySlug] || "Global",
    ...(editorial.focusAreas || []),
    row.company || ""
  ]
    .filter(Boolean)
    .join(" ");

  const completenessSignals = [row.phone, row.email, website, row.about, row.company, row.certifications].filter(Boolean).length;

  const coach = {
    id: `coach-${String(index + 1).padStart(3, "0")}`,
    name: row.name,
    headline,
    company: row.company || null,
    locationText: cityName ? `${cityName}, ${countryName}` : countryName,
    countrySlug,
    countryName,
    citySlug,
    cityName,
    chapterSlug: countrySlug,
    chapterName,
    region: REGION_MAP[countrySlug] || "Global",
    profileUrl: url || null,
    externalUrl: url || null,
    phone: row.phone || null,
    email: row.email || null,
    website,
    about,
    languages,
    languageCodes: languages.map((language) => LANGUAGE_CODES[language] || "en"),
    certificationLevel: null,
    certificationLabel: "Verification needed",
    approvalStatus: "APPROVED",
    sourceType: "csv-import",
    searchKeywords: Array.from(new Set(searchKeywords.filter(Boolean))),
    searchDocument,
    dataCompleteness: Number(Math.min(1, (completenessSignals + 2) / 10).toFixed(2)),
    sourceGapFlags
  };

  coaches.push(coach);

  if (!chapterMap.has(countrySlug)) {
    chapterMap.set(countrySlug, []);
  }
  chapterMap.get(countrySlug).push(coach);
}

const editorialFallbacks = {
  heroTitle: "A governed chapter website with local editorial control",
  heroSubtitle: "Consistent WIAL branding, local events, coach discovery, and lightweight performance for global audiences.",
  about: "This chapter page is generated from the shared WIAL template and local chapter metadata. It preserves global brand rules while allowing local content updates.",
  focusAreas: ["Leadership development", "Team effectiveness", "Organizational learning"],
  featuredEventTitle: "Action Learning open house",
  featuredEventDate: "2026-06-20",
  testimonialQuote: "The shared platform gives our chapter a cleaner public presence and a better way to stay aligned with WIAL Global.",
  testimonialAuthor: "Chapter lead",
  organizationalClients: ["Corporate teams", "Public sector", "Education"]
};

const chapterSlugs = new Set([...chapterMap.keys(), ...Object.keys(CHAPTER_EDITORIAL)]);
const chapters = [...chapterSlugs]
  .sort()
  .map((slug) => {
    const editorial = { ...editorialFallbacks, ...(CHAPTER_EDITORIAL[slug] || {}) };
    return {
      slug,
      name: editorial.name || (slug === "united-states" ? "WIAL USA" : `WIAL ${titleizeSlug(slug)}`),
      region: editorial.region || REGION_MAP[slug] || "Global",
      primaryLanguage: editorial.primaryLanguage || (LANGUAGE_MAP[slug] || ["English"])[0],
      coachCount: (chapterMap.get(slug) || []).length,
      heroTitle: editorial.heroTitle,
      heroSubtitle: editorial.heroSubtitle,
      about: editorial.about,
      focusAreas: editorial.focusAreas,
      contactEmail: editorial.contactEmail || "global@wial.org",
      featuredEventTitle: editorial.featuredEventTitle,
      featuredEventDate: editorial.featuredEventDate,
      testimonialQuote: editorial.testimonialQuote,
      testimonialAuthor: editorial.testimonialAuthor,
      organizationalClients: editorial.organizationalClients,
      themeLocked: true,
      status: (chapterMap.get(slug) || []).length ? "active" : "template-ready"
    };
  });


const mergedCoaches = coaches
  .map((coach) => {
    const override = coachOverrides[coach.id] || {};
    const merged = {
      ...coach,
      ...override,
      languages: override.languages || coach.languages,
      languageCodes: override.languageCodes || coach.languageCodes,
      searchKeywords: Array.from(new Set([...(coach.searchKeywords || []), ...((override.searchKeywords || []))])),
      sourceGapFlags: Array.from(new Set(override.sourceGapFlags || coach.sourceGapFlags || []))
    };
    merged.searchDocument = Array.from(new Set([
      merged.name,
      merged.headline,
      merged.about,
      merged.countryName,
      merged.cityName || "",
      merged.chapterName,
      merged.languages.join(" "),
      merged.region,
      merged.company || "",
      ...(merged.searchKeywords || [])
    ].filter(Boolean))).join(" ");
    return merged;
  })
  .concat(manualShowcaseCoaches);

const chapterMapWithManual = new Map();
for (const coach of mergedCoaches) {
  if (!chapterMapWithManual.has(coach.chapterSlug)) chapterMapWithManual.set(coach.chapterSlug, []);
  chapterMapWithManual.get(coach.chapterSlug).push(coach);
}

const manualChapterEntries = Object.values(chapterOverrides).filter((entry) => entry.slug && !chapterSlugs.has(entry.slug));
const finalChapters = [...chapterSlugs, ...manualChapterEntries.map((entry) => entry.slug)]
  .filter(Boolean)
  .sort()
  .map((slug) => {
    const editorial = { ...editorialFallbacks, ...(CHAPTER_EDITORIAL[slug] || {}), ...(chapterOverrides[slug] || {}) };
    return {
      slug,
      name: editorial.name || (slug === "united-states" ? "WIAL USA" : `WIAL ${titleizeSlug(slug)}`),
      region: editorial.region || REGION_MAP[slug] || "Global",
      primaryLanguage: editorial.primaryLanguage || (LANGUAGE_MAP[slug] || ["English"])[0],
      coachCount: (chapterMapWithManual.get(slug) || []).length,
      heroTitle: editorial.heroTitle,
      heroSubtitle: editorial.heroSubtitle,
      about: editorial.about,
      focusAreas: editorial.focusAreas,
      contactEmail: editorial.contactEmail || "global@wial.org",
      featuredEventTitle: editorial.featuredEventTitle,
      featuredEventDate: editorial.featuredEventDate,
      testimonialQuote: editorial.testimonialQuote,
      testimonialAuthor: editorial.testimonialAuthor,
      organizationalClients: editorial.organizationalClients,
      themeLocked: true,
      status: (chapterMapWithManual.get(slug) || []).length ? "active" : "template-ready"
    };
  });

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "imported-coaches.json"), JSON.stringify(mergedCoaches, null, 2));
fs.writeFileSync(path.join(outDir, "chapters.json"), JSON.stringify(finalChapters, null, 2));

async function generateEmbeddings() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (!fs.existsSync(embeddingsOutPath)) {
      fs.writeFileSync(embeddingsOutPath, JSON.stringify({}, null, 2));
    }
    return;
  }

  const payload = {};
  const batchSize = 20;
  for (let index = 0; index < mergedCoaches.length; index += batchSize) {
    const batch = mergedCoaches.slice(index, index + batchSize);
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch.map((coach) => [coach.name, coach.certificationLabel, coach.locationText, coach.chapterName, coach.region, coach.languages.join(", "), coach.about, (coach.searchKeywords || []).join(", ")].filter(Boolean).join("\n"))
      })
    });
    if (!response.ok) throw new Error(`Embedding request failed with status ${response.status}`);
    const result = await response.json();
    (result.data || []).forEach((entry, entryIndex) => {
      payload[batch[entryIndex].id] = entry.embedding || [];
    });
  }
  fs.writeFileSync(embeddingsOutPath, JSON.stringify(payload, null, 2));
}

await generateEmbeddings();
console.log(`Imported ${mergedCoaches.length} coaches into ${finalChapters.length} chapters. Showcase layer is available at runtime.`);
