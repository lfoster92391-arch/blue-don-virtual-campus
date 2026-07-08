import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { PageFooter } from "@/components/layout/page-footer";
import { Sidebar } from "@/components/layout/sidebar";
import type { CampusUser } from "@/types/auth";

export function CampusLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: CampusUser;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <MobileSidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header user={user} />
        <main className="flex flex-1 flex-col pb-24 lg:pb-0">
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 lg:px-6">
            {children}
          </div>
          <PageFooter />
        </main>
        <MobileNav user={user} />
      </div>
    </div>
  );
}
