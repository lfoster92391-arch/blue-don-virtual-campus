import { PreviewBanner } from "@/components/admin/preview-banner";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { PageFooter } from "@/components/layout/page-footer";
import { Sidebar } from "@/components/layout/sidebar";
import type { CampusRole } from "@/config/roles";
import type { FocusClubSlug } from "@/config/focused-clubs";
import type { ViewAsPersona } from "@/config/view-as";
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
    /** Previewing the parent experience against a synthetic child. */
    parent?: boolean;
    persona?: ViewAsPersona | null;
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
            parent={preview.parent}
            persona={preview.persona}
          />
        ) : null}
        <Header user={user} />
        <main className="flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 lg:px-6">
            {children}
          </div>
          <PageFooter />
        </main>
      </div>
    </div>
  );
}
