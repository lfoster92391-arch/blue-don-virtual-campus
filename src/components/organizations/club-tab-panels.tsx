import { ClubDocumentsPanel } from "@/components/organizations/club-documents-panel";
import {
  ClubChecklistsPanel,
  ClubProjectsPanel,
} from "@/components/organizations/club-projects-panel";
import { CricutOverviewExtras } from "@/components/cricut/cricut-overview-extras";
import type { ClubDocumentView } from "@/lib/club-workspace-types";
import type {
  ClubChecklistView,
  ClubProjectView,
} from "@/lib/club-workspace-types";
import type { ClubTabId } from "@/components/organizations/club-tab-nav";
import { ClubCalendarPanel } from "@/components/organizations/club-calendar-panel";
import { ClubTasksPanel } from "@/components/organizations/club-tasks-panel";
import { ComposeStudentMessageForm } from "@/components/organizations/compose-student-message-form";
import { ClubFinancesPanel } from "@/components/organizations/club-finances-panel";
import { ClubInvoicesPanel } from "@/components/organizations/club-invoices-panel";
import type {
  ClubStudentTaskView,
  StudentMessageView,
} from "@/lib/command-center";
import { ClubProgressPanel } from "@/components/organizations/club-workspace/club-progress-panel";
import {
  AthleticsWorkspacePanel,
  ClassWorkspacePanel,
  ClubWorkspacePanel,
} from "@/components/organizations/club-workspace/workspace-panels";
import { WishlistSection } from "@/components/wishlist/wishlist-section";
import { DailyAnnouncement } from "@/components/media/daily-announcement";
import { DailyRundownPanel } from "@/components/media/daily-rundown-panel";
import { BroadcastCountdown } from "@/components/media/broadcast-countdown";
import {
  AnnouncementSubmissionReviewList,
  AnnouncementSubmitForm,
  BookingRequestForm,
  BookingReviewList,
  CrewCreditRoll,
  EquipmentChecklist,
  JoinApplicationReviewList,
  JoinClubPortal,
} from "@/components/media/broadcast-suite-panels";
import { BroadcastPrimaryActions } from "@/components/media/broadcast-primary-actions";
import { HowWeGoLiveCard } from "@/components/media/how-we-go-live";
import { LiveBroadcastPanel } from "@/components/media/live-broadcast-panel";
import {
  SportsAudienceSections,
  SportsDeskSections,
} from "@/components/sports/sports-sections";
import type {
  SportsDeskData,
  SportsHubData,
  SportsPlayerStatView,
} from "@/services/sports-highlights-service";
import { VideoLibrary } from "@/components/media/video-library";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { Button } from "@/components/ui/button";
import {
  isWithinAirPreviewWindow,
  type BlueDonLiveRtmpPublicConfig,
} from "@/config/broadcast-media";
import type { BroadcastDailyScriptView } from "@/config/broadcast-script";
import type {
  BroadcastAnnouncementSubmissionView,
  BroadcastBookingView,
  BroadcastCrewCreditView,
  BroadcastEquipmentView,
  BroadcastJoinApplicationView,
  BroadcastScheduleView,
} from "@/services/broadcast-production-service";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import { getClubTheme, getClubType } from "@/config/club-workspaces";
import type { OrganizationProfile } from "@/config/organization-profiles";
import { getOrganizationHref } from "@/config/madonna-organizations";
import { getClubProgress } from "@/services/club-xp-service";
import type { ClubCalendarEventView } from "@/lib/club-calendar";
import { formatCents, type ClubFinanceSnapshot } from "@/lib/club-finance";
import type { ClubInvoiceView } from "@/services/club-invoice-service";
import type { AcademyMembershipStatus } from "@/generated/prisma/client";
import type {
  OrganizationDiscoveryCard,
  OrganizationMatch,
} from "@/lib/organization-discovery";
import type { WishlistItemView } from "@/services/wishlist-service";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type { CampusMediaItemView } from "@/services/media-service";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Calendar,
  Camera,
  FlaskConical,
  GraduationCap,
  Megaphone,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";

import { AcademyJoinButton } from "@/components/academies/academy-join-button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type MemberPreview = {
  user: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

