"use client";

import { type FormEvent, useState } from "react";

export function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const externalKnowledgeUrl = "https://app.aiml.asu.edu/157a4b3bddd94e918f15183716f5e137";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = externalKnowledgeUrl;
  }

  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="mb-5 space-y-2">
        <p className="kicker">Knowledge Engine</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Search WIAL research and webinar content</h2>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
          Ask AI anything about us in your Language and understand US!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-13 rounded-full border border-black/8 bg-[color:var(--background)] px-4 text-sm outline-none"
          placeholder="ask anything about us using AI"
        />
        <button
          type="submit"
          className="inline-flex h-13 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          Run knowledge search
        </button>
      </form>
    </section>
  );
}
