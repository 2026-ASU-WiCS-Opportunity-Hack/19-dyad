import chaptersJson from "@/lib/data/chapters.json";
import coachesJson from "@/lib/data/imported-coaches.json";
import knowledgeJson from "@/lib/data/knowledge.json";
import { CHAPTER_OVERRIDES, COACH_OVERRIDES, MANUAL_SHOWCASE_COACHES } from "@/lib/data/showcase";
import type {
  CertificationTrack,
  ChapterRecord,
  CoachRecord,
  EventRecord,
  InvoiceRecord,
  KnowledgeItem
} from "@/lib/types";
import { unique } from "@/lib/utils";

const BASE_CHAPTERS = chaptersJson as ChapterRecord[];
const BASE_COACHES = coachesJson as CoachRecord[];
export const KNOWLEDGE_ITEMS = knowledgeJson as KnowledgeItem[];

function buildSearchDocument(coach: CoachRecord) {
  return unique(
    [
      coach.name,
      coach.headline,
      coach.about,
      coach.countryName,
      coach.cityName || "",
      coach.chapterName,
      coach.languages.join(" "),
      coach.region,
      coach.company || "",
      ...coach.searchKeywords
    ].filter(Boolean)
  ).join(" ");
}

function applyCoachOverride(coach: CoachRecord): CoachRecord {
  const override = COACH_OVERRIDES[coach.id] || {};
  const merged = {
    ...coach,
    ...override,
    languages: override.languages || coach.languages,
    languageCodes: override.languageCodes || coach.languageCodes,
    searchKeywords: unique([...(coach.searchKeywords || []), ...((override.searchKeywords as string[] | undefined) || [])]),
    sourceGapFlags: unique(override.sourceGapFlags || coach.sourceGapFlags || [])
  } as CoachRecord;
  return {
    ...merged,
    searchDocument: buildSearchDocument(merged)
  };
}

function dedupeCoachesById(coaches: CoachRecord[]) {
  const byId = new Map<string, CoachRecord>();
  for (const coach of coaches) {
    byId.set(coach.id, coach);
  }
  return Array.from(byId.values());
}

export const COACHES = dedupeCoachesById([
  ...BASE_COACHES.map(applyCoachOverride),
  ...MANUAL_SHOWCASE_COACHES.map(applyCoachOverride)
]).sort((left, right) => left.name.localeCompare(right.name));

const manualChapters = Object.values(CHAPTER_OVERRIDES).filter(
  (chapter) => chapter.slug && !BASE_CHAPTERS.some((entry) => entry.slug === chapter.slug)
) as ChapterRecord[];

const preliminaryChapters = [
  ...BASE_CHAPTERS.map((chapter) => ({ ...chapter, ...(CHAPTER_OVERRIDES[chapter.slug] || {}) })),
  ...manualChapters
] as ChapterRecord[];

const coachCountByChapter = COACHES.reduce<Record<string, number>>((acc, coach) => {
  acc[coach.chapterSlug] = (acc[coach.chapterSlug] || 0) + 1;
  return acc;
}, {});

