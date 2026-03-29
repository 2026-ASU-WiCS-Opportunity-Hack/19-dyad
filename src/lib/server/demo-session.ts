import { cookies } from "next/headers";
import type { DemoRole, DemoSession } from "@/lib/types";

export const DEMO_SESSION_COOKIE = "wial-demo-session";

function decodeSession(value: string | undefined): DemoSession | null {
  if (!value) return null;

  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as DemoSession;
    if (!parsed || typeof parsed !== "object") return null;
    if (!["public", "chapter-lead", "global-admin"].includes(parsed.role)) return null;
    return {
      role: parsed.role,
      chapterSlug: parsed.chapterSlug ?? null,
      displayName: parsed.displayName || "WIAL workspace user"
    };
  } catch {
    return null;
  }
}

export function encodeSession(session: DemoSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export async function getDemoSession() {
  const store = await cookies();
  return decodeSession(store.get(DEMO_SESSION_COOKIE)?.value);
}

export function canAccessRole(session: DemoSession | null, allowedRoles: DemoRole[]) {
  return Boolean(session && allowedRoles.includes(session.role));
}

export function canManageChapter(session: DemoSession | null, chapterSlug: string | null) {
  if (!session) return false;
  if (session.role === "global-admin") return true;
  if (session.role !== "chapter-lead") return false;
  if (!chapterSlug) return true;
  return session.chapterSlug === chapterSlug;
}
