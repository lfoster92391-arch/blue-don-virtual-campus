import Link from "next/link";
import { redirect } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageAcademy } from "@/config/roles";
import { CERTIFICATION_STATUS_LABELS, LEVEL_TIER_LABELS } from "@/lib/academy-engine/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAllCertificationsForAdmin } from "@/services/academy-engine-service";

export default async function AdminAcademyCertificationsPage() {
  const user = await requireCompleteProfile();

  if (!canManageAcademy(user.role)) {
    redirect("/academies");
  }

  const certifications = await listAllCertificationsForAdmin();

  return (
    <ShellPage
      title="Manage Certifications"
      description="Academy Engine — certifications earned through competency demonstration."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <ul className="mt-8 space-y-3">
        {certifications.map((cert) => (
          <li
            key={cert.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="font-medium">{cert.title}</p>
            <p className="text-sm text-muted-foreground">
              {cert.academy.name} · {CERTIFICATION_STATUS_LABELS[cert.status]}
              {cert.levelTier ? ` · ${LEVEL_TIER_LABELS[cert.levelTier]}` : ""}
            </p>
            {cert.description ? (
              <p className="mt-2 text-sm text-muted-foreground">{cert.description}</p>
            ) : null}
          </li>
        ))}
        {certifications.length === 0 ? (
          <li className="text-sm text-muted-foreground">No certifications yet. Run db:seed to load sample content.</li>
        ) : null}
      </ul>
    </ShellPage>
  );
}