export const CHAPTERS = preliminaryChapters
  .map((chapter) => ({
    ...chapter,
    coachCount: coachCountByChapter[chapter.slug] ?? chapter.coachCount
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/certification", label: "Certification" },
  { href: "/coaches", label: "Coach" },
  { href: "/chapters", label: "Chapters" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" }
];

export const CERTIFICATION_TRACKS: CertificationTrack[] = [
  {
    level: "CALC",
    title: "Certified Action Learning Coach",
    hours: "32+ hours",
    audience: "New coaches and practitioners",
    summary:
      "Entry-level certification focused on applying Action Learning in live organizational settings.",
    requirements: [
      "Complete the required training hours",
      "Participate in supervised Action Learning practice",
      "Submit application and follow WIAL certification guidance"
    ],
    cta: "Contact a chapter or WIAL Global for upcoming cohorts"
  },
  {
    level: "PALC",
    title: "Professional Action Learning Coach",
    hours: "100+ coaching hours",
    audience: "Experienced CALC coaches",
    summary:
      "For coaches moving from certification into broader professional practice and documented coaching experience.",
    requirements: [
      "Maintain an active certification record",
      "Document Action Learning coaching hours",
      "Submit advancement materials for review"
    ],
    cta: "Review advancement requirements with WIAL Global"
  },
  {
    level: "SALC",
    title: "Senior Action Learning Coach",
    hours: "Advanced mentoring track",
    audience: "Advanced coaches and trainers",
    summary:
      "Designed for senior coaches who mentor others, facilitate advanced cohorts, and strengthen chapter capability.",
    requirements: [
      "Demonstrate senior coaching practice",
      "Mentor and assess trainees",
      "Maintain ongoing education and active chapter contribution"
    ],
    cta: "Discuss senior pathways with WIAL leadership"
  },
  {
    level: "MALC",
    title: "Master Action Learning Coach",
    hours: "Executive / institute-level contribution",
    audience: "Institute leaders and master coaches",
    summary:
      "The highest visible certification tier for practitioners contributing to methodology, chapter growth, and advanced mentor development.",
    requirements: [
      "Sustained contribution to Action Learning practice",
      "Documented leadership in training and chapter support",
      "Executive approval"
    ],
    cta: "Managed directly by WIAL leadership"
  }
];

export const EVENTS: EventRecord[] = [
  {
    id: "evt-1",
    title: "Global Action Learning Open House",
    chapterSlug: "global",
    chapterName: "WIAL Global",
    date: "2026-05-01",
    format: "virtual",
    location: "Online",
    audience: "Prospective coaches and organizational buyers",
    summary: "A lightweight entry point to understand Action Learning, meet chapter leaders, and explore the coach network."
  },
  {
    id: "evt-2",
    title: "Brazil chapter spotlight: leadership teams under pressure",
    chapterSlug: "brazil",
    chapterName: "WIAL Brazil",
    date: "2026-06-03",
    format: "hybrid",
    location: "São Paulo + online",
    audience: "Leadership teams and HR partners",
    summary: "Brazil chapter event used as the primary chapter publishing example in admin."
  },
  {
    id: "evt-3",
    title: "Nigeria chapter foundations session",
    chapterSlug: "nigeria",
    chapterName: "WIAL Nigeria",
    date: "2026-05-14",
    format: "in-person",
    location: "Lagos",
    audience: "Corporate and public-sector leaders",
    summary: "Illustrates how local chapter events should roll up into the global calendar."
  },
  {
    id: "evt-4",
    title: "WIAL USA certification information session",
    chapterSlug: "united-states",
    chapterName: "WIAL USA",
    date: "2026-06-10",
    format: "virtual",
    location: "Online",
    audience: "Prospective CALC participants",
    summary: "Shows chapter-level events with shared global structure and local registration messaging."
  },
  {
    id: "evt-5",
    title: "Malaysia chapter problem-solving roundtable",
    chapterSlug: "malaysia",
    chapterName: "WIAL Malaysia",
    date: "2026-07-08",
    format: "hybrid",
    location: "Kuala Lumpur + online",
    audience: "Regional corporate teams",
    summary: "An example of a chapter using the shared template to advertise local programming globally."
  },
  {
    id: "evt-6",
    title: "Poland chapter coach discovery clinic",
    chapterSlug: "poland",
    chapterName: "WIAL Poland",
    date: "2026-07-24",
    format: "virtual",
    location: "Online",
    audience: "Prospective clients",
    summary: "A chapter-level event centered on understanding certification levels and coach matching."
  }
];

export const INVOICES: InvoiceRecord[] = [
  {
    id: "inv-001",
    chapterSlug: "brazil",
    chapterName: "WIAL Brazil",
    periodLabel: "Q2 2026",
    dueDate: "2026-04-30",
    status: "sent",
    currency: "USD",
    lineItems: [
      { label: "Learners enrolled in eLearning platform", unitAmount: 50, quantity: 8 },
      { label: "Learners fully certified and encoded", unitAmount: 30, quantity: 5 }
    ],
    reminderSentAt: "2026-04-10",
    receiptNumber: null,
    notes: "Stripe-ready chapter invoice. Chapter lead can review and remind before due date."
  },
  {
    id: "inv-002",
    chapterSlug: "united-states",
    chapterName: "WIAL USA",
    periodLabel: "Q2 2026",
    dueDate: "2026-04-28",
    status: "paid",
    currency: "USD",
    lineItems: [
      { label: "Learners enrolled in eLearning platform", unitAmount: 50, quantity: 11 },
      { label: "Learners fully certified and encoded", unitAmount: 30, quantity: 7 }
    ],
    reminderSentAt: "2026-04-05",
    receiptNumber: "RCP-2026-104",
    notes: "Paid invoice used to show chapter/global reporting and receipt history."
  },
  {
    id: "inv-003",
    chapterSlug: "nigeria",
    chapterName: "WIAL Nigeria",
    periodLabel: "Q2 2026",
    dueDate: "2026-04-20",
    status: "overdue",
    currency: "USD",
    lineItems: [
      { label: "Learners enrolled in eLearning platform", unitAmount: 50, quantity: 4 },
      { label: "Learners fully certified and encoded", unitAmount: 30, quantity: 2 }
    ],
    reminderSentAt: "2026-04-18",
    receiptNumber: null,
    notes: "Deliberately overdue to demonstrate reminder and escalation states."
  }
];

export function getChapters() {
  return CHAPTERS;
}

export function getChapterBySlug(slug: string) {
  return CHAPTERS.find((chapter) => chapter.slug === slug) ?? null;
}

export function getCoaches() {
  return COACHES;
}

export function getCoachesByChapter(chapterSlug: string) {
  return COACHES.filter((coach) => coach.chapterSlug === chapterSlug);
}

export function getKnowledgeItems() {
  return KNOWLEDGE_ITEMS;
}

export function getEvents() {
  return EVENTS;
}

export function getEventsByChapter(chapterSlug: string) {
  return EVENTS.filter((event) => event.chapterSlug === chapterSlug || event.chapterSlug === "global");
}

export function getInvoices() {
  return INVOICES;
}

export function getLanguageOptions() {
  return unique(COACHES.flatMap((coach) => coach.languages)).sort();
}

export function getCountryOptions() {
  return unique(COACHES.map((coach) => coach.countryName)).sort();
}

export function getGlobalStats() {
  const recordsWithPhone = COACHES.filter((coach) => coach.phone).length;
  const activeChapters = CHAPTERS.filter((chapter) => chapter.status === "active").length;
  return {
    coachCount: COACHES.length,
    chapterCount: CHAPTERS.length,
    activeChapters,
    importedProfilesWithPhone: recordsWithPhone,
    languageCount: unique(COACHES.flatMap((coach) => coach.languages)).length
  };
}
