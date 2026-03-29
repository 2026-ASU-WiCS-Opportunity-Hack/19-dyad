import showcaseJson from "@/lib/data/showcase-overrides.json";
import type { ChapterRecord, CoachRecord } from "@/lib/types";

type ShowcaseOverrides = {
  coachOverrides?: Record<string, Partial<CoachRecord>>;
  chapterOverrides?: Record<string, Partial<ChapterRecord>>;
  manualShowcaseCoaches?: CoachRecord[];
};

const parsed = (showcaseJson as ShowcaseOverrides) || {};

export const COACH_OVERRIDES: Record<string, Partial<CoachRecord>> = parsed.coachOverrides || {};
export const CHAPTER_OVERRIDES: Record<string, Partial<ChapterRecord>> = parsed.chapterOverrides || {};
export const MANUAL_SHOWCASE_COACHES: CoachRecord[] = parsed.manualShowcaseCoaches || [];
