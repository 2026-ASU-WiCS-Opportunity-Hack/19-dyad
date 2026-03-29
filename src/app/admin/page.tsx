import Link from "next/link";
import { redirect } from "next/navigation";
import { ChapterContentGenerator } from "@/components/admin/ChapterContentGenerator";
import { ChapterProvisioner } from "@/components/admin/ChapterProvisioner";
import { InvoicePortal } from "@/components/admin/InvoicePortal";
import { getChapters, getCoaches, getInvoices } from "@/lib/data";
import { getAuthenticatedWorkspaceUser } from "@/lib/server/workspace-auth";

export default async function AdminPage() {
  const { user, session } = await getAuthenticatedWorkspaceUser();
  if (!session || (session.role !== "global-admin" && session.role !== "chapter-lead")) {
    redirect(user ? "/access?redirect=/admin&unauthorized=1" : "/access?redirect=/admin");
  }
  const activeSession = session;

  const chapterOptions = getChapters().map((chapter) => ({
    slug: chapter.slug,
    name: chapter.name,
    region: chapter.region,
    primaryLanguage: chapter.primaryLanguage
  }));

  const coachOptions = getCoaches().filter((coach) => {
    if (activeSession.role === "global-admin") return true;
    return coach.chapterSlug === activeSession.chapterSlug;
  });

  const invoices = getInvoices().filter((invoice) => {
    if (activeSession.role === "global-admin") return true;
    return invoice.chapterSlug === activeSession.chapterSlug;
  });

  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Administrative workspace</p>
        <h1 className="section-title">Governance, dues, and chapter publishing</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">
          This workspace supports the network behind the public site: chapter creation, dues
          management, and reviewed chapter publishing for WIAL Global and local chapter leads.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium">
            Signed in as {activeSession.displayName}
          </span>
          <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium capitalize">
            {activeSession.role.replace(/-/g, " ")}
            {activeSession.chapterSlug ? ` — ${activeSession.chapterSlug.replace(/-/g, " ")}` : ""}
          </span>
          {activeSession.chapterSlug ? (
            <Link href={`/chapters/${activeSession.chapterSlug}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium">
              Open assigned chapter
            </Link>
          ) : null}
          <Link href="/access" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium">
            Manage workspace access
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="card-subtle p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Locked globally
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Brand and structure</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Header, footer, navigation, typography, layout rhythm, and design tokens remain governed by WIAL Global.
          </p>
        </div>
        <div className="card-subtle p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Editable locally
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Chapter narrative and events</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Chapters can update local narrative, events, testimonials, client list, and roster visibility without breaking global styling.
          </p>
        </div>
        <div className="card-subtle p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Certification trust
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Verified where possible</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
            Public directory data stays honest. Certification display still depends on verified approval and external source systems.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <ChapterProvisioner />
        <InvoicePortal invoices={invoices} />
        <ChapterContentGenerator chapterOptions={chapterOptions} coachOptions={coachOptions} />
      </div>
    </div>
  );
}
