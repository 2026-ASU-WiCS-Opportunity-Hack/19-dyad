import { NextResponse } from "next/server";
import { z } from "zod";
import { hasElevenLabsConfig, requestSpeechAudio } from "@/lib/server/elevenlabs";

const bodySchema = z.object({
  language: z.string().trim().min(2).max(32),
  title: z.string().trim().max(240).optional(),
  subtitle: z.string().trim().max(400).optional(),
  paragraphs: z.array(z.string().trim().min(1).max(1800)).min(1).max(8)
});

function buildNarrationText(body: z.infer<typeof bodySchema>) {
  const segments = [body.title, body.subtitle, ...body.paragraphs]
    .filter(Boolean)
    .map((segment) => segment!.replace(/\s+/g, " ").trim());

  return segments.join("\n\n").slice(0, 4500);
}

export async function POST(request: Request) {
  try {
    if (!hasElevenLabsConfig()) {
      return NextResponse.json(
        { error: "Audio narration is not configured for this environment." },
        { status: 503 }
      );
    }

    const body = bodySchema.parse(await request.json());
    const narrationText = buildNarrationText(body);
    const audio = await requestSpeechAudio({
      text: narrationText
    });

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate audio." },
      { status: 400 }
    );
  }
}
