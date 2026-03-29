import type { TranslationRequest, TranslationResponse } from "@/lib/types";
import { normalizeText, unique } from "@/lib/utils";

const LANGUAGE_ALIASES: Record<string, string> = {
  english: "English",
  portugues: "Portuguese",
  português: "Portuguese",
  portuguese: "Portuguese",
  francais: "French",
  français: "French",
  french: "French",
  spanish: "Spanish",
  espanol: "Spanish",
  español: "Spanish"
};

const PHRASEBOOK: Record<string, Record<string, string>> = {
  English: {
    "Action Learning": "Action Learning",
    "global chapter": "global chapter",
    "chapter": "chapter",
    "coach": "coach",
    "coaches": "coaches",
    "leadership": "leadership",
    "team": "team",
    "teams": "teams",
    "event": "event",
    "events": "events",
    "contact": "contact",
    "directory": "directory",
    "resources": "resources",
    "global": "global",
    "local": "local",
    "learning": "learning",
    "organization": "organization",
    "organizations": "organizations",
    "operational excellence": "operational excellence",
    "team learning": "team learning",
    "leadership development": "leadership development",
    "upcoming highlight": "upcoming highlight",
    "review required before publish": "review required before publish",
    "find a coach": "find a coach",
    "contact the chapter": "contact the chapter",
    "discover a coach": "discover a coach"
  },
  Portuguese: {
    "Action Learning": "Action Learning",
    "global chapter": "capítulo global",
    "chapter": "capítulo",
    "coach": "coach",
    "coaches": "coaches",
    "leadership": "liderança",
    "team": "equipe",
    "teams": "equipes",
    "event": "evento",
    "events": "eventos",
    "contact": "contato",
    "directory": "diretório",
    "resources": "recursos",
    "global": "global",
    "local": "local",
    "learning": "aprendizagem",
    "organization": "organização",
    "organizations": "organizações",
    "operational excellence": "excelência operacional",
    "team learning": "aprendizagem em equipe",
    "leadership development": "desenvolvimento de liderança",
    "upcoming highlight": "próximo destaque",
    "review required before publish": "revisão necessária antes da publicação",
    "find a coach": "encontre um coach",
    "contact the chapter": "fale com o capítulo",
    "discover a coach": "descubra um coach"
  },
  French: {
    "Action Learning": "Action Learning",
    "global chapter": "chapitre mondial",
    "chapter": "chapitre",
    "coach": "coach",
    "coaches": "coaches",
    "leadership": "leadership",
    "team": "équipe",
    "teams": "équipes",
    "event": "événement",
    "events": "événements",
    "contact": "contact",
    "directory": "annuaire",
    "resources": "ressources",
    "global": "mondial",
    "local": "local",
    "learning": "apprentissage",
    "organization": "organisation",
    "organizations": "organisations",
    "operational excellence": "excellence opérationnelle",
    "team learning": "apprentissage d'équipe",
    "leadership development": "développement du leadership",
    "upcoming highlight": "prochaine mise en avant",
    "review required before publish": "validation requise avant publication",
    "find a coach": "trouver un coach",
    "contact the chapter": "contacter le chapitre",
    "discover a coach": "découvrir un coach"
  },
  Spanish: {
    "Action Learning": "Action Learning",
    "global chapter": "capítulo global",
    "chapter": "capítulo",
    "coach": "coach",
    "coaches": "coaches",
    "leadership": "liderazgo",
    "team": "equipo",
    "teams": "equipos",
    "event": "evento",
    "events": "eventos",
    "contact": "contacto",
    "directory": "directorio",
    "resources": "recursos",
    "global": "global",
    "local": "local",
    "learning": "aprendizaje",
    "organization": "organización",
    "organizations": "organizaciones",
    "operational excellence": "excelencia operativa",
    "team learning": "aprendizaje en equipo",
    "leadership development": "desarrollo de liderazgo",
    "upcoming highlight": "próximo destaque",
    "review required before publish": "revisión necesaria antes de publicar",
    "find a coach": "encontrar un coach",
    "contact the chapter": "contactar al capítulo",
    "discover a coach": "descubrir un coach"
  }
};

