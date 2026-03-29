"use client";

import { type FormEvent, useMemo, useState } from "react";

const POST_LOGIN_REDIRECT_COOKIE = "wial-post-login-redirect";

function writeRedirectCookie(path: string) {
  const safePath = path.startsWith("/") ? path : "/admin";
  document.cookie = `${POST_LOGIN_REDIRECT_COOKIE}=${encodeURIComponent(safePath)}; Path=/; SameSite=Lax`;
}

export function WorkspaceAccessForm({
  redirectTo,
  chapterOptions,
  initialSession,
  unauthorized
}: {
  redirectTo: string;
  chapterOptions: { slug: string; name: string }[];
  initialSession: { role: string; chapterSlug: string | null; displayName: string } | null;
  unauthorized: boolean;
}) {
  const isLoggedIn = Boolean(initialSession);
  const [role, setRole] = useState<"chapter-lead" | "global-admin">("global-admin");
  const [chapterSlug, setChapterSlug] = useState(chapterOptions[0]?.slug ?? "brazil");
  const [error, setError] = useState<string | null>(null);

  const roleDescription = useMemo(() => {
    if (initialSession?.role === "global-admin") {
      return "Your authenticated account currently has WIAL Global workspace access.";
    }
    if (initialSession?.role === "chapter-lead") {
      return `Your authenticated account currently has chapter workspace access${initialSession.chapterSlug ? ` for ${initialSession.chapterSlug.replace(/-/g, " ")}` : ""}.`;
    }
    if (role === "global-admin") {
      return "Access chapter creation, invoice management, and global template governance.";
    }
    return "Manage one chapter, review local content, and use the dues portal for that chapter.";
  }, [initialSession, role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      writeRedirectCookie(redirectTo || "/admin");
      if (isLoggedIn) {
        window.location.href = redirectTo || "/admin";
        return;
      }
      window.location.href = "/api/auth/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start workspace sign-in.");
    }
  }

  async function handleLogout() {
    setError(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      window.location.href = `/access?redirect=${encodeURIComponent(redirectTo || "/admin")}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out.");
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
            <span className="font-medium">Workspace identity</span>
            <input
              value={initialSession?.displayName || ""}
              readOnly
              placeholder="Your PropelAuth login will determine workspace access"
              className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4 text-[color:var(--muted-foreground)]"
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

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white"
            >
              Continue to workspace
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-black"
              >
                Sign out
              </button>
            ) : null}
          </div>

          {unauthorized ? (
            <div className="rounded-[1.25rem] border border-[color:var(--warning)]/25 bg-[color:var(--warning)]/10 p-4 text-sm text-[color:var(--warning)]">
              Your authenticated account does not currently map to a WIAL workspace role. Ask WIAL Global to assign the appropriate organization role before continuing.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.25rem] border border-[color:var(--danger)]/25 bg-[color:var(--danger)]/10 p-4 text-sm text-[color:var(--danger)]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Selected role</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {initialSession?.role === "global-admin"
              ? "Global admin workspace"
              : initialSession?.role === "chapter-lead"
                ? "Chapter lead workspace"
                : role === "global-admin"
                  ? "Global admin workspace"
                  : "Chapter lead workspace"}
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
