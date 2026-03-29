export type CertificationLevel = "CALC" | "PALC" | "SALC" | "MALC" | null;
export type ApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "awaiting_remittance";
export type KnowledgeType = "journal" | "webinar";
export type DemoRole = "public" | "chapter-lead" | "global-admin";
export type PaymentProvider = "stripe" | "paypal" | "manual";
export type ConfidenceLabel = "strong" | "moderate" | "limited";
export type SearchMethod = "openai-embeddings" | "heuristic-fallback";
export type WorkspacePaymentMode = "card" | "paypal" | "manual";
export type ProvisionedChapterStatus = "draft" | "ready" | "reviewed" | "approved" | "published";
export type ChapterDraftStatus = "generated" | "reviewed" | "approved" | "published";

export interface CoachRecord {
  id: string;
  name: string;
  headline: string;
  company: string | null;
  locationText: string;
  countrySlug: string;
  countryName: string;
  citySlug: string | null;
  cityName: string | null;
  chapterSlug: string;
  chapterName: string;
  region: string;
  profileUrl: string | null;
  externalUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  about: string;
  languages: string[];
  languageCodes: string[];
  certificationLevel: CertificationLevel;
  certificationLabel: string;
  approvalStatus: ApprovalStatus;
  sourceType: "csv-import" | "manual";
  searchKeywords: string[];
  searchDocument: string;
  dataCompleteness: number;
  sourceGapFlags: string[];
}

export interface ChapterRecord {
  slug: string;
  name: string;
  region: string;
  primaryLanguage: string;
  coachCount: number;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  focusAreas: string[];
  contactEmail: string;
  featuredEventTitle: string;
  featuredEventDate: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  organizationalClients: string[];
  themeLocked: boolean;
  status: "active" | "template-ready";
}

export interface EventRecord {
  id: string;
  title: string;
  chapterSlug: string;
  chapterName: string;
  date: string;
  format: "virtual" | "in-person" | "hybrid";
  location: string;
  audience: string;
  summary: string;
}

export interface InvoiceLineItem {
  label: string;
  unitAmount: number;
  quantity: number;
}

export interface InvoiceRecord {
  id: string;
  chapterSlug: string;
  chapterName: string;
  periodLabel: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: "USD";
  lineItems: InvoiceLineItem[];
  reminderSentAt: string | null;
  receiptNumber: string | null;
  notes: string;
}

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  title: string;
  summary: string;
  plainLanguageSummary: string;
  keyFindings: string[];
  tags: string[];
  languages: string[];
  sourceUrl: string;
  promoSeed: string;
}

export interface CertificationTrack {
  level: "CALC" | "PALC" | "SALC" | "MALC";
  title: string;
  hours: string;
  audience: string;
  summary: string;
  requirements: string[];
  cta: string;
}

export interface SearchCriteria {
  rawQuery: string;
  normalizedQuery: string;
  queryLanguage: string;
  translatedQuery: string;
  languages: string[];
  countrySlugs: string[];
  certificationLevel: CertificationLevel;
  sectors: string[];
  topics: string[];
  semanticConcepts: string[];
  organizationType: string | null;
  chapterSlug: string | null;
  limit: number;
}

export interface RankedCoachMatch {
  coach: CoachRecord;
  score: number;
  matchedFacets: string[];
  caution: string[];
  semanticOverlap: string[];
  reasoning: string;
}

export interface SearchResponse {
  criteria: SearchCriteria;
  explanation: string;
  matches: RankedCoachMatch[];
  usedFallback: boolean;
  lowConfidence: boolean;
  confidenceLabel: ConfidenceLabel;
  searchMethod?: SearchMethod;
  queryInterpretation?: string;
  aiLabel?: string;
}

export interface MatchResponse extends SearchResponse {
  fallbackChapter: ChapterRecord | null;
  extractedNeed: string;
  parsedCriteriaSummary: string;
  recommendedNextStep: string;
}

export interface ChapterDraftInput {
  chapterSlug?: string;
  chapterName: string;
  region: string;
  language: string;
  valueProposition: string;
  localContext: string;
  selectedCoaches: string[];
  eventTitle: string;
  testimonial: string;
}

export interface ChapterDraftOutput {
  heroTitle: string;
  heroSubtitle: string;
  overview: string;
  eventTeaser: string;
  coachSpotlight: string;
  testimonialBlock: string;
  callToAction: string;
  toneNotes: string[];
  warnings: string[];
  reviewRequired: boolean;
  generatedLanguage?: string;
  culturalAdaptationNotes?: string[];
  sectionGuidance?: string[];
}

export interface StoredChapterDraft {
  chapterSlug: string;
  chapterName: string;
  status: ChapterDraftStatus;
  generatedAt: string;
  data: ChapterDraftOutput;
}

export interface ProvisionedChapterRecord {
  slug: string;
  chapterName: string;
  region: string;
  primaryLanguage: string;
  contactEmail: string;
  pathMode: "subdirectory" | "subdomain";
  templateVersion: string;
  paymentMode: PaymentProvider;
  leadName: string;
  leadEmail: string;
  status: ProvisionedChapterStatus;
  createdAt: string;
  updatedAt: string;
  approvedDraft?: ChapterDraftOutput | null;
  publishedAt?: string | null;
}

export interface KnowledgeResponse {
  query: string;
  answer: string;
  matchedItems: KnowledgeItem[];
  generatedPromo: string;
  lowConfidence: boolean;
}

export interface TranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  title?: string;
  subtitle?: string;
  paragraphs: string[];
  badges?: string[];
}

export interface TranslationResponse {
  sourceLanguage: string;
  targetLanguage: string;
  translatedTitle?: string;
  translatedSubtitle?: string;
  translatedParagraphs: string[];
  translatedBadges: string[];
  reviewNote: string;
  usedFallback: boolean;
}

export interface DemoSession {
  role: DemoRole;
  chapterSlug: string | null;
  displayName: string;
}

export interface PaymentAttempt {
  id: string;
  invoiceId: string;
  chapterSlug: string;
  provider: PaymentProvider | "demo-card";
  status: "initiated" | "authorized_demo" | "paid_demo" | "awaiting_remittance" | "redirected" | "paid" | "failed";
  amountCents: number;
  currency: "USD";
  payerName?: string;
  payerEmail?: string;
  brand?: string;
  last4?: string;
  referenceNote?: string;
  receiptNumber?: string;
  authCode?: string;
  externalSessionId?: string;
  createdAt: string;
}

export interface PaymentIntegrationPayload {
  provider: PaymentProvider;
  invoiceId: string;
  chapterSlug: string;
  amount: number;
  currency: string;
  requiredEnvironment: string[];
  nextImplementationStep: string;
}

export interface PaymentCheckoutResponse {
  mode: "stripe" | "mock" | "integration-ready";
  provider: PaymentProvider;
  url: string | null;
  message: string;
  integrationPayload: PaymentIntegrationPayload;
  attempt?: PaymentAttempt | null;
}


export interface CertificationFitRequest {
  name?: string;
  currentRole?: string;
  country?: string;
  preferredLanguage?: string;
  backgroundText: string;
  targetCertification?: "CALC" | "PALC" | "SALC" | "MALC" | "unsure";
}

export interface CertificationFitResponse {
  recommendedTrack: "CALC" | "PALC" | "SALC" | "MALC";
  fitLabel: "strong" | "possible" | "early-stage";
  summary: string;
  whyItFits: string[];
  readinessGaps: string[];
  nextSteps: string[];
  caution: string;
  aiLabel?: string;
  usedFallback: boolean;
}
