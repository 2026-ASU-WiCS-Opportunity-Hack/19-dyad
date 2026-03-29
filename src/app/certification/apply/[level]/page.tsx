import { notFound } from "next/navigation";
import { CertificationApplicationForm } from "@/components/certification/CertificationApplicationForm";
import { getCertificationApplication } from "@/lib/certification-applications";

export default async function CertificationApplicationPage({
  params
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const definition = getCertificationApplication(level);

  if (!definition) {
    notFound();
  }

  return <CertificationApplicationForm definition={definition} />;
}
