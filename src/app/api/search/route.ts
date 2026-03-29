import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoaches } from "@/lib/data";
import { searchCoachesWithAI } from "@/lib/server/ai-search";

const bodySchema = z.object({
  query: z.string().trim().default(""),
  chapterSlug: z.string().trim().min(1).optional(),
  limit: z.number().int().positive().max(20).optional()
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const results = await searchCoachesWithAI(body.query, getCoaches(), {
      chapterSlug: body.chapterSlug ?? null,
      limit: body.limit ?? 8
    });

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid search request."
      },
      { status: 400 }
    );
  }
}
