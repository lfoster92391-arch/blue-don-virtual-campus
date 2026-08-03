import { PreviewBanner } from "@/components/admin/preview-banner";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { PageFooter } from "@/components/layout/page-footer";
import { Sidebar } from "@/components/layout/sidebar";
import type { CampusRole } from "@/config/roles";
import type { FocusClubSlug } from "@/config/focused-clubs";
import type { StudentContext } from "@/services/student-context-service";
import type { CampusUser } from "@/types/auth";

const EMPTY_CONTEXT: StudentContext = { clubs: [], teams: [], classes: [] };

export function CampusLayout({
  children,
  user,
  context = EMPTY_CONTEXT,
  navRole,
  preview,
}: {
  children: React.ReactNode;
  user: CampusUser;
  context?: StudentContext;
  /** Role used for nav filtering (student while admin is previewing). */
  navRole?: CampusRole;
  preview?: {
    active: boolean;
    studentName?: string | null;
    clubSlug?: FocusClubSlug | null;
  };
}) {
  const effectiveRole = navRole ?? user.role;
  const membershipSlugs = context.clubs.map((club) => club.slug);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={user}
        context={context}
        navRole={effectiveRole}
        membershipSlugs={membershipSlugs}
      />
      <MobileSidebar
        user={user}
        context={context}
        navRole={effectiveRole}
        membershipSlugs={membershipSlugs}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        {preview?.active ? (
          <PreviewBanner
            studentName={preview.studentName}
            clubSlug={preview.clubSlug}
          />
        ) : null}
        <Header user={user} />
        <main className="flex flex-1 flex-col pb-24 lg:pb-0">
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 lg:px-6">
            {children}
          </div>
          <PageFooter />
        </main>
        <MobileNav user={user} membershipSlugs={membershipSlugs} navRole={effectiveRole} />
      </div>
    </div>
  );
}
