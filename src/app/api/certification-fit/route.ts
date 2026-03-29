import { NextResponse } from "next/server";
import { z } from "zod";
import { CERTIFICATION_GUIDANCE, getCertificationGuidance } from "@/lib/data/certification-guidance";
import type { CertificationFitRequest, CertificationFitResponse } from "@/lib/types";
import { getConfiguredModelName, requestStructuredOutput } from "@/lib/server/openai";

const bodySchema = z.object({
  name: z.string().trim().max(120).optional(),
  currentRole: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  preferredLanguage: z.string().trim().max(80).optional(),
  backgroundText: z.string().trim().min(80).max(12000),
  targetCertification: z.enum(["CALC", "PALC", "SALC", "MALC", "unsure"]).optional()
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendedTrack: { type: "string", enum: ["CALC", "PALC", "SALC", "MALC"] },
    fitLabel: { type: "string", enum: ["strong", "possible", "early-stage"] },
    summary: { type: "string" },
    whyItFits: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
    readinessGaps: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
    nextSteps: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
    caution: { type: "string" }
  },
  required: [
    "recommendedTrack",
    "fitLabel",
    "summary",
    "whyItFits",
    "readinessGaps",
    "nextSteps",
    "caution"
  ]
} as const;

type TrackScore = {
  level: CertificationFitResponse["recommendedTrack"];
  score: number;
  reasons: string[];
  gaps: string[];
};

function buildProfileText(input: CertificationFitRequest) {
  return [
    input.currentRole || "",
    input.country || "",
    input.preferredLanguage || "",
    input.backgroundText || ""
  ]
    .join("\n")
    .toLowerCase();
}

function countMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function scoreTrack(input: CertificationFitRequest, text: string, level: TrackScore["level"]): TrackScore {
  const hasTarget = input.targetCertification === level;
  const scores: Record<TrackScore["level"], TrackScore> = {
    CALC: { level: "CALC", score: 14, reasons: [], gaps: [] },
    PALC: { level: "PALC", score: 0, reasons: [], gaps: [] },
    SALC: { level: "SALC", score: 0, reasons: [], gaps: [] },
    MALC: { level: "MALC", score: 0, reasons: [], gaps: [] }
  };

  const entryLevelSignals = countMatches(text, [
    /facilitat/,
    /workshop/,
    /reflection/,
    /leadership development/,
    /team/,
    /manager/,
    /learning/
  ]);
  const actionLearningSignals = countMatches(text, [
    /action learning/,
    /\bwial\b/,
    /\bcalc\b/,
    /\bpalc\b/,
    /\bsalc\b/,
    /\bmalc\b/
  ]);
  const coachingDepthSignals = countMatches(text, [
    /\b\d+\+?\s*(years|year)\b/,
    /\b\d+\+?\s*(hours|hour)\b/,
    /coached/,
    /consult/,
    /client/,
    /engagement/,
    /project/
  ]);
  const trainingSignals = countMatches(text, [
    /train/,
    /teach/,
    /faculty/,
    /instructor/,
    /curriculum/,
    /certif/,
    /mentor/
  ]);
  const seniorSignals = countMatches(text, [
    /senior/,
    /director/,
    /head of/,
    /executive/,
    /chief/,
    /board/,
    /regional/
  ]);
  const thoughtLeadershipSignals = countMatches(text, [
    /publish/,
    /publication/,
    /article/,
    /book/,
    /thesis/,
    /conference/,
    /speaker/,
    /presenter/,
    /keynote/
  ]);

  scores.CALC.score += entryLevelSignals * 3 + Math.min(actionLearningSignals, 2) * 4 + (hasTarget ? 5 : 0);
  if (entryLevelSignals > 0) {
    scores.CALC.reasons.push("The profile shows facilitation or leadership-development experience that fits an entry WIAL coaching path.");
  }
  if (actionLearningSignals > 0) {
    scores.CALC.reasons.push("The profile already references Action Learning or WIAL, which supports readiness for the foundational certification tier.");
  } else {
    scores.CALC.gaps.push("The profile does not clearly show prior WIAL coursework or formal Action Learning certification history.");
  }

  scores.PALC.score += coachingDepthSignals * 4 + actionLearningSignals * 5 + Math.min(trainingSignals, 1) * 2 + (hasTarget ? 5 : 0);
  if (coachingDepthSignals >= 2) {
    scores.PALC.reasons.push("The profile suggests meaningful coaching depth rather than only entry-level exposure.");
  }
  if (actionLearningSignals > 0) {
    scores.PALC.reasons.push("The profile indicates prior Action Learning or WIAL experience, which is important for a professional-level recommendation.");
  } else {
    scores.PALC.gaps.push("PALC usually assumes prior WIAL-certified practice or equivalent Action Learning experience.");
  }
  if (trainingSignals === 0) {
    scores.PALC.gaps.push("The profile does not clearly show observed delivery of core WIAL introductory content.");
  }

  scores.SALC.score += trainingSignals * 5 + coachingDepthSignals * 3 + actionLearningSignals * 5 + seniorSignals * 2 + (hasTarget ? 5 : 0);
  if (trainingSignals >= 2) {
    scores.SALC.reasons.push("The profile shows trainer or mentor responsibilities aligned with senior certification expectations.");
  }
  if (seniorSignals > 0) {
    scores.SALC.reasons.push("The profile suggests leadership or chapter-building capability beyond direct coaching alone.");
  }
  if (trainingSignals < 2) {
    scores.SALC.gaps.push("SALC typically needs stronger evidence of teaching WIAL programs and mentoring other coaches.");
  }
  if (actionLearningSignals === 0) {
    scores.SALC.gaps.push("The profile does not clearly establish prior WIAL Action Learning certification practice.");
  }

  scores.MALC.score += thoughtLeadershipSignals * 6 + seniorSignals * 3 + trainingSignals * 3 + actionLearningSignals * 5 + coachingDepthSignals * 2 + (hasTarget ? 5 : 0);
  if (thoughtLeadershipSignals >= 2) {
    scores.MALC.reasons.push("The profile includes publication, presenting, or thought-leadership signals expected at the master level.");
  }
  if (seniorSignals > 0 && trainingSignals > 0) {
    scores.MALC.reasons.push("The profile combines senior leadership with teaching or mentoring signals, which is closer to master-level contribution.");
  }
  if (thoughtLeadershipSignals < 2) {
    scores.MALC.gaps.push("MALC normally requires stronger publication and conference-presenting evidence.");
  }
  if (actionLearningSignals === 0) {
    scores.MALC.gaps.push("The profile does not clearly establish advanced WIAL Action Learning history or SALC-level progression.");
  }

  return scores[level];
}

