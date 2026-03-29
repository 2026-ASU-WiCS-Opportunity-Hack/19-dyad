import { notFound } from "next/navigation";
import { LiveChapterPage } from "@/components/chapters/LiveChapterPage";
import { getChapterBySlug, getCoachesByChapter, getEventsByChapter } from "@/lib/data";
import { hasElevenLabsConfig } from "@/lib/server/elevenlabs";

export default async function ChapterPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) notFound();

  const coaches = getCoachesByChapter(slug).slice(0, 6);
  const events = getEventsByChapter(slug);
  const audioEnabled = hasElevenLabsConfig();

  return <LiveChapterPage chapter={chapter} coaches={coaches} events={events} audioEnabled={audioEnabled} />;
}
