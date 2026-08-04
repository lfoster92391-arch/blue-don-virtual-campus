import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClubTabNav } from "@/components/organizations/club-tab-nav";
import {
  ClubTabPanels,
  isClubTabId,
} from "@/components/organizations/club-tab-panels";
import { PendingJoinRequests } from "@/components/academies/pending-join-requests";
import { MembershipStatusBanner } from "@/components/academies/membership-status-banner";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  getClassWorkspace,
  getClubTheme,
  getClubType,
  getSportWorkspace,
} from "@/config/club-workspaces";
import { ORGANIZATION_CATEGORY_META } from "@/config/madonna-organizations";
import type { OrganizationCategory } from "@/config/madonna-organizations";
import {
  canBrowseAllFocusClubs,
} from "@/config/focus-club-access";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import {
  FOCUS_CLUB_SLUGS,
  isFocusClubSlug,
} from "@/config/focused-clubs";
import { canRequestOrganizationMembership } from "@/config/roles";
import { enforceFocusClubAccessBySlug } from "@/lib/auth/focus-club-guard";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCompleteProfile } from "@/lib/auth/session";
import { withDatabase } from "@/lib/prisma";
import {
  canReviewAcademyMembership,
  getAcademyJoinPipelineStatus,
  listPendingMemberships,
} from "@/services/academy-service";
import {
  buildFocusClubFallbackDetail,
  getOrganizationDiscoveryDetail,
  getOrganizationMatch,
} from "@/services/organization-discovery-service";
import {
  canManageWishlist,
  listWishlistItems,
} from "@/services/wishlist-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  isCampusMediaStorageConfigured,
  listOrganizationMedia,
} from "@/services/media-service";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import {
  canEditBroadcastScriptPrayer,
  canEditBroadcastScriptTemplate,
  canEditBroadcastScriptValues,
  getTodaysBroadcastScript,
} from "@/services/broadcast-script-service";
import { getBlueDonLiveRtmpConfig } from "@/config/broadcast-media";
import {
  canManageClubCalendar,
  listClubCalendarEvents,
} from "@/services/club-calendar-service";
import {
  canAssignClubTasks,
  canCreateMandatoryAllMeeting,
  canRequestInvoiceReceipt,
  canSendClubMessages,
  listActiveClubMembers,
} from "@/lib/command-center-permissions";
import { listTasksForClub } from "@/services/club-student-task-service";
import { listInvoiceReceiptRequestsForClub } from "@/services/student-message-service";
import {
  canManageClubFinances,
  canViewClubFinances,
  getClubFinanceSnapshot,
  listFocusClubFinanceSnapshots,
} from "@/services/club-finance-service";
import {
  canEditClubDocuments,
  listClubDocuments,
} from "@/services/club-document-service";
import {
  canCompleteClubChecklistItems,
  canManageClubProjects,
  listClubChecklists,
  listClubProjects,
} from "@/services/club-project-service";
import {
  canReviewClubInvoice,
  canSubmitClubInvoice,
  isInvoiceStorageConfigured,
  listClubInvoices,
  listPendingInvoicesForFocusClubs,
} from "@/services/club-invoice-service";
import { userHasActiveFocusClubMembership } from "@/services/org-membership-service";

/** Production tabs — audience may watch Overview + Watch only. */
const BROADCAST_CREW_ONLY_TABS = new Set([
  "script",
  "finances",
  "invoices",
  "tasks",
  "messages",
  "members",
  "calendar",
  "documents",
  "projects",
  "checklists",
  "fundraisers",
]);

type OrganizationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function OrganizationPage({
  params,
  searchParams,
}: OrganizationPageProps) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const user = await requireCompleteProfile();
  const identity = await resolveAccessIdentity(user);

  // Broadcasting is audience-open: any signed-in user may view Overview + Watch.
  // IT / Cricut stay membership-scoped. Production tabs are gated below.
  if (slug !== "broadcasting") {
    await enforceFocusClubAccessBySlug({
      userId: user.id,
      role: identity.navRole,
      slug,
      options: {
        forceScoped: identity.isPreviewing,
        membershipUserId: identity.membershipUserId,
        forcedMembershipSlugs: identity.forcedMembershipSlugs,
      },
    });
  }
  let detail = await getOrganizationDiscoveryDetail(slug);

  // Focus clubs (IT / Broadcasting / Cricut) must never 404 — even when
  // DATABASE_URL is wrong and Prisma upsert/load fails.
  if (!detail && isFocusClubSlug(slug)) {
    console.error(
      `[organizations] Missing detail for focus club "${slug}"; forcing catalog fallback`,
    );
    detail = buildFocusClubFallbackDetail(slug);
  }

  if (!detail) {
    notFound();
  }

  const { organization, profile, card, isFallback } = detail;

  // W20 Club Worlds workspace theme (accent) — still used for focused club chrome.
  const workspace = resolveWorkspace(organization.type, organization.slug);

  let activeTab = tabParam && isClubTabId(tabParam) ? tabParam : "overview";
  if (activeTab === "workspace" && !workspace.hasWorkspace) {
    activeTab = "overview";
  }

  const membershipUserId = identity.membershipUserId ?? user.id;
  const forced = identity.forcedMembershipSlugs;
  let isBroadcastCrew = true;
  if (slug === "broadcasting") {
    if (forced) {
      isBroadcastCrew = forced.includes("broadcasting");
    } else if (
      !identity.isPreviewing &&
      canBrowseAllFocusClubs(identity.navRole)
    ) {
      isBroadcastCrew = true;
    } else {
      isBroadcastCrew = await userHasActiveFocusClubMembership(
        membershipUserId,
        "broadcasting",
      );
    }
  }

  // Skip DB-backed panels when serving catalog fallback (broken DATABASE_URL /
  // circuit breaker) so we don't hammer Prisma or throw via the proxy.
  const [match, items, canManage, canManageMedia, organizationMedia, academyMembership, canReview, joinPipeline, financeSnapshot, canManageFinances, canViewFinances, clubCalendarEvents, canManageCalendar, activeLive, dailyAnnouncement, clubInvoices, canSubmitInvoices, canReviewInvoices, dailyScript, canEditScriptValues, canEditScriptPrayer, canEditScriptTemplate, clubDocuments, canEditDocuments, clubProjects, clubChecklists, canManageProjects, canCompleteChecklists] =
    isFallback
      ? [
          null,
          [],
          false,
          false,
          [],
          null,
          false,
          null,
          null,
          false,
          false,
          [],
          false,
          null,
          null,
          [],
          false,
          false,
          null,
          false,
          false,
          false,
          [],
          false,
          [],
          [],
          false,
          false,
        ]
      : await Promise.all([
          getOrganizationMatch(user.id, slug),
          listWishlistItems({ organizationId: organization.id }),
          canManageWishlist(user.id, user.role, {
            organizationId: organization.id,
            academyId: organization.academy?.id,
          }),
          canManageCampusMedia(user.id, user.role),
          slug === "broadcasting"
            ? listOrganizationMedia(organization.id)
            : Promise.resolve([]),
          organization.academy
            ? withDatabase((db) =>
                db.academyMembership.findUnique({
                  where: {
                    userId_academyId: {
                      userId: user.id,
                      academyId: organization.academy!.id,
                    },
                  },
                  select: { status: true },
                }),
              )
            : Promise.resolve(null),
          organization.academy
            ? canReviewAcademyMembership(
                user.id,
                user.role,
                organization.academy.id,
              )
            : Promise.resolve(false),
          organization.academy && user.role === "student"
            ? getAcademyJoinPipelineStatus(user.id, organization.academy.id)
            : Promise.resolve(null),
          getClubFinanceSnapshot(organization.id),
          canManageClubFinances(user.id, user.role, organization.id),
          canViewClubFinances(user.id, user.role, organization.id),
          listClubCalendarEvents({ organizationId: organization.id }),
          canManageClubCalendar(user.id, user.role, organization.id),
          slug === "broadcasting"
            ? getActiveLiveStream()
            : Promise.resolve(null),
          slug === "broadcasting"
            ? getTodaysBroadcastAnnouncement()
            : Promise.resolve(null),
          listClubInvoices({ organizationId: organization.id }),
          canSubmitClubInvoice(user.id, user.role, organization.id),
          canReviewClubInvoice(user.id, user.role, organization.id),
          slug === "broadcasting"
            ? getTodaysBroadcastScript(organization.id)
            : Promise.resolve(null),
          slug === "broadcasting"
            ? canEditBroadcastScriptValues(user.id, user.role)
            : Promise.resolve(false),
          slug === "broadcasting"
            ? canEditBroadcastScriptPrayer(user.id, user.role)
            : Promise.resolve(false),
          slug === "broadcasting"
            ? canEditBroadcastScriptTemplate(user.role)
            : Promise.resolve(false),
          slug === "it-club"
            ? listClubDocuments(organization.id)
            : Promise.resolve([]),
          slug === "it-club"
            ? canEditClubDocuments(user.id, user.role, organization.id)
            : Promise.resolve(false),
          slug === "cricut-club"
            ? listClubProjects(organization.id)
            : Promise.resolve([]),
          slug === "cricut-club"
            ? listClubChecklists(organization.id)
            : Promise.resolve([]),
          slug === "cricut-club"
            ? canManageClubProjects(user.id, user.role, organization.id)
            : Promise.resolve(false),
          slug === "cricut-club"
            ? canCompleteClubChecklistItems(user.id, user.role, organization.id)
            : Promise.resolve(false),
        ]);

  if (slug === "broadcasting" && canManageMedia) {
    isBroadcastCrew = true;
  }

  if (
    slug === "broadcasting" &&
    !isBroadcastCrew &&
    BROADCAST_CREW_ONLY_TABS.has(activeTab)
  ) {
    redirect("/organizations/broadcasting");
  }

  if (activeTab === "finances" && !canViewFinances) {
    redirect(`/organizations/${slug}`);
  }

  let focusClubSnapshots: Awaited<
    ReturnType<typeof listFocusClubFinanceSnapshots>
  > = [];
  let pendingFocusInvoices: Awaited<
    ReturnType<typeof listPendingInvoicesForFocusClubs>
  > = [];

  if (!isFallback && FOCUSED_CLUBS_MODE && slug === "it-club") {
    const focusOrgs =
      (await withDatabase((db) =>
        db.organization.findMany({
          where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
          select: { id: true },
        }),
      )) ?? [];
    const ids = focusOrgs.map((o) => o.id);
    [focusClubSnapshots, pendingFocusInvoices] = await Promise.all([
      listFocusClubFinanceSnapshots(ids),
      listPendingInvoicesForFocusClubs(ids),
    ]);
  }

  const pendingRequests =
    canReview && organization.academy
      ? await listPendingMemberships(organization.academy.id)
      : [];

  const [
    clubMemberOptions,
    clubStudentTasks,
    canAssignTasks,
    canSendMessages,
    canRequestReceipts,
    canCreateMandatory,
    invoiceReceiptRequests,
  ] = isFallback
    ? [[], [], false, false, false, false, []]
    : await Promise.all([
        listActiveClubMembers(organization.id),
        listTasksForClub(organization.id),
        canAssignClubTasks(user.id, user.role, organization.id),
        canSendClubMessages(user.id, user.role, organization.id),
        canRequestInvoiceReceipt(user.id, user.role, organization.id),
        canCreateMandatoryAllMeeting(user.id, user.role, organization.id),
        listInvoiceReceiptRequestsForClub(organization.id),
      ]);

  const categoryMeta =
    organization.category && organization.category in ORGANIZATION_CATEGORY_META
      ? ORGANIZATION_CATEGORY_META[organization.category as OrganizationCategory]
      : null;

  const panelProps = {
    activeTab,
    card,
    profile,
    match,
    members: organization.memberships,
    memberCount: organization._count.memberships,
    academy: organization.academy,
    academyMembershipStatus: academyMembership?.status ?? null,
    defaultSignatureName: user.displayName ?? undefined,
    wishlistItems: items,
    canManageWishlist: canManage,
    organizationId: organization.id,
    organizationSlug: organization.slug,
    organizationType: organization.type,
    showJoinSection:
      !isFallback && canRequestOrganizationMembership(user.role),
    canManageMedia,
    isBroadcastCrew: slug === "broadcasting" ? isBroadcastCrew : true,
    organizationMedia,
    activeLive,
    dailyAnnouncement,
    mediaStorageConfigured:
      slug === "broadcasting" ? isCampusMediaStorageConfigured() : false,
    currentUserId: user.id,
    rtmpConfig: slug === "broadcasting" ? getBlueDonLiveRtmpConfig() : null,
    financeSnapshot,
    canManageFinances,
    clubInvoices,
    canSubmitInvoices,
    canReviewInvoices,
    invoiceStorageConfigured: isInvoiceStorageConfigured(),
    focusClubSnapshots,
    pendingFocusInvoices,
    clubCalendarEvents,
    canManageClubCalendar: canManageCalendar,
    canCreateMandatoryAllMeeting: canCreateMandatory,
    clubStudentTasks,
    canAssignClubTasks: canAssignTasks,
    canSendClubMessages: canSendMessages,
    canRequestInvoiceReceipt: canRequestReceipts,
    invoiceReceiptRequests,
    clubMemberOptions: clubMemberOptions.map((m) => ({
      userId: m.userId,
      displayName: m.displayName,
    })),
    dailyScript,
    canEditScriptValues,
    canEditScriptPrayer,
    canEditScriptTemplate,
    canViewFinances,
    clubDocuments,
    canEditDocuments,
    clubProjects,
    clubChecklists,
    canManageProjects,
    canCompleteChecklists,
  };

  return (
    <ShellPage
      title={organization.name}
      description={card.pitch}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {categoryMeta ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {categoryMeta.emoji} {categoryMeta.label}
            </span>
          ) : null}
          {!FOCUSED_CLUBS_MODE && match ? (
            <span className="rounded-full bg-[#C9A227]/15 px-3 py-1 text-xs font-semibold text-[#0A2342] dark:text-white">
              {match.matchScore}% match
            </span>
          ) : null}
        </div>
      }
    >
      {isFallback ? (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Club page is running in catalog mode — live memberships, finances, and
          media will appear once the campus database connection is restored.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!FOCUSED_CLUBS_MODE ? (
          <>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/find-your-place">Find Your Place</Link>}
            />
            {organization.academy ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link href={`/academies/${organization.academy.slug}`}>
                    Academy page
                  </Link>
                }
              />
            ) : null}
            {organization.slug === "it-club" ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/equipment">Equipment inventory</Link>}
              />
            ) : null}
          </>
        ) : null}
        {FOCUSED_CLUBS_MODE && organization.slug === "it-club" && canViewFinances ? (
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/organizations/it-club?tab=finances">
                Club Finances
              </Link>
            }
          />
        ) : null}
        {FOCUSED_CLUBS_MODE && organization.slug === "broadcasting" ? (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/media">Watch live &amp; archive</Link>}
          />
        ) : null}
        {FOCUSED_CLUBS_MODE &&
        organization.slug === "broadcasting" &&
        isBroadcastCrew ? (
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/organizations/broadcasting?tab=script">
                Daily Rundown
              </Link>
            }
          />
        ) : null}
        {FOCUSED_CLUBS_MODE && organization.slug === "cricut-club" ? (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Cricut Shop</Link>}
          />
        ) : null}
        {FOCUSED_CLUBS_MODE &&
        (organization.slug === "it-club" ||
          organization.slug === "cricut-club" ||
          (organization.slug === "broadcasting" && isBroadcastCrew)) ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/organizations/${organization.slug}?tab=invoices`}>
                Invoices
              </Link>
            }
          />
        ) : null}
      </div>

      {joinPipeline && organization.academy ? (
        <MembershipStatusBanner
          academyName={organization.academy.name}
          pipeline={joinPipeline}
        />
      ) : null}

      {canReview && pendingRequests.length > 0 ? (
        <div className="mt-6">
          <PendingJoinRequests pending={pendingRequests} />
        </div>
      ) : null}

      <div
        className="mt-8 space-y-8"
        style={
          {
            "--club-accent": workspace.accent,
            "--club-soft": workspace.soft,
          } as React.CSSProperties
        }
      >
        <ClubTabNav
          slug={slug}
          activeTab={activeTab}
          accent={workspace.accent}
          focusedMode={FOCUSED_CLUBS_MODE}
          canViewFinances={Boolean(canViewFinances)}
          isBroadcastCrew={slug === "broadcasting" ? isBroadcastCrew : true}
          workspaceTab={
            workspace.hasWorkspace ? { label: workspace.tabLabel } : null
          }
        />
        <ClubTabPanels {...panelProps} />
      </div>
    </ShellPage>
  );
}

const DEFAULT_ACCENT = "#0A2342";
const DEFAULT_SOFT = "#0A234214";

function resolveWorkspace(type: string, slug: string) {
  if (type === "CLASS") {
    const classWorkspace = getClassWorkspace(slug);
    return {
      hasWorkspace: classWorkspace !== null,
      tabLabel: "Class HQ",
      accent: classWorkspace?.accent ?? DEFAULT_ACCENT,
      soft: classWorkspace?.soft ?? DEFAULT_SOFT,
    };
  }

  if (type === "TEAM") {
    const sportWorkspace = getSportWorkspace(slug);
    return {
      hasWorkspace: true,
      tabLabel: "Team HQ",
      accent: sportWorkspace.accent,
      soft: sportWorkspace.soft,
    };
  }

  if (type === "CLUB" || slug === "broadcasting" || slug === "cricut-club" || slug === "it-club") {
    const theme = getClubTheme(getClubType(slug));
    return {
      hasWorkspace: true,
      tabLabel: "Workspace",
      accent: theme.accent,
      soft: theme.soft,
    };
  }

  return {
    hasWorkspace: false,
    tabLabel: "Workspace",
    accent: DEFAULT_ACCENT,
    soft: DEFAULT_SOFT,
  };
}