function fallbackAssessment(input: CertificationFitRequest): CertificationFitResponse {
  const text = buildProfileText(input);
  const askedFor =
    input.targetCertification && input.targetCertification !== "unsure" ? input.targetCertification : null;

  const ranked = (["CALC", "PALC", "SALC", "MALC"] as const)
    .map((level) => scoreTrack(input, text, level))
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  const guidance = getCertificationGuidance(best.level);
  const fitLabel: CertificationFitResponse["fitLabel"] =
    best.level === "CALC"
      ? best.score >= 20
        ? "strong"
        : "possible"
      : best.score >= 28
        ? "strong"
        : best.score >= 18
          ? "possible"
          : "early-stage";

  const whyItFits = [
    ...(best.reasons.length ? best.reasons : [`The profile aligns with ${guidance.title} more closely than the more advanced tracks.`]),
    `WIAL describes ${guidance.title} as suitable for ${guidance.suitableFor[0].toLowerCase()}.`
  ].slice(0, 4);

  const readinessGaps = [
    ...(best.gaps.length ? best.gaps : []),
    ...guidance.cautionSignals
  ].slice(0, 4);

  const nextSteps = [
    `Review the official ${guidance.level} requirements and maintenance expectations before applying.`,
    `Use a chapter or WIAL Global conversation to verify whether your background meets the documented ${guidance.level} prerequisites.`,
    ...(askedFor && askedFor !== best.level
      ? [`Compare your current profile against ${askedFor} as a target goal, but treat ${guidance.level} as the most realistic next fit now.`]
      : [])
  ].slice(0, 4);

  return {
    recommendedTrack: guidance.level,
    fitLabel,
    summary: `${guidance.title} is the most realistic visible fit based on the supplied profile and the stored WIAL certification guidance.`,
    whyItFits,
    readinessGaps,
    nextSteps,
    caution:
      "This fit check is advisory only. Final certification readiness still depends on documented WIAL requirements, human review, and the official certification process.",
    aiLabel: undefined,
    usedFallback: true
  };
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json()) as CertificationFitRequest;
    const fallback = fallbackAssessment(body);

    const generated = await requestStructuredOutput<
      Omit<CertificationFitResponse, "aiLabel" | "usedFallback">
    >({
      schemaName: "WialCertificationFit",
      schema: outputSchema,
      systemPrompt:
        "You help prospective WIAL coaches understand which visible certification path best matches their background. Use the supplied certification guidance as the authoritative source context for the four visible tracks. Do not promise admission, approval, or certification. Recommend the most realistic visible path now, explain why, point out gaps, and suggest next steps. Stay restrained, practical, and evidence-based. If the profile lacks enough proof for an advanced track, recommend the lower but realistic track instead of stretching upward.",
      userPrompt: JSON.stringify(
        {
          applicant: body,
          certificationGuidance: CERTIFICATION_GUIDANCE,
          fallbackAssessment: fallback
        },
        null,
        2
      ),
      temperature: 0.1,
      maxOutputTokens: 1200
    }).catch(() => null);

    if (generated) {
      return NextResponse.json({
        ...generated,
        aiLabel: getConfiguredModelName(),
        usedFallback: false
      } satisfies CertificationFitResponse);
    }

    return NextResponse.json(fallback);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid certification fit request."
      },
      { status: 400 }
    );
  }
}
