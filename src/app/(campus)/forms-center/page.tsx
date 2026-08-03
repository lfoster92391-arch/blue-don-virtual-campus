import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  FileCheck,
  MinusCircle,
} from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getCurrentSchoolYear } from "@/config/school-year";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  agreementStateLabel,
  getAgreementStatusesForUser,
  summarizeAgreementStatuses,
  type AgreementState,
} from "@/services/digital-forms-service";

const STATE_META: Record<
  AgreementState,
  { icon: typeof Circle; className: string }
> = {
  complete: { icon: CheckCircle2, className: "text-[#2E8B57]" },
  outstanding: { icon: Clock, className: "text-[#D4A017]" },
  waiting_parent: { icon: Clock, className: "text-[#D4A017]" },
  needs_link: { icon: MinusCircle, className: "text-muted-foreground" },
  not_available: { icon: MinusCircle, className: "text-muted-foreground" },
  not_required: { icon: MinusCircle, className: "text-muted-foreground" },
};

export default async function FormsCenterPage() {
  const user = await requireCompleteProfile();
  const statuses = await getAgreementStatusesForUser(user);
  const summary = summarizeAgreementStatuses(statuses);
  const schoolYear = getCurrentSchoolYear();

  const actionable = statuses.filter(
    (status) => status.state === "outstanding" || status.state === "waiting_parent",
  );
  const rest = statuses.filter(
    (status) => status.state !== "outstanding" && status.state !== "waiting_parent",
  );

  return (
    <ShellPage
      title="Digital Forms Center"
      description="Madonna High School required agreements, releases, and consents — tracked per school year."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <FileCheck className="size-3.5" aria-hidden="true" />
          {schoolYear}
        </span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Agreements</p>
          <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">
            {summary.total}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Complete</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">{summary.complete}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Action needed</p>
          <p className="text-2xl font-semibold text-[#D4A017]">{summary.outstanding}</p>
        </div>
      </div>

      {actionable.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Needs your attention
          </h2>
          <AgreementList statuses={actionable} />
        </section>
      ) : (
        <div className="mt-8 rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-5">
          <p className="font-medium text-[#2E8B57]">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No agreements require your signature right now for {schoolYear}.
          </p>
        </div>
      )}

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          All agreements
        </h2>
        <AgreementList statuses={rest} />
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Looking for a specific document? The full{" "}
        <Link href="/forms" className="text-[#2F80ED] underline-offset-4 hover:underline">
          forms library
        </Link>{" "}
        lists every published campus form.
      </p>
    </ShellPage>
  );
}

function AgreementList({
  statuses,
}: {
  statuses: Awaited<ReturnType<typeof getAgreementStatusesForUser>>;
}) {
  return (
    <ul className="space-y-3">
      {statuses.map((status) => {
        const meta = STATE_META[status.state];
        const Icon = meta.icon;
        const clickable =
          status.href &&
          (status.state === "outstanding" ||
            status.state === "waiting_parent" ||
            status.state === "complete");

        const body = (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{status.agreement.title}</p>
              <p className="text-sm text-muted-foreground">{status.agreement.purpose}</p>
              <span className={`inline-flex items-center gap-1.5 text-xs ${meta.className}`}>
                <Icon className="size-3.5" />
                {agreementStateLabel(status.state)}
                {status.detail && status.detail !== agreementStateLabel(status.state)
                  ? ` · ${status.detail}`
                  : ""}
              </span>
            </div>
            {clickable ? (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
          </div>
        );

        return (
          <li key={status.agreement.id}>
            {clickable && status.href ? (
              <Link href={status.href} className="block transition-colors hover:opacity-90">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
