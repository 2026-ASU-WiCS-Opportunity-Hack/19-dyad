import type { KnowledgeItem, KnowledgeResponse } from "@/lib/types";
import { normalizeText } from "@/lib/utils";

function rankKnowledge(query: string, items: KnowledgeItem[]) {
  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 2);

  return items
    .map((item) => {
      const haystack = normalizeText(
        [item.title, item.summary, item.plainLanguageSummary, item.tags.join(" "), item.keyFindings.join(" ")].join(" ")
      );
      let score = 0;

      for (const token of queryTokens) {
        if (haystack.includes(token)) score += 3;
      }

      for (const tag of item.tags) {
        if (normalizedQuery.includes(normalizeText(tag))) score += 8;
      }

      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score);
}

export function answerKnowledgeQuery(query: string, items: KnowledgeItem[]): KnowledgeResponse {
  const ranked = rankKnowledge(query, items);
  const matchedItems = ranked.slice(0, 3).map((result) => result.item);

  if (matchedItems.length === 0) {
    return {
      query,
      answer:
        "No strong research match was found in the seeded WIAL knowledge library. For a live deployment, this should fall back to broader library browsing or WIAL Global contact.",
      matchedItems: [],
      generatedPromo: "No promo draft available because the query did not match seeded research or webinar items.",
      lowConfidence: true
    };
  }

  const primary = matchedItems[0];
  return {
    query,
    answer: `${primary.plainLanguageSummary} Related evidence in the seeded library also highlights ${matchedItems
      .flatMap((item) => item.keyFindings)
      .slice(0, 2)
      .join(" ")}`,
    matchedItems,
    generatedPromo: primary.promoSeed,
    lowConfidence: false
  };
}
