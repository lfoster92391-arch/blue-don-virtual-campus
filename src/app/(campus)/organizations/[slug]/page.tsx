import Link from "next/link";
import { notFound } from "next/navigation";

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
import { canRequestOrganizationMembership } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  canReviewAcademyMembership,
  getAcademyJoinPipelineStatus,
  listPendingMemberships,
} from "@/services/academy-service";
import {
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
import { getBlueDonLiveRtmpConfig } from "@/config/broadcast-media";
import {
  canManageClubCalendar,
  listClubCalendarEvents,
} from "@/services/club-calendar-service";
import {
  canManageClubFinances,
  getClubFinanceSnapshot,
  listFocusClubFinanceSnapshots,
} from "@/services/club-finance-service";
import {
  canReviewClubInvoice,
  canSubmitClubInvoice,
  isInvoiceStorageConfigured,
  listClubInvoices,
  listPendingInvoicesForFocusClubs,
} from "@/services/club-invoice-service";
import { FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";

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
  const detail = await getOrganizationDiscoveryDetail(slug);

  if (!detail) {
    notFound();
  }

  const { organization, profile, card } = detail;

  // W20 · Club Worlds — resolve this org's workspace personality (accent +
  // whether the immersive workspace tab is available for its type).
  const workspace = resolveWorkspace(organization.type, organization.slug);

  let activeTab = tabParam && isClubTabId(tabParam) ? tabParam : "overview";
  if (activeTab === "workspace" && !workspace.hasWorkspace) {
    activeTab = "overview";
  }

  const [match, items, canManage, canManageMedia, organizationMedia, academyMembership, canReview, joinPipeline, financeSnapshot, canManageFinances, clubCalendarEvents, canManageCalendar, activeLive, dailyAnnouncement, clubInvoices, canSubmitInvoices, canReviewInvoices] =
    await Promise.all([
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
        ? prisma.academyMembership.findUnique({
            where: {
              userId_academyId: {
                userId: user.id,
                academyId: organization.academy.id,
              },
            },
            select: { status: true },
          })
        : Promise.resolve(null),
      organization.academy
        ? canReviewAcademyMembership(user.id, user.role, organization.academy.id)
        : Promise.resolve(false),
      organization.academy && user.role === "student"
        ? getAcademyJoinPipelineStatus(user.id, organization.academy.id)
        : Promise.resolve(null),
      getClubFinanceSnapshot(organization.id),
      canManageClubFinances(user.id, user.role, organization.id),
      listClubCalendarEvents({ organizationId: organization.id }),
      canManageClubCalendar(user.id, user.role, organization.id),
      slug === "broadcasting" ? getActiveLiveStream() : Promise.resolve(null),
      slug === "broadcasting"
        ? getTodaysBroadcastAnnouncement()
        : Promise.resolve(null),
      listClubInvoices({ organizationId: organization.id }),
      canSubmitClubInvoice(user.id, user.role, organization.id),
      canReviewClubInvoice(user.id, user.role, organization.id),
    ]);

  let focusClubSnapshots: Awaited<
    ReturnType<typeof listFocusClubFinanceSnapshots>
  > = [];
  let pendingFocusInvoices: Awaited<
    ReturnType<typeof listPendingInvoicesForFocusClubs>
  > = [];

  if (FOCUSED_CLUBS_MODE && slug === "it-club") {
    const focusOrgs = await prisma.organization.findMany({
      where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      select: { id: true },
    });
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
    showJoinSection: canRequestOrganizationMembership(user.role),
    canManageMedia,
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
          {match ? (
            <span className="rounded-full bg-[#C9A227]/15 px-3 py-1 text-xs font-semibold text-[#0A2342] dark:text-white">
              {match.matchScore}% match
            </span>
          ) : null}
        </div>
      }
    >
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
        {FOCUSED_CLUBS_MODE && organization.slug === "it-club" ? (
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
        {FOCUSED_CLUBS_MODE && organization.slug === "cricut-club" ? (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Cricut Shop</Link>}
          />
        ) : null}
        {FOCUSED_CLUBS_MODE &&
        (organization.slug === "broadcasting" ||
          organization.slug === "cricut-club" ||
          organization.slug === "it-club") ? (
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
