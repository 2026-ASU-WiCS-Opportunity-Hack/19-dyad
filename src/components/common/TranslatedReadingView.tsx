"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Languages, Loader2, Pause, Play, Volume2 } from "lucide-react";
import type { TranslationResponse } from "@/lib/types";

const LANGUAGE_OPTIONS = ["English", "Portuguese", "French", "Spanish"] as const;
const CACHE_KEY = "wial-translation-cache-v1";

type Bundle = {
  sourceLanguage: string;
  title?: string;
  subtitle?: string;
  paragraphs: string[];
  badges?: string[];
};

function hashBundle(bundle: Bundle, targetLanguage: string) {
  return JSON.stringify({ bundle, targetLanguage });
}

function readCache(hash: string): TranslationResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, TranslationResponse>;
    return parsed[hash] || null;
  } catch {
    return null;
  }
}

function writeCache(hash: string, value: TranslationResponse) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, TranslationResponse>) : {};
    parsed[hash] = value;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore browser storage failures
  }
}

export function TranslatedReadingView({
  label,
  bundle,
  compact = false,
  audioEnabled = false
}: {
  label: string;
  bundle: Bundle;
  compact?: boolean;
  audioEnabled?: boolean;
}) {
  const [targetLanguage, setTargetLanguage] = useState(bundle.sourceLanguage);
  const [translation, setTranslation] = useState<TranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const displayed = useMemo(() => {
    if (!translation || targetLanguage === bundle.sourceLanguage) {
      return {
        title: bundle.title,
        subtitle: bundle.subtitle,
        paragraphs: bundle.paragraphs,
        badges: bundle.badges || [],
        note: "Showing the original chapter copy."
      };
    }

    return {
      title: translation.translatedTitle || bundle.title,
      subtitle: translation.translatedSubtitle || bundle.subtitle,
      paragraphs: translation.translatedParagraphs,
      badges: translation.translatedBadges,
      note: translation.reviewNote
    };
  }, [bundle, targetLanguage, translation]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [displayed, targetLanguage]);

  async function handleTranslate(nextLanguage: string) {
    setTargetLanguage(nextLanguage);
    setError(null);

    if (nextLanguage === bundle.sourceLanguage) {
      setTranslation(null);
      return;
    }

    const cacheHash = hashBundle(bundle, nextLanguage);
    const cached = readCache(cacheHash);
    if (cached) {
      setTranslation(cached);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bundle, targetLanguage: nextLanguage })
      });
      const payload = (await response.json()) as TranslationResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to translate content.");
      setTranslation(payload);
      writeCache(cacheHash, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to translate content.");
      setTranslation(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleListen() {
    setAudioError(null);

    if (audioRef.current && audioUrl) {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    setAudioLoading(true);
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: targetLanguage,
          title: displayed.title,
          subtitle: displayed.subtitle,
          paragraphs: displayed.paragraphs
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to generate audio.");
      }

      const audioBlob = await response.blob();
      const nextAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return nextAudioUrl;
      });
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "Unable to generate audio.");
    } finally {
      setAudioLoading(false);
    }
  }

  return (
    <section className={`surface rounded-[2rem] ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="kicker">AI translation</p>
          <h2 className={`${compact ? "text-xl" : "text-2xl md:text-3xl"} font-semibold tracking-tight`}>{label}</h2>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Read the same content in English, Portuguese, French, or Spanish. Names, dates, and
            verified facts are preserved while the surrounding copy is translated for discovery.
          </p>
        </div>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Reading language</span>
          <div className="flex items-center gap-2 rounded-full border border-black/8 bg-[color:var(--background)] px-4 py-2">
            <Languages size={15} className="text-[color:var(--muted-foreground)]" />
            <select
              value={targetLanguage}
              onChange={(event) => handleTranslate(event.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            {loading ? <Loader2 size={14} className="animate-spin text-[color:var(--muted-foreground)]" /> : null}
          </div>
        </label>
      </div>

      <div className="mt-5 space-y-4 rounded-[1.5rem] border border-black/8 bg-white p-5">
        {audioEnabled ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
            <div className="flex items-center gap-2 text-[color:var(--muted-foreground)]">
              <Volume2 size={16} />
              <span>Optional audio narration</span>
            </div>
            <button
              type="button"
              onClick={handleListen}
              disabled={audioLoading}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {audioLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
              {audioLoading ? "Preparing audio" : isPlaying ? "Pause audio" : audioUrl ? "Play audio" : "Listen"}
            </button>
          </div>
        ) : null}
        {displayed.title ? <h3 className="text-2xl font-semibold tracking-tight">{displayed.title}</h3> : null}
        {displayed.subtitle ? (
          <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">{displayed.subtitle}</p>
        ) : null}
        {displayed.badges?.length ? (
          <div className="flex flex-wrap gap-2">
            {displayed.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-black/10 bg-[color:var(--background)] px-3 py-1 text-xs">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <div className="space-y-3">
          {displayed.paragraphs.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`} className="text-sm leading-7 text-[color:var(--muted-foreground)]">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm text-[color:var(--muted-foreground)]">
          <span className="font-medium text-[color:var(--foreground)]">AI-assisted reading translation:</span> {displayed.note}
        </div>
        {audioUrl ? (
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            preload="none"
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : null}
        {error ? (
          <div className="rounded-[1.25rem] border border-[color:var(--danger)]/20 bg-[color:var(--danger)]/10 p-4 text-sm text-[color:var(--danger)]">
            {error}
          </div>
        ) : null}
        {audioError ? (
          <div className="rounded-[1.25rem] border border-[color:var(--danger)]/20 bg-[color:var(--danger)]/10 p-4 text-sm text-[color:var(--danger)]">
            {audioError}
          </div>
        ) : null}
      </div>
    </section>
  );
}
