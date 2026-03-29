import { getUser } from "@propelauth/nextjs/server/app-router";
import { getChapters } from "@/lib/data";
import type { DemoSession } from "@/lib/types";
import { canManageChapter as canManageChapterWithDemoSession, getDemoSession } from "@/lib/server/demo-session";

const GLOBAL_ADMIN_ROLE_NAMES = ["global-admin", "global admin", "wial global admin"];
const CHAPTER_LEAD_ROLE_NAMES = ["chapter-lead", "chapter lead", "chapter admin", "chapter owner"];
const ADMIN_ROLE_NAMES = ["admin", "owner"];
const GLOBAL_ORG_NAMES = ["global", "wial-global", "wial"];

type WorkspaceOrg = {
  orgName: string;
  orgMetadata: Record<string, unknown>;
  urlSafeOrgName: string;
  assignedRole: string;
  isAtLeastRole: (role: string) => boolean;
};

type WorkspaceUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  getOrgs: () => WorkspaceOrg[];
};

function normalizeValue(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function hasRoleMatch(org: WorkspaceOrg, roleNames: string[]) {
  return roleNames.some((role) => {
    const normalized = normalizeValue(role);
    return normalizeValue(org.assignedRole) === normalized || org.isAtLeastRole(role);
  });
}

function getDisplayName(user: WorkspaceUser) {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || user.username || user.email || "WIAL workspace user";
}

function getKnownChapterSlugs() {
  return new Set(getChapters().map((chapter) => chapter.slug));
}

function extractChapterSlug(org: WorkspaceOrg) {
  const metadata = org.orgMetadata || {};
  const chapterSlugCandidates = [
    metadata.chapterSlug,
    metadata.chapter_slug,
    metadata.slug,
    metadata.chapter,
    org.urlSafeOrgName,
    normalizeValue(org.orgName).replace(/^wial\s+/, "").replace(/\s+/g, "-")
  ]
    .map((value) => normalizeValue(typeof value === "string" ? value : ""))
    .filter(Boolean);

  const knownChapterSlugs = getKnownChapterSlugs();
  for (const candidate of chapterSlugCandidates) {
    if (knownChapterSlugs.has(candidate)) {
      return candidate;
    }
    const withoutPrefix = candidate.replace(/^wial-/, "");
    if (knownChapterSlugs.has(withoutPrefix)) {
      return withoutPrefix;
    }
  }

  return null;
}

function isGlobalAdminOrg(org: WorkspaceOrg) {
  const metadata = org.orgMetadata || {};
  const scope = normalizeValue(typeof metadata.scope === "string" ? metadata.scope : "");
  const chapterScope = normalizeValue(typeof metadata.chapterScope === "string" ? metadata.chapterScope : "");
  const orgName = normalizeValue(org.urlSafeOrgName);

  if (hasRoleMatch(org, GLOBAL_ADMIN_ROLE_NAMES)) return true;
  if (GLOBAL_ORG_NAMES.includes(orgName) && hasRoleMatch(org, ADMIN_ROLE_NAMES)) return true;
  return (scope === "global" || chapterScope === "global") && hasRoleMatch(org, ADMIN_ROLE_NAMES);
}

function toWorkspaceSession(user: WorkspaceUser): DemoSession | null {
  const orgs = user.getOrgs();
  const displayName = getDisplayName(user);

  const globalOrg = orgs.find((org) => isGlobalAdminOrg(org));
  if (globalOrg) {
    return {
      role: "global-admin",
      chapterSlug: null,
      displayName
    };
  }

  const chapterOrg = orgs.find((org) => {
    const chapterSlug = extractChapterSlug(org);
    if (!chapterSlug) return false;
    return hasRoleMatch(org, CHAPTER_LEAD_ROLE_NAMES) || hasRoleMatch(org, ADMIN_ROLE_NAMES);
  });

  if (chapterOrg) {
    return {
      role: "chapter-lead",
      chapterSlug: extractChapterSlug(chapterOrg),
      displayName
    };
  }

  return null;
}

export function hasPropelAuthConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_AUTH_URL &&
      process.env.PROPELAUTH_API_KEY &&
      process.env.PROPELAUTH_VERIFIER_KEY &&
      process.env.PROPELAUTH_REDIRECT_URI
  );
}

export async function getWorkspaceSession() {
  if (!hasPropelAuthConfig()) {
    return getDemoSession();
  }

  const user = await getUser().catch(() => undefined);
  if (!user) return null;
  return toWorkspaceSession(user);
}

export async function getAuthenticatedWorkspaceUser() {
  if (!hasPropelAuthConfig()) {
    const session = await getDemoSession();
    return {
      user: null,
      session
    };
  }

  const user = await getUser().catch(() => undefined);
  return {
    user: user || null,
    session: user ? toWorkspaceSession(user) : null
  };
}

export function canManageChapter(session: DemoSession | null, chapterSlug: string | null) {
  return canManageChapterWithDemoSession(session, chapterSlug);
}
