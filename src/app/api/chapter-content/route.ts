import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoaches } from "@/lib/data";
import { generateChapterDraftFallback } from "@/lib/chapter-content";
import type { ChapterDraftInput, ChapterDraftOutput } from "@/lib/types";
import { requestStructuredOutput } from "@/lib/server/openai";
import { canManageChapter, getWorkspaceSession } from "@/lib/server/workspace-auth";

const bodySchema = z.object({
  chapterSlug: z.string().trim().optional(),
  chapterName: z.string().trim().min(2),
  region: z.string().trim().min(2),
  language: z.string().trim().min(2),
  valueProposition: z.string().trim().min(10),
  localContext: z.string().trim().min(10),
  selectedCoaches: z.array(z.string().trim()).max(3).default([]),
  eventTitle: z.string().trim().min(3),
  testimonial: z.string().trim().min(10)
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    heroTitle: { type: "string" },
    heroSubtitle: { type: "string" },
    overview: { type: "string" },
    eventTeaser: { type: "string" },
    coachSpotlight: { type: "string" },
    testimonialBlock: { type: "string" },
    callToAction: { type: "string" },
    toneNotes: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 6
    },
    warnings: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 6
    },
    reviewRequired: { type: "boolean" },
    generatedLanguage: { type: ["string", "null"] },
    culturalAdaptationNotes: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
      maxItems: 6
    },
    sectionGuidance: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
      maxItems: 6
    }
  },
  required: [
    "heroTitle",
    "heroSubtitle",
    "overview",
    "eventTeaser",
    "coachSpotlight",
    "testimonialBlock",
    "callToAction",
    "toneNotes",
    "warnings",
    "reviewRequired",
    "generatedLanguage",
    "culturalAdaptationNotes",
    "sectionGuidance"
  ]
} as const;

function buildPrompt(input: ChapterDraftInput) {
  const selectedCoachRows = getCoaches()
    .filter((coach) => input.selectedCoaches.includes(coach.id))
    .slice(0, 3)
    .map((coach) => ({
      id: coach.id,
      name: coach.name,
      location: coach.locationText,
      languages: coach.languages,
      chapter: coach.chapterName,
      profileGaps: coach.sourceGapFlags
    }));

  return {
    systemPrompt:
      "You are drafting WIAL chapter homepage copy. Stay professional, calm, premium, and globally credible. This is not flashy startup copy. Adapt tone to the requested region and language without inventing facts. Preserve WIAL brand consistency, but make the content feel native to the region instead of merely translated. Never invent certifications, client logos, chapter maturity, local case studies, event details, or coach specializations that are not supplied.",
    userPrompt: JSON.stringify(
      {
        request: "Generate culturally adapted chapter homepage draft for WIAL.",
        constraints: [
          "Output must remain suitable for a chapter website, not a sales brochure.",
          "Do not use exclamation-heavy or hype language.",
          "Generated content must require human review before publish.",
          "Warnings should call out where human verification is still needed.",
          "Cultural adaptation should reflect tone, examples, and phrasing, not fabricated facts."
        ],
        input,
        selectedCoachRows
      },
      null,
      2
    )
  };
}

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();
    if (!session || !canManageChapter(session, null)) {
      return NextResponse.json(
        { error: "Workspace access is required for chapter content generation." },
        { status: 401 }
      );
    }

    const body = bodySchema.parse(await request.json());
    if (!canManageChapter(session, body.chapterSlug ?? null)) {
      return NextResponse.json(
        { error: "Your workspace role can only generate content for the assigned chapter." },
        { status: 403 }
      );
    }

    const fallback = generateChapterDraftFallback(body);

    try {
      const prompt = buildPrompt(body);
      const generated = await requestStructuredOutput<ChapterDraftOutput>({
        schemaName: "WialChapterDraft",
        schema: outputSchema,
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
        temperature: 0.4,
        maxOutputTokens: 1400
      });

      if (generated) {
        return NextResponse.json({
          ...generated,
          generatedLanguage: generated.generatedLanguage || body.language,
          warnings: Array.from(new Set([...(generated.warnings || []), ...fallback.warnings])),
          culturalAdaptationNotes: Array.from(
            new Set([...(generated.culturalAdaptationNotes || []), ...(fallback.culturalAdaptationNotes || [])])
          ),
          sectionGuidance: Array.from(
            new Set([...(generated.sectionGuidance || []), ...(fallback.sectionGuidance || [])])
          ),
          reviewRequired: true
        });
      }
    } catch {
      // Safe fallback below.
    }

    return NextResponse.json(fallback);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid chapter generation request."
      },
      { status: 400 }
    );
  }
}
