import { MembershipReviewActions } from "@/components/academies/membership-review-actions";
import type { PendingMembershipView } from "@/services/academy-service";

type PendingJoinRequestsProps = {
  pending: PendingMembershipView[];
  title?: string;
  description?: string;
  showAcademyName?: boolean;
};

export function PendingJoinRequests({
  pending,
  title = "Pending join requests",
  description = "Students who signed the club commitment and are waiting for your decision.",
  showAcademyName = false,
}: PendingJoinRequestsProps) {
  if (pending.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/5 p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="mt-4 space-y-3">
        {pending.map((membership) => (
          <li
            key={membership.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">
                {membership.user.displayName ?? membership.user.email}
              </p>
              {showAcademyName ? (
                <p className="text-sm text-muted-foreground">
                  Requested {membership.academy.name}
                </p>
              ) : null}
              {membership.commitmentSignature ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Commitment signed as {membership.commitmentSignature}
                  {membership.commitmentSignedAt
                    ? ` · ${new Date(membership.commitmentSignedAt).toLocaleString()}`
                    : ""}
                </p>
              ) : (
                <p className="mt-1 text-xs text-destructive">Club commitment not on file</p>
              )}
              {membership.parentApproved === null ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-[#D4A017]/10 px-2 py-0.5 text-xs font-medium text-[#D4A017]">
                  Waiting on parent approval
                </span>
              ) : membership.parentApproved === true ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
                  Parent approved
                </span>
              ) : membership.parentApproved === false ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Parent declined
                </span>
              ) : null}
            </div>
            <MembershipReviewActions membershipId={membership.id} />
          </li>
        ))}
      </ul>
    </section>
  );
}
