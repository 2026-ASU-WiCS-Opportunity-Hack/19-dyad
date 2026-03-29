import { DemoAccessForm } from "@/components/auth/DemoAccessForm";
import { WorkspaceAccessForm } from "@/components/auth/WorkspaceAccessForm";
import { getChapters } from "@/lib/data";
import { getAuthenticatedWorkspaceUser, hasPropelAuthConfig } from "@/lib/server/workspace-auth";

export default async function AccessPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string; unauthorized?: string }>;
}) {
  const { redirect: redirectTo, unauthorized } = await searchParams;
  const chapterOptions = getChapters().map((chapter) => ({ slug: chapter.slug, name: chapter.name }));
  const authEnabled = hasPropelAuthConfig();
  const { session } = authEnabled ? await getAuthenticatedWorkspaceUser() : { session: null };

  return (
    <div className="container-shell py-16">
      {authEnabled ? (
        <WorkspaceAccessForm
          redirectTo={redirectTo || "/admin"}
          chapterOptions={chapterOptions}
          initialSession={session}
          unauthorized={unauthorized === "1"}
        />
      ) : (
        <DemoAccessForm redirectTo={redirectTo || "/admin"} chapterOptions={chapterOptions} />
      )}
    </div>
  );
}
