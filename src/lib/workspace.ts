import type { ChapterDraftOutput, ChapterDraftStatus, ProvisionedChapterRecord } from "@/lib/types";

const PROVISIONED_KEY = "wial-provisioned-chapters";
const DRAFT_KEY = "wial-approved-chapter-drafts";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getProvisionedChapters() {
  return readJson<ProvisionedChapterRecord[]>(PROVISIONED_KEY, []);
}

export function getProvisionedChapter(slug: string) {
  return getProvisionedChapters().find((entry) => entry.slug === slug) || null;
}

export function saveProvisionedChapter(record: ProvisionedChapterRecord) {
  const current = getProvisionedChapters();
  const next = [...current.filter((entry) => entry.slug !== record.slug), record].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  writeJson(PROVISIONED_KEY, next);
  return record;
}

export function updateProvisionedChapter(slug: string, partial: Partial<ProvisionedChapterRecord>) {
  const existing = getProvisionedChapter(slug);
  if (!existing) return null;
  const next: ProvisionedChapterRecord = {
    ...existing,
    ...partial,
    updatedAt: new Date().toISOString()
  };
  saveProvisionedChapter(next);
  return next;
}

export function getApprovedChapterDrafts() {
  return readJson<Record<string, { status: ChapterDraftStatus; data: ChapterDraftOutput; generatedAt: string }>>(DRAFT_KEY, {});
}

export function getApprovedChapterDraft(slug: string) {
  return getApprovedChapterDrafts()[slug] || null;
}

export function saveChapterDraft(slug: string, data: ChapterDraftOutput, status: ChapterDraftStatus) {
  const current = getApprovedChapterDrafts();
  current[slug] = {
    status,
    data,
    generatedAt: new Date().toISOString()
  };
  writeJson(DRAFT_KEY, current);
  return current[slug];
}

export function publishProvisionedChapter(slug: string, data: ChapterDraftOutput) {
  return updateProvisionedChapter(slug, {
    approvedDraft: data,
    status: "published",
    publishedAt: new Date().toISOString()
  });
}
