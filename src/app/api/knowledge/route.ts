import { NextResponse } from "next/server";
import { z } from "zod";
import { getKnowledgeItems } from "@/lib/data";
import { answerKnowledgeQuery } from "@/lib/knowledge";
import type { KnowledgeResponse } from "@/lib/types";
import { requestStructuredOutput } from "@/lib/server/openai";

const bodySchema = z.object({
  query: z.string().trim().min(3)
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    generatedPromo: { type: "string" },
    lowConfidence: { type: "boolean" }
  },
  required: ["answer", "generatedPromo", "lowConfidence"]
} as const;

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const fallback = answerKnowledgeQuery(body.query, getKnowledgeItems());

    if (fallback.matchedItems.length > 0) {
      try {
        const generated = await requestStructuredOutput<Pick<KnowledgeResponse, "answer" | "generatedPromo" | "lowConfidence">>({
          schemaName: "WialKnowledgeAnswer",
          schema: outputSchema,
          systemPrompt:
            "You answer WIAL research and webinar queries using only the supplied source summaries. Be evidence-first, plain-language, and cautious. Do not claim findings that are not present in the provided summaries. Keep the answer concise and useful for a prospective client or chapter lead.",
          userPrompt: JSON.stringify(
            {
              query: body.query,
              sources: fallback.matchedItems.map((item) => ({
                title: item.title,
                plainLanguageSummary: item.plainLanguageSummary,
                keyFindings: item.keyFindings,
                tags: item.tags,
                sourceUrl: item.sourceUrl,
                promoSeed: item.promoSeed
              }))
            },
            null,
            2
          ),
          temperature: 0.2,
          maxOutputTokens: 800
        });

        if (generated) {
          return NextResponse.json({
            query: body.query,
            matchedItems: fallback.matchedItems,
            answer: generated.answer,
            generatedPromo: generated.generatedPromo,
            lowConfidence: generated.lowConfidence
          });
        }
      } catch {
        // Fallback below.
      }
    }

    return NextResponse.json(fallback);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid knowledge request."
      },
      { status: 400 }
    );
  }
}
