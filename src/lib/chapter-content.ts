import type { ChapterDraftInput, ChapterDraftOutput } from "@/lib/types";

const TONE_GUIDANCE: Record<string, string> = {
  English: "Use concise, credible, nonprofit-professional English with calm confidence.",
  Portuguese: "Use Brazilian Portuguese with professional warmth, clear value statements, and practical tone.",
  French: "Use formal but clear French suitable for executive readers.",
  Spanish: "Use clear, direct Spanish appropriate for professional services."
};

function fallbackCoachLine(input: ChapterDraftInput) {
  if (input.selectedCoaches.length === 0) {
    return "the chapter's approved local coach roster";
  }

  return `selected coach records (${input.selectedCoaches.join(", ")})`;
}

export function generateChapterDraftFallback(input: ChapterDraftInput): ChapterDraftOutput {
  const tone = TONE_GUIDANCE[input.language] ?? "Use a professional, low-flash, globally credible tone.";
  const coachList = fallbackCoachLine(input);
  const isPortuguese = input.language === "Portuguese";
  const isFrench = input.language === "French";
  const isSpanish = input.language === "Spanish";

  return {
    heroTitle: isPortuguese
      ? `${input.chapterName}: liderança prática por meio de Action Learning`
      : isFrench
        ? `${input.chapterName} : Action Learning pour les défis réels des organisations`
        : isSpanish
          ? `${input.chapterName}: Action Learning para retos organizacionales reales`
          : `${input.chapterName}: Action Learning for real organizational challenges`,
    heroSubtitle: isPortuguese
      ? `${input.valueProposition}. Presença local, padrão global e foco em resultados aplicáveis.`
      : isFrench
        ? `${input.valueProposition}. Une présence locale, une structure mondiale, et une orientation résolument pratique.`
        : isSpanish
          ? `${input.valueProposition}. Presencia local, estructura global y foco en resultados aplicables.`
          : `${input.valueProposition}. Local relevance, global structure, and a practical route into Action Learning.`,
    overview: isPortuguese
      ? `${input.chapterName} atende líderes e equipes em ${input.region} com uma presença local alinhada aos padrões globais da WIAL. ${input.localContext}`
      : isFrench
        ? `${input.chapterName} accompagne des leaders et des équipes en ${input.region} avec une présence locale alignée sur les standards mondiaux de la WIAL. ${input.localContext}`
        : isSpanish
          ? `${input.chapterName} acompaña a líderes y equipos en ${input.region} con una presencia local alineada con los estándares globales de WIAL. ${input.localContext}`
          : `${input.chapterName} supports leaders and teams in ${input.region} with a local chapter presence that still reflects WIAL’s global standards. ${input.localContext}`,
    eventTeaser: isPortuguese
      ? `Próximo destaque: ${input.eventTitle}. Um ponto de entrada prático para conhecer a metodologia, os coaches e o calendário local.`
      : isFrench
        ? `Prochaine mise en avant : ${input.eventTitle}. Une entrée concrète pour découvrir la méthode, les coaches et le calendrier local.`
        : isSpanish
          ? `Próximo destaque: ${input.eventTitle}. Una entrada práctica para conocer el método, los coaches y el calendario local.`
          : `Upcoming highlight: ${input.eventTitle}. A practical entry point to understand the method, meet coaches, and see the local calendar.`,
    coachSpotlight: isPortuguese
      ? `Destaque de coaches: ${coachList}. A vitrine do capítulo deve permanecer editável localmente, com validação humana antes da publicação.`
      : isFrench
        ? `Mise en avant des coaches : ${coachList}. La vitrine du chapitre doit rester modifiable localement, avec validation humaine avant publication.`
        : isSpanish
          ? `Destacado de coaches: ${coachList}. La vitrina del capítulo debe seguir siendo editable localmente, con validación humana antes de publicar.`
          : `Coach spotlight: ${coachList}. The chapter roster stays editable locally, but every public claim still needs human review before publishing.`,
    testimonialBlock: isPortuguese
      ? `Depoimento do capítulo: “${input.testimonial}”`
      : isFrench
        ? `Témoignage du chapitre : « ${input.testimonial} »`
        : isSpanish
          ? `Testimonio del capítulo: “${input.testimonial}”`
          : `Chapter testimony: “${input.testimonial}”`,
    callToAction: isPortuguese
      ? "Fale com o capítulo, encontre um coach e acompanhe os próximos eventos."
      : isFrench
        ? "Contactez le chapitre, trouvez un coach et suivez les prochains événements."
        : isSpanish
          ? "Contacta al capítulo, encuentra un coach y sigue los próximos eventos."
          : "Contact the chapter, discover a coach, and follow upcoming events.",
    toneNotes: [
      tone,
      "Keep claims factual, specific, and suitable for a professional nonprofit audience.",
      "Prefer local relevance over generic marketing language."
    ],
    warnings: [
      "Human review required before publish.",
      "Do not invent local events, client logos, or verified coach credentials.",
      "Replace placeholder proof points with chapter-approved evidence before going live."
    ],
    reviewRequired: true,
    generatedLanguage: input.language,
    culturalAdaptationNotes: [
      `Adjust references and examples for ${input.region} while preserving WIAL's global tone.`,
      "Avoid literal translation when local business language would sound unnatural."
    ],
    sectionGuidance: [
      "Hero should explain why this chapter matters locally.",
      "Coach spotlight should only reference approved roster data.",
      "CTA should point to chapter contact, directory, and upcoming events."
    ]
  };
}
