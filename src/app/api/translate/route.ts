import { NextResponse } from "next/server";
import { z } from "zod";
import type { TranslationRequest, TranslationResponse } from "@/lib/types";
import { translateBundleFallback } from "@/lib/translation";
import { requestStructuredOutput } from "@/lib/server/openai";

const bodySchema = z.object({
  sourceLanguage: z.string().trim().min(2),
  targetLanguage: z.string().trim().min(2),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  paragraphs: z.array(z.string().trim()).min(1).max(8),
  badges: z.array(z.string().trim()).max(12).optional()
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    translatedTitle: { type: ["string", "null"] },
    translatedSubtitle: { type: ["string", "null"] },
    translatedParagraphs: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 8
    },
    translatedBadges: {
      type: "array",
      items: { type: "string" },
      minItems: 0,
      maxItems: 12
    },
    reviewNote: { type: "string" },
    usedFallback: { type: "boolean" }
  },
  required: [
    "translatedTitle",
    "translatedSubtitle",
    "translatedParagraphs",
    "translatedBadges",
    "reviewNote",
    "usedFallback"
  ]
} as const;

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json()) as TranslationRequest;
    const fallback = translateBundleFallback(body);

    if (body.sourceLanguage !== body.targetLanguage) {
      try {
        const generated = await requestStructuredOutput<Omit<TranslationResponse, "sourceLanguage" | "targetLanguage">>({
          schemaName: "WialTranslationBundle",
          schema: outputSchema,
          systemPrompt:
            "You translate WIAL public-facing copy for reading and discovery. Preserve all proper nouns, dates, names, and verified facts. Keep tone professional, restrained, and globally credible. Never add claims not present in the source text. This translation is for reading assistance; it must remain suitable for human review before publication.",
          userPrompt: JSON.stringify(body, null, 2),
          temperature: 0.2,
          maxOutputTokens: 1200
        });

        if (generated) {
          return NextResponse.json({
            sourceLanguage: body.sourceLanguage,
            targetLanguage: body.targetLanguage,
            translatedTitle: generated.translatedTitle || undefined,
            translatedSubtitle: generated.translatedSubtitle || undefined,
            translatedParagraphs: generated.translatedParagraphs,
            translatedBadges: generated.translatedBadges,
            reviewNote: generated.reviewNote,
            usedFallback: false
          });
        }
      } catch {
        // fall through to deterministic fallback
      }
    }

    return NextResponse.json(fallback);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid translation request." },
      { status: 400 }
    );
  }
}
