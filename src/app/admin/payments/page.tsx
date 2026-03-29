import { redirect } from "next/navigation";
import { PaymentPortal } from "@/components/admin/PaymentPortal";
import { getInvoices } from "@/lib/data";
import { getAuthenticatedWorkspaceUser } from "@/lib/server/workspace-auth";

export default async function AdminPaymentsPage({
  searchParams
}: {
  searchParams: Promise<{
    invoice?: string;
    status?: string;
    message?: string;
    provider?: string;
  }>;
}) {
  const { user, session } = await getAuthenticatedWorkspaceUser();
  if (!session || (session.role !== "global-admin" && session.role !== "chapter-lead")) {
    redirect(user ? "/access?redirect=/admin/payments&unauthorized=1" : "/access?redirect=/admin/payments");
  }
  const activeSession = session;

  const params = await searchParams;
  const invoices = getInvoices().filter((entry) => {
    if (activeSession.role === "global-admin") return true;
    return entry.chapterSlug === activeSession.chapterSlug;
  });
  const invoice = invoices.find((entry) => entry.id === params.invoice) ?? invoices[0];

  if (!invoice) {
    redirect("/admin");
  }

  return (
    <div className="container-shell py-16">
      <PaymentPortal
        invoice={invoice}
        initialStatus={params.status ?? null}
        initialMessage={params.message ?? null}
        initialProvider={params.provider ?? null}
      />
    </div>
  );
}