export type ClubTabPanelsProps = {
  activeTab: ClubTabId;
  card: OrganizationDiscoveryCard;
  profile: OrganizationProfile;
  match: OrganizationMatch | null;
  members: MemberPreview[];
  memberCount: number;
  academy?: { id: string; slug: string; name: string } | null;
  academyMembershipStatus?: AcademyMembershipStatus | null;
  defaultSignatureName?: string;
  wishlistItems: WishlistItemView[];
  canManageWishlist: boolean;
  organizationId: string;
  organizationSlug: string;
  organizationType: string;
  showJoinSection?: boolean;
  canManageMedia?: boolean;
  /** Phone / laptop camera Go Live — roster members, not faculty preview alone. */
  canGoLive?: boolean;
  /** Broadcasting club members / faculty with production access. */
  isBroadcastCrew?: boolean;
  organizationMedia?: CampusMediaItemView[];
  activeLive?: CampusMediaItemView | null;
  dailyAnnouncement?: BroadcastAnnouncementView | null;
  mediaStorageConfigured?: boolean;
  currentUserId?: string;
  rtmpConfig?: BlueDonLiveRtmpPublicConfig | null;
  financeSnapshot?: ClubFinanceSnapshot | null;
  canManageFinances?: boolean;
  clubInvoices?: ClubInvoiceView[];
  canSubmitInvoices?: boolean;
  canReviewInvoices?: boolean;
  invoiceStorageConfigured?: boolean;
  /** IT Club finances hub: other focus-club snapshots + pending invoices. */
  focusClubSnapshots?: ClubFinanceSnapshot[];
  pendingFocusInvoices?: ClubInvoiceView[];
  clubCalendarEvents?: ClubCalendarEventView[];
  canManageClubCalendar?: boolean;
  canCreateMandatoryAllMeeting?: boolean;
  clubStudentTasks?: ClubStudentTaskView[];
  canAssignClubTasks?: boolean;
  canSendClubMessages?: boolean;
  canRequestInvoiceReceipt?: boolean;
  invoiceReceiptRequests?: StudentMessageView[];
  clubMemberOptions?: { userId: string; displayName: string }[];
  dailyScript?: BroadcastDailyScriptView | null;
  canEditScriptValues?: boolean;
  canEditScriptPrayer?: boolean;
  canEditScriptTemplate?: boolean;
  canViewFinances?: boolean;
  clubDocuments?: ClubDocumentView[];
  canEditDocuments?: boolean;
  clubProjects?: ClubProjectView[];
  clubChecklists?: ClubChecklistView[];
  canManageProjects?: boolean;
  canCompleteChecklists?: boolean;
  broadcastSchedule?: BroadcastScheduleView | null;
  broadcastBookings?: BroadcastBookingView[];
  announcementSubmissions?: BroadcastAnnouncementSubmissionView[];
  crewCredits?: BroadcastCrewCreditView[];
  broadcastEquipment?: BroadcastEquipmentView[];
  joinApplications?: BroadcastJoinApplicationView[];
  sportsHub?: SportsHubData | null;
  sportsDesk?: SportsDeskData | null;
  sportsStats?: SportsPlayerStatView[];
  activeSportSlug?: string | null;
  sportsStorageConfigured?: boolean;
};

