"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function DemoAccessForm({
  redirectTo,
  chapterOptions
}: {
  redirectTo: string;
  chapterOptions: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<"chapter-lead" | "global-admin">("global-admin");
  const [displayName, setDisplayName] = useState("WIAL workspace user");
  const [chapterSlug, setChapterSlug] = useState(chapterOptions[0]?.slug ?? "brazil");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleDescription = useMemo(() => {
    if (role === "global-admin") {
      return "Access chapter creation, invoice management, and global template governance.";
    }
    return "Manage one chapter, review local content, and use the dues portal for that chapter.";
  }, [role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/demo-auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, chapterSlug, displayName })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to start workspace session.");

      router.push(redirectTo || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start workspace session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-[2rem] p-6 md:p-8">
      <div className="space-y-2">
        <p className="kicker">Workspace access</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Workspace sign-in</h1>
        <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted-foreground)]">
          The public site stays open, while chapter publishing, dues management, and governance
          tools require a workspace session with an assigned role.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { value: "global-admin", label: "Global Admin" },
              { value: "chapter-lead", label: "Chapter Lead" }
            ].map((option) => {
              const active = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value as typeof role)}
                  className={`rounded-[1.4rem] border p-4 text-left transition ${
                    active
                      ? "border-black/18 bg-white shadow-sm"
                      : "border-black/8 bg-[color:var(--background)]"
                  }`}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                </button>
              );
            })}
          </div>

          {role === "chapter-lead" ? (
            <label className="space-y-2 text-sm">
              <span className="font-medium">Assigned chapter</span>
              <select
                value={chapterSlug}
                onChange={(event) => setChapterSlug(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4"
              >
                {chapterOptions.map((chapter) => (
                  <option key={chapter.slug} value={chapter.slug}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Starting session…" : "Continue to workspace"}
          </button>

          {error ? (
            <div className="rounded-[1.25rem] border border-[color:var(--danger)]/25 bg-[color:var(--danger)]/10 p-4 text-sm text-[color:var(--danger)]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Selected role</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {role === "global-admin" ? "Global admin workspace" : "Chapter lead workspace"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            {roleDescription}
          </p>
          <div className="mt-5 rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Administrative AI actions stay server-side. Public search and chapter browsing stay open,
            while publishing and payment actions require a workspace session.
          </div>
        </div>
      </div>
    </form>
  );
}