const SENTENCE_TRANSLATIONS: Record<string, Record<string, string>> = {
  Portuguese: {
    "One global network. Locally relevant chapter sites.": "Uma rede global. Sites de capítulos localmente relevantes.",
    "Find a coach": "Encontre um coach",
    "Contact the chapter": "Fale com o capítulo",
    "Review required before publish.": "Revisão necessária antes da publicação.",
    "Loading chapter platform": "Carregando a plataforma de capítulos",
    "Read this chapter in another language": "Leia este capítulo em outro idioma"
  },
  French: {
    "One global network. Locally relevant chapter sites.": "Un réseau mondial. Des sites de chapitres adaptés au contexte local.",
    "Find a coach": "Trouver un coach",
    "Contact the chapter": "Contacter le chapitre",
    "Review required before publish.": "Validation requise avant publication.",
    "Loading chapter platform": "Chargement de la plateforme des chapitres",
    "Read this chapter in another language": "Lire ce chapitre dans une autre langue"
  },
  Spanish: {
    "One global network. Locally relevant chapter sites.": "Una red global. Sitios de capítulos relevantes a nivel local.",
    "Find a coach": "Encontrar un coach",
    "Contact the chapter": "Contactar al capítulo",
    "Review required before publish.": "Revisión necesaria antes de publicar.",
    "Loading chapter platform": "Cargando la plataforma de capítulos",
    "Read this chapter in another language": "Lee este capítulo en otro idioma"
  }
};

function canonicalLanguage(value: string) {
  const normalized = normalizeText(value || "");
  return LANGUAGE_ALIASES[normalized] || (value || "English");
}

function buildReverseDictionary(sourceLanguage: string) {
  const languageBook = PHRASEBOOK[sourceLanguage] || {};
  const reverse: Record<string, string> = {};
  for (const [english, translated] of Object.entries(languageBook)) {
    reverse[translated] = english;
  }
  return reverse;
}

function replaceDictionary(text: string, dictionary: Record<string, string>) {
  const ordered = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  let result = text;

  for (const [source, target] of ordered) {
    const pattern = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    result = result.replace(pattern, (match) => {
      if (match.toUpperCase() === match) return target.toUpperCase();
      if (match[0] === match[0]?.toUpperCase()) {
        return target[0]?.toUpperCase() + target.slice(1);
      }
      return target;
    });
  }

  return result;
}

function translateText(text: string, sourceLanguage: string, targetLanguage: string) {
  if (!text) return text;
  if (sourceLanguage === targetLanguage) return text;

  const sentenceHit = SENTENCE_TRANSLATIONS[targetLanguage]?.[text];
  if (sourceLanguage === "English" && sentenceHit) return sentenceHit;

  let working = text;

  if (sourceLanguage !== "English") {
    working = replaceDictionary(working, buildReverseDictionary(sourceLanguage));
  }

  if (targetLanguage !== "English") {
    working = replaceDictionary(working, PHRASEBOOK[targetLanguage] || {});
  }

  return working;
}

export function translateBundleFallback(request: TranslationRequest): TranslationResponse {
  const sourceLanguage = canonicalLanguage(request.sourceLanguage || "English");
  const targetLanguage = canonicalLanguage(request.targetLanguage || "English");

  return {
    sourceLanguage,
    targetLanguage,
    translatedTitle: request.title ? translateText(request.title, sourceLanguage, targetLanguage) : undefined,
    translatedSubtitle: request.subtitle
      ? translateText(request.subtitle, sourceLanguage, targetLanguage)
      : undefined,
    translatedParagraphs: request.paragraphs.map((paragraph) =>
      translateText(paragraph, sourceLanguage, targetLanguage)
    ),
    translatedBadges: unique((request.badges || []).map((badge) => translateText(badge, sourceLanguage, targetLanguage))),
    reviewNote:
      targetLanguage === sourceLanguage
        ? "Showing the original chapter copy."
        : "AI-assisted reading translation is provided for discovery. Public publishing still requires chapter review.",
    usedFallback: true
  };
}