function memberLabel(member: MemberPreview): string {
  return (
    member.user.displayName ??
    [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") ??
    "Student"
  );
}

function ClubHero({
  card,
  profile,
  match,
}: {
  card: OrganizationDiscoveryCard;
  profile: OrganizationProfile;
  match: OrganizationMatch | null;
}) {
  const showMatch = Boolean(match) && !FOCUSED_CLUBS_MODE;

  return (
    <section className="rounded-xl border border-border bg-gradient-to-br from-[#0A2342]/5 to-[#2F80ED]/5 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="text-5xl" aria-hidden="true">
            {card.icon}
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-[#0A2342] dark:text-white">
              {card.name}
            </h2>
            <p className="mt-1 text-base font-medium text-[#2F80ED]">{card.tagline}</p>
            <p className="mt-3 max-w-2xl text-muted-foreground">{card.pitch}</p>
            {profile.currentProject ? (
              <p className="mt-3 rounded-lg bg-[#2F80ED]/10 px-3 py-2 text-sm text-[#0A2342] dark:text-white">
                <span className="font-medium">Current project:</span> {profile.currentProject}
              </p>
            ) : null}
          </div>
        </div>

        {showMatch && match ? (
          <div className="shrink-0 rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-5 text-center lg:min-w-[10rem]">
            <p className="flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#C9A227]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI Match
            </p>
            <p className="mt-2 text-4xl font-bold text-[#0A2342] dark:text-white">
              {match.matchScore}%
            </p>
            {match.matchReasons.length > 0 ? (
              <ul className="mt-4 space-y-1 text-left text-sm text-muted-foreground">
                {match.matchReasons.map((reason) => (
                  <li key={reason}>✓ {reason}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function JoinSection({
  card,
  profile,
  academy,
  academyMembershipStatus,
  defaultSignatureName,
}: Pick<
  ClubTabPanelsProps,
  | "card"
  | "profile"
  | "academy"
  | "academyMembershipStatus"
  | "defaultSignatureName"
>) {
  const workspaceHref = getOrganizationHref({
    slug: card.slug,
    academy: academy ? { slug: academy.slug } : null,
  });

  return (
    <section
      id="join"
      className="rounded-xl border border-[#0A2342]/15 bg-[#0A2342] p-6 text-white"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Join {card.name}</h2>
          <p className="text-sm text-white/80">
            {profile.invitationRequired
              ? "Membership is by invitation. Speak with the advisor to learn more."
              : "Sign the club membership commitment and request to join."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {profile.invitationRequired ? (
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              Invitation required
            </span>
          ) : academy ? (
            <AcademyJoinButton
              academyId={academy.id}
              academyName={academy.name}
              slug={academy.slug}
              membershipStatus={academyMembershipStatus ?? null}
              defaultSignatureName={defaultSignatureName}
            />
          ) : workspaceHref !== `/organizations/${card.slug}` ? (
            <Button
              size="sm"
              variant="secondary"
              nativeButton={false}
              render={
                <Link href={workspaceHref}>
                  Open workspace
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
          ) : (
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              Request flow coming soon
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function OverviewPanel(props: ClubTabPanelsProps) {
  const { card, profile, showJoinSection = true } = props;
  const showClubXp =
    props.organizationType === "CLUB" && !FOCUSED_CLUBS_MODE;
  const clubProgress = showClubXp ? getClubProgress(props.organizationSlug) : null;
  const isBroadcasting = props.organizationSlug === "broadcasting";
  const isCricut = props.organizationSlug === "cricut-club";
  const isBroadcastCrew = props.isBroadcastCrew !== false;

  return (
    <div className="space-y-8">
      <ClubHero card={card} profile={profile} match={props.match} />

      {isCricut ? <CricutOverviewExtras /> : null}

      {isBroadcasting ? (
        <DashboardCard
          title="Next live"
          description="Countdown to the next Blue Don Live."
          icon={<Megaphone className="size-5" />}
          status={
            props.broadcastSchedule?.nextAirAt
              ? { label: "Scheduled", variant: "info" }
              : { label: "TBD", variant: "info" }
          }
        >
          <BroadcastCountdown
            schedule={
              props.broadcastSchedule ?? {
                id: null,
                organizationId: null,
                nextAirAt: null,
                title: null,
                notes: null,
                updatedByName: null,
              }
            }
            canSet={Boolean(props.canManageMedia)}
            compact
          />
        </DashboardCard>
      ) : null}

      {isBroadcasting ? (
        <DashboardCard
          title={isBroadcastCrew ? "Crew workspace" : "Watch Broadcasting"}
          description={
            isBroadcastCrew
              ? "Record, Go Live, Daily Rundown, and the Control Room."
              : "Anyone on campus can watch live and browse past broadcasts."
          }
          icon={<Megaphone className="size-5" />}
          status={{
            label: isBroadcastCrew ? "Crew" : "Audience",
            variant: "info",
          }}
        >
          {isBroadcastCrew ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Record a clip or Go Live from this phone or laptop. Daily
                Rundown holds the morning script. The whole school watches on{" "}
                <Link href="/watch" className="text-[#2F80ED] underline">
                  Watch Broadcasting LIVE
                </Link>
                .
              </p>
              <BroadcastPrimaryActions
                canGoLive={Boolean(props.canGoLive)}
                canRecord={Boolean(props.canManageMedia)}
              />
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full sm:w-auto"
                nativeButton={false}
                render={
                  <Link href="/organizations/broadcasting?tab=media">
                    Open Control Room
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Open Watch to see Blue Don Live when Broadcasting is on air, plus
                the archive of past broadcasts. Book coverage, submit
                announcements, or apply to join from the tabs above.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href="/watch">
                      Watch Broadcasting LIVE
                      <ArrowRight className="size-3.5" />
                    </Link>
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href="/organizations/broadcasting?tab=media">
                      Watch on this page
                    </Link>
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href="/organizations/broadcasting?tab=join">
                      Join the club
                    </Link>
                  }
                />
              </div>
            </div>
          )}
        </DashboardCard>
      ) : null}

      {isBroadcasting ? (
        <DashboardCard
          title="Daily Announcement"
          description="Today’s message from Broadcasting."
          icon={<Megaphone className="size-5" />}
        >
          <DailyAnnouncement
            announcement={props.dailyAnnouncement ?? null}
            canManage={Boolean(props.canManageMedia)}
            compact
          />
        </DashboardCard>
      ) : null}

      {isBroadcasting && isBroadcastCrew ? (
        <DashboardCard
          title="Daily Rundown"
          description="Shared show script for this morning’s broadcast."
          icon={<Megaphone className="size-5" />}
        >
          <p className="text-sm text-muted-foreground">
            Fill hosts, discussion, events, and lunch — then copy or print the
            full script for the crew.
          </p>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/organizations/broadcasting?tab=script`}>
                Open show script
              </Link>
            }
          />
        </DashboardCard>
      ) : null}

      {clubProgress ? (
        <ClubProgressPanel
          clubName={card.name}
          progress={clubProgress}
          theme={getClubTheme(getClubType(props.organizationSlug))}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Advisor" icon={<GraduationCap className="size-5" />}>
          <p className="text-sm text-muted-foreground">
            {profile.advisor ?? "Advisor information coming soon."}
          </p>
        </DashboardCard>

        <DashboardCard title="Meeting times" icon={<Calendar className="size-5" />}>
          <p className="text-sm text-muted-foreground">
            {profile.meetingSchedule ?? "See club announcements for meeting times."}
          </p>
        </DashboardCard>

        <DashboardCard title="Skills you'll learn">
          <div className="flex flex-wrap gap-2">
            {card.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </DashboardCard>

        {!FOCUSED_CLUBS_MODE ? (
          <DashboardCard title="XP opportunities">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {card.xpOpportunities.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </DashboardCard>
        ) : null}

        {profile.careerConnections && profile.careerConnections.length > 0 ? (
          <DashboardCard title="Career connections" className="lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              {profile.careerConnections.map((career) => (
                <span
                  key={career}
                  className="rounded-full border border-[#2F80ED]/20 bg-[#2F80ED]/5 px-3 py-1 text-sm"
                >
                  {career}
                </span>
              ))}
            </div>
          </DashboardCard>
        ) : null}
      </div>

      {showJoinSection ? <JoinSection {...props} /> : null}
    </div>
  );
}

function AnnouncementsPanel({ card }: Pick<ClubTabPanelsProps, "card">) {
  const posts = [
    {
      id: "1",
      title: `${card.name} meeting this week`,
      body: "Check the calendar for time and room. New members welcome — bring a friend.",
      time: "2 days ago",
    },
    {
      id: "2",
      title: "Upcoming campus event",
      body: `${card.name} will have a presence at the next school-wide event. Sign up with your advisor.`,
      time: "Last week",
    },
    {
      id: "3",
      title: "Volunteer opportunities",
      body: "Help with club activities and earn service hours. See the Service Center for details.",
      time: "Last week",
    },
  ];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <DashboardCard
          key={post.id}
          title={post.title}
          icon={<Megaphone className="size-5" />}
          status={{ label: post.time, variant: "default" }}
        >
          <p className="text-sm text-muted-foreground">{post.body}</p>
        </DashboardCard>
      ))}
    </div>
  );
}

function ProjectsPanel(props: ClubTabPanelsProps) {
  if (
    FOCUSED_CLUBS_MODE &&
    props.organizationSlug === "cricut-club" &&
    props.clubProjects
  ) {
    return (
      <ClubProjectsPanel
        organizationId={props.organizationId}
        organizationSlug={props.organizationSlug}
        projects={props.clubProjects}
        canManage={props.canManageProjects ?? false}
      />
    );
  }

  const projects = props.profile.projects ?? [];

  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Project details will appear here as officers publish them.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {projects.map((project) => (
        <li key={project.name}>
          <DashboardCard title={project.name}>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </DashboardCard>
        </li>
      ))}
    </ul>
  );
}

function DocumentsPanel(props: ClubTabPanelsProps) {
  return (
    <ClubDocumentsPanel
      organizationId={props.organizationId}
      organizationSlug={props.organizationSlug}
      documents={props.clubDocuments ?? []}
      canEdit={props.canEditDocuments ?? false}
    />
  );
}

function ChecklistsPanel(props: ClubTabPanelsProps) {
  return (
    <ClubChecklistsPanel
      organizationId={props.organizationId}
      organizationSlug={props.organizationSlug}
      checklists={props.clubChecklists ?? []}
      projects={props.clubProjects ?? []}
      canManage={props.canManageProjects ?? false}
      canComplete={props.canCompleteChecklists ?? false}
    />
  );
}

function CertificationsPanel({ profile }: Pick<ClubTabPanelsProps, "profile">) {
  const certs = profile.certifications ?? [];

  if (certs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Certification pathways will be listed here when available for this organization.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {certs.map((cert) => (
        <li
          key={cert}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <Award className="size-5 shrink-0 text-[#C9A227]" aria-hidden="true" />
          <div>
            <p className="font-medium text-[#0A2342] dark:text-white">{cert}</p>
            <p className="text-sm text-muted-foreground">
              Prep through academy labs and club milestones.
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LabsPanel({ profile }: Pick<ClubTabPanelsProps, "profile">) {
  const labs = profile.labs ?? [];

  if (labs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Explore campus labs and simulators connected to this club.
        </p>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/labs">Browse labs</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/simulators">Browse simulators</Link>} />
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {labs.map((lab) => (
        <li key={lab.label}>
          {lab.href ? (
            <Link
              href={lab.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40"
            >
              <FlaskConical className="size-5 text-[#2F80ED]" aria-hidden="true" />
              <span className="font-medium">{lab.label}</span>
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <FlaskConical className="size-5 text-[#2F80ED]" aria-hidden="true" />
              <span className="font-medium">{lab.label}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function CalendarPanel(props: ClubTabPanelsProps) {
  return (
    <ClubCalendarPanel
      clubName={props.card.name}
      organizationId={props.organizationId}
      organizationSlug={props.organizationSlug}
      events={props.clubCalendarEvents ?? []}
      canManage={props.canManageClubCalendar ?? false}
      canCreateMandatoryAll={props.canCreateMandatoryAllMeeting ?? false}
    />
  );
}

function ClubTasksTabPanel(props: ClubTabPanelsProps) {
  return (
    <ClubTasksPanel
      organizationId={props.organizationId}
      organizationSlug={props.organizationSlug}
      clubName={props.card.name}
      members={props.clubMemberOptions ?? []}
      tasks={props.clubStudentTasks ?? []}
      canAssign={props.canAssignClubTasks ?? false}
    />
  );
}

function ClubMessagesTabPanel(props: ClubTabPanelsProps) {
  const canSend = props.canSendClubMessages ?? false;
  const canRequest = props.canRequestInvoiceReceipt ?? false;
  const requests = props.invoiceReceiptRequests ?? [];

  if (!canSend && !canRequest) {
    return (
      <DashboardCard title="Messages" description="Advisor requests">
        <p className="text-sm text-muted-foreground">
          Club officers (President, Vice President, Secretary) and admins can
          message members from this tab. Students see messages on their Command
          Center at Home.
        </p>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      {canSend ? (
        <ComposeStudentMessageForm
          organizationId={props.organizationId}
          organizationSlug={props.organizationSlug}
          clubName={props.card.name}
          members={props.clubMemberOptions ?? []}
          mode="advisor"
        />
      ) : null}
      {canRequest ? (
        <ComposeStudentMessageForm
          organizationId={props.organizationId}
          organizationSlug={props.organizationSlug}
          clubName={props.card.name}
          members={props.clubMemberOptions ?? []}
          mode="invoice_receipt"
        />
      ) : null}
      {canRequest ? (
        <DashboardCard
          title="Pending invoice / receipt requests"
          description="Status of documentation requests you and other officers sent."
        >
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open invoice or receipt requests yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <p className="font-medium">{req.title}</p>
                  <p className="text-muted-foreground">
                    Status: {req.status.replaceAll("_", " ").toLowerCase()} ·{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(req.createdAt))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      ) : null}
    </div>
  );
}

function FinancesPanel(props: ClubTabPanelsProps) {
  if (props.canViewFinances === false) {
    return (
      <DashboardCard
        title="Club finances"
        description="Restricted to club officers"
      >
        <p className="text-sm text-muted-foreground">
          Financial records are available to the President, Vice President,
          Secretary, and campus administrators.
        </p>
      </DashboardCard>
    );
  }

  if (!props.financeSnapshot) {
    return (
      <DashboardCard title="Club finances" description="Ledger and fundraisers">
        <p className="text-sm text-muted-foreground">
          Finances are unavailable until the database is connected.
        </p>
      </DashboardCard>
    );
  }

  const isItHub = props.organizationSlug === "it-club";
  const otherClubs = (props.focusClubSnapshots ?? []).filter(
    (s) => s.organizationId !== props.organizationId,
  );
  const pending = props.pendingFocusInvoices ?? [];

  return (
    <div className="space-y-8">
      {isItHub ? (
        <DashboardCard
          title="All clubs — balances"
          description="All-time totals across IT Club, Broadcasting, and Cricut."
        >
          <ul className="grid gap-3 sm:grid-cols-3">
            {[props.financeSnapshot, ...otherClubs].map((snap) => (
              <li
                key={snap.organizationId}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-semibold">{snap.organizationName}</p>
                <p className="mt-1 text-lg font-bold text-[#0A2342] dark:text-white">
                  {formatCents(snap.balanceCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {snap.totalEntryCount} ledger entries
                </p>
                <Link
                  href={`/organizations/${snap.organizationSlug}?tab=finances`}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
                >
                  Open ledger
                  <ArrowRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      {isItHub && pending.length > 0 ? (
        <ClubInvoicesPanel
          organizationId={props.organizationId}
          organizationSlug={props.organizationSlug}
          organizationName="Focus clubs"
          invoices={pending}
          canSubmit={false}
          canReview={props.canReviewInvoices ?? props.canManageFinances ?? false}
          storageConfigured={props.invoiceStorageConfigured ?? false}
          showForm={false}
        />
      ) : null}

      <ClubFinancesPanel
        snapshot={props.financeSnapshot}
        canManage={props.canManageFinances ?? false}
      />
    </div>
  );
}

function InvoicesPanel(props: ClubTabPanelsProps) {
  return (
    <ClubInvoicesPanel
      organizationId={props.organizationId}
      organizationSlug={props.organizationSlug}
      organizationName={props.card.name}
      invoices={props.clubInvoices ?? []}
      canSubmit={props.canSubmitInvoices ?? false}
      canReview={props.canReviewInvoices ?? false}
      storageConfigured={props.invoiceStorageConfigured ?? false}
    />
  );
}

function ShopPanel() {
  return (
    <div className="space-y-4">
      <DashboardCard
        title="Cricut Club Shop"
        description="Catalog, orders, and production — pickup at Madonna or ship from Weirton, WV."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Open shop</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/cricut/orders">Orders</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/cricut/designs">Design hub</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/cricut">Production hub</Link>}
          />
        </div>
      </DashboardCard>
    </div>
  );
}

function MediaPanel(props: ClubTabPanelsProps) {
  const {
    card,
    organizationSlug,
    canManageMedia,
    organizationMedia = [],
  } = props;
  const isBroadcasting = organizationSlug === "broadcasting";

  if (isBroadcasting) {
    const isCrew = props.isBroadcastCrew !== false;
    const canGoLive = Boolean(props.canGoLive ?? canManageMedia);
    const schedule = props.broadcastSchedule ?? {
      id: null,
      organizationId: null,
      nextAirAt: null,
      title: null,
      notes: null,
      updatedByName: null,
    };

    return (
      <div className="space-y-8">
        {canGoLive && props.rtmpConfig ? (
          <>
            <DashboardCard
              title="Record & Go Live"
              description="Record a clip for the library, or open this phone or laptop’s camera and go live."
              icon={<Radio className="size-5" />}
              status={
                props.activeLive
                  ? { label: "On air", variant: "warning" }
                  : { label: "This device", variant: "info" }
              }
            >
              <LiveBroadcastPanel
                activeLive={props.activeLive ?? null}
                isProducer
                canRecord={Boolean(canManageMedia)}
                currentUserId={props.currentUserId ?? ""}
                rtmp={props.rtmpConfig}
                previewWindow={isWithinAirPreviewWindow(schedule.nextAirAt)}
                scheduledTitle={schedule.title}
              />
            </DashboardCard>

            <HowWeGoLiveCard />
          </>
        ) : (
          <DashboardCard
            title="Blue Don Live"
            description="Watch when Broadcasting is on air."
            icon={<Camera className="size-5" />}
          >
            {props.rtmpConfig ? (
              <LiveBroadcastPanel
                activeLive={props.activeLive ?? null}
                isProducer={false}
                currentUserId={props.currentUserId ?? ""}
                rtmp={props.rtmpConfig}
                previewWindow={isWithinAirPreviewWindow(schedule.nextAirAt)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Live stream status loads with Watch Broadcasting.
              </p>
            )}
          </DashboardCard>
        )}

        <DashboardCard
          title="Next live"
          description="Countdown visible to the whole campus on Watch Broadcasting."
          icon={<Megaphone className="size-5" />}
        >
          <BroadcastCountdown
            schedule={schedule}
            canSet={Boolean(canManageMedia)}
          />
        </DashboardCard>

        <DashboardCard
          title="Daily Announcement"
          description="Title and body for today’s campus message."
          icon={<Megaphone className="size-5" />}
        >
          <DailyAnnouncement
            announcement={props.dailyAnnouncement ?? null}
            canManage={Boolean(canManageMedia)}
          />
        </DashboardCard>

        {canManageMedia ? (
          <DashboardCard
            title="Record"
            description="Capture or upload a clip to the school library — not a live show."
            icon={<Camera className="size-5" />}
          >
            <div id="record">
              <VideoUploadForm
                storageConfigured={Boolean(props.mediaStorageConfigured)}
                submitLabel="Publish recording"
              />
            </div>
          </DashboardCard>
        ) : null}

        <DashboardCard
          title="Highlight Reel"
          description="Montage clips showcasing recent campus moments."
          icon={<Camera className="size-5" />}
        >
          <VideoLibrary
            items={organizationMedia}
            highlightOnly
            title="Featured montages"
            emptyLabel="No highlight reels yet."
            canCategorize={Boolean(canManageMedia)}
          />
        </DashboardCard>

        <DashboardCard
          title="On-demand library"
          description="Filter by morning announcements, sports, spotlights, and special events."
          icon={<Camera className="size-5" />}
        >
          <VideoLibrary
            items={organizationMedia}
            emptyLabel="No past broadcasts yet."
            canCategorize={Boolean(canManageMedia)}
          />
        </DashboardCard>

        {!isCrew ? (
          <p className="text-sm text-muted-foreground">
            Prefer the full audience hub?{" "}
            <Link href="/watch" className="text-[#2F80ED] underline">
              Open Watch Broadcasting LIVE
            </Link>
            .
          </p>
        ) : null}
      </div>
    );
  }

  const placeholders = [
    { label: "Club photos", emoji: "📸" },
    { label: "Event highlights", emoji: "🎬" },
    { label: "Member spotlights", emoji: "⭐" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Photos and videos from {card.name} will appear here. Visit the Media Hub for
        school-wide galleries and livestreams.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {placeholders.map((item) => (
          <li
            key={item.label}
            className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center"
          >
            <span className="text-2xl" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="mt-2 text-sm font-medium text-muted-foreground">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" nativeButton={false} render={
        <Link href="/media">
          <Camera className="size-4" />
          Media Hub
        </Link>
      } />
    </div>
  );
}

function FundraisersPanel(props: ClubTabPanelsProps) {
  const fundraisers = props.financeSnapshot?.fundraisers ?? [];

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Fundraiser goals"
        description="Cash raised from tagged ledger deposits"
        icon={<Megaphone className="size-5" />}
      >
        {fundraisers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fundraisers yet.
            {props.canManageFinances
              ? " Create one on the Finances tab."
              : ""}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {fundraisers.map((f) => {
              const pct =
                f.goalCents > 0
                  ? Math.min(100, Math.round((f.raisedCents / f.goalCents) * 100))
                  : 0;
              return (
                <li key={f.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{f.title}</p>
                    <span className="text-xs uppercase text-muted-foreground">
                      {f.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    ${(f.raisedCents / 100).toFixed(2)} / ${(f.goalCents / 100).toFixed(2)}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#2F80ED]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {f.taggedEntryCount === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Nothing tagged to this fundraiser yet.
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <Button className="mt-4" size="sm" variant="outline" nativeButton={false} render={
          <Link href={`/organizations/${props.organizationSlug}?tab=finances`}>
            Open finances
            <ArrowRight className="size-4" />
          </Link>
        } />
      </DashboardCard>

      <WishlistSection
        title="Club wishlist"
        description="Supplies and gear families can support alongside cash fundraisers."
        items={props.wishlistItems}
        canManage={props.canManageWishlist}
        organizationId={props.organizationId}
        organizationSlug={props.organizationSlug}
        academyId={props.academy?.id}
      />
    </div>
  );
}

function LeadershipPanel({ profile }: Pick<ClubTabPanelsProps, "profile">) {
  const leaders = profile.leadership ?? [];

  if (leaders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Officer roster will be published at the start of each term.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {leaders.map((leader) => (
        <li
          key={`${leader.role}-${leader.name}`}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
            {leader.role}
          </p>
          <p className="mt-1 font-semibold text-[#0A2342] dark:text-white">{leader.name}</p>
        </li>
      ))}
    </ul>
  );
}

function MembersPanel({
  members,
  memberCount,
}: Pick<ClubTabPanelsProps, "members" | "memberCount">) {
  return (
    <DashboardCard
      title="Members"
      icon={<Users className="size-5" />}
      status={{ label: `${memberCount} active`, variant: "info" }}
    >
      {members.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <li
              key={`${memberLabel(member)}-${index}`}
              className="rounded-lg bg-muted/50 px-3 py-2 text-sm"
            >
              {memberLabel(member)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Be among the first to join and help shape this organization.
        </p>
      )}
    </DashboardCard>
  );
}

function WorkspacePanel(props: ClubTabPanelsProps) {
  switch (props.organizationType) {
    case "CLASS":
      return <ClassWorkspacePanel slug={props.organizationSlug} />;
    case "TEAM":
      return <AthleticsWorkspacePanel slug={props.organizationSlug} />;
    default:
      return <ClubWorkspacePanel slug={props.organizationSlug} />;
  }
}

function ScriptPanel(props: ClubTabPanelsProps) {
  if (props.organizationSlug !== "broadcasting" || !props.dailyScript) {
    return (
      <DashboardCard title="Daily Rundown">
        <p className="text-sm text-muted-foreground">
          Show script is available on the Broadcasting club page.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Daily Rundown"
      description="Shared production sheet — fill slots, preview the script, then copy or print for air."
      icon={<Megaphone className="size-5" />}
    >
      <DailyRundownPanel
        script={props.dailyScript}
        organizationId={props.organizationId}
        canEditValues={Boolean(props.canEditScriptValues)}
        canEditPrayer={Boolean(props.canEditScriptPrayer)}
        canEditTemplate={Boolean(props.canEditScriptTemplate)}
      />
    </DashboardCard>
  );
}

function SportsPanel(props: ClubTabPanelsProps) {
  if (props.organizationSlug !== "broadcasting" || !props.sportsHub) {
    return (
      <DashboardCard title="Sports Highlights">
        <p className="text-sm text-muted-foreground">
          Sports coverage lives on the Broadcasting club page.
        </p>
      </DashboardCard>
    );
  }

  return (
    <SportsAudienceSections
      data={props.sportsHub}
      basePath="/organizations/broadcasting"
      extraParams={{ tab: "sports" }}
      storageConfigured={Boolean(props.sportsStorageConfigured)}
      canManage={Boolean(props.canManageMedia)}
    />
  );
}

function SportsDeskPanel(props: ClubTabPanelsProps) {
  if (props.organizationSlug !== "broadcasting" || !props.sportsDesk) {
    return (
      <DashboardCard title="Sports desk">
        <p className="text-sm text-muted-foreground">
          The sports desk is available to Broadcasting crew on the club page.
        </p>
      </DashboardCard>
    );
  }

  return (
    <SportsDeskSections
      data={props.sportsDesk}
      basePath="/organizations/broadcasting"
      extraParams={{ tab: "sports-desk" }}
      activeSportSlug={props.activeSportSlug ?? null}
      storageConfigured={Boolean(props.sportsStorageConfigured)}
      stats={props.sportsStats ?? []}
    />
  );
}

export function ClubTabPanels(props: ClubTabPanelsProps) {
  switch (props.activeTab) {
    case "workspace":
      return <WorkspacePanel {...props} />;
    case "announcements":
      return <AnnouncementsPanel card={props.card} />;
    case "projects":
      return <ProjectsPanel {...props} />;
    case "documents":
      return <DocumentsPanel {...props} />;
    case "checklists":
      return <ChecklistsPanel {...props} />;
    case "certifications":
      return <CertificationsPanel profile={props.profile} />;
    case "labs":
      return <LabsPanel profile={props.profile} />;
    case "calendar":
      return <CalendarPanel {...props} />;
    case "finances":
      return <FinancesPanel {...props} />;
    case "invoices":
      return <InvoicesPanel {...props} />;
    case "shop":
      return <ShopPanel />;
    case "designs":
      return (
        <DashboardCard title="Design hub">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/designs">Open design hub</Link>}
          />
        </DashboardCard>
      );
    case "orders":
      return (
        <DashboardCard title="Orders">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/orders">Open orders</Link>}
          />
        </DashboardCard>
      );
    case "script":
      return <ScriptPanel {...props} />;
    case "media":
      return <MediaPanel {...props} />;
    case "book":
      return (
        <DashboardCard
          title="Request coverage"
          description="Film, photography, or live streaming for your club, team, or event."
          icon={<Megaphone className="size-5" />}
        >
          <BookingRequestForm />
        </DashboardCard>
      );
    case "bookings":
      return (
        <DashboardCard
          title="Coverage bookings"
          description="Review and update requests from campus clubs and teams."
          icon={<Megaphone className="size-5" />}
        >
          <BookingReviewList
            bookings={props.broadcastBookings ?? []}
            canManage={Boolean(props.canManageMedia)}
          />
        </DashboardCard>
      );
    case "announce":
      return (
        <DashboardCard
          title="Submit a morning announcement"
          description="Request an item for the daily morning announcements show."
          icon={<Megaphone className="size-5" />}
        >
          <AnnouncementSubmitForm />
        </DashboardCard>
      );
    case "submissions":
      return (
        <DashboardCard
          title="Announcement submissions"
          description="Approve items for the Daily Rundown / morning announcements."
          icon={<Megaphone className="size-5" />}
        >
          <AnnouncementSubmissionReviewList
            submissions={props.announcementSubmissions ?? []}
            canManage={Boolean(props.canManageMedia)}
          />
        </DashboardCard>
      );
    case "credits":
      return (
        <DashboardCard
          title="Production credit roll"
          description="Hosts, camera, editors, producers, and studio crew."
          icon={<Megaphone className="size-5" />}
        >
          <CrewCreditRoll
            credits={props.crewCredits ?? []}
            canManage={Boolean(props.canManageMedia)}
            memberOptions={props.clubMemberOptions}
          />
        </DashboardCard>
      );
    case "equipment":
      return (
        <DashboardCard
          title="Equipment checklist"
          description="Pre-show inventory check-in for broadcast gear."
          icon={<Megaphone className="size-5" />}
        >
          <EquipmentChecklist
            items={props.broadcastEquipment ?? []}
            canManage={Boolean(props.canManageMedia)}
          />
        </DashboardCard>
      );
    case "join":
      return (
        <DashboardCard
          title="Join Broadcasting"
          description="Apply for Host, Camera, Editor, Graphics, and other production tracks."
          icon={<Megaphone className="size-5" />}
        >
          <JoinClubPortal canManage={Boolean(props.canManageMedia)} />
        </DashboardCard>
      );
    case "applications":
      return (
        <DashboardCard
          title="Join applications"
          description="Review student applications and add accepted members to the roster."
          icon={<Megaphone className="size-5" />}
        >
          <JoinApplicationReviewList
            applications={props.joinApplications ?? []}
            canManage={Boolean(props.canManageMedia)}
          />
        </DashboardCard>
      );
    case "sports":
      return <SportsPanel {...props} />;
    case "sports-desk":
      return <SportsDeskPanel {...props} />;
    case "fundraisers":
      return <FundraisersPanel {...props} />;
    case "leadership":
      return <LeadershipPanel profile={props.profile} />;
    case "members":
      return <MembersPanel members={props.members} memberCount={props.memberCount} />;
    case "tasks":
      return <ClubTasksTabPanel {...props} />;
    case "messages":
      return <ClubMessagesTabPanel {...props} />;
    case "overview":
    default:
      return <OverviewPanel {...props} />;
  }
}

export const CLUB_TAB_IDS = [
  "overview",
  "workspace",
  "announcements",
  "projects",
  "documents",
  "checklists",
  "certifications",
  "labs",
  "calendar",
  "finances",
  "invoices",
  "shop",
  "designs",
  "orders",
  "script",
  "media",
  "book",
  "bookings",
  "announce",
  "submissions",
  "credits",
  "equipment",
  "join",
  "applications",
  "sports",
  "sports-desk",
  "fundraisers",
  "leadership",
  "members",
  "tasks",
  "messages",
] as const;

export function isClubTabId(value: string): value is ClubTabId {
  return (CLUB_TAB_IDS as readonly string[]).includes(value);
}
