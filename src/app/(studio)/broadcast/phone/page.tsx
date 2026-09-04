import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PhoneLiveStudio } from "@/components/media/phone-live-studio";
import { requireCampusAccess } from "@/lib/auth/session";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  isCampusMediaStorageConfigured,
} from "@/services/media-service";

export const metadata: Metadata = {
  title: "Go Live from your phone",
};

export const dynamic = "force-dynamic";

type PhoneLivePageProps = {
  searchParams: Promise<{ title?: string }>;
};

export default async function PhoneLivePage({ searchParams }: PhoneLivePageProps) {
  const user = await requireCampusAccess();

  if (!(await canManageCampusMedia(user.id, user.role))) {
    redirect("/organizations/broadcasting?tab=media");
  }

  const [{ title }, activeLive] = await Promise.all([
    searchParams,
    getActiveLiveStream(),
  ]);

  const phoneLive = activeLive?.isPhoneLive ? activeLive : null;

  return (
    <PhoneLiveStudio
      initialTitle={title?.trim() || phoneLive?.title || ""}
      storageConfigured={isCampusMediaStorageConfigured()}
      activeLiveId={phoneLive?.id ?? null}
      activeLiveTitle={phoneLive?.title ?? null}
    />
  );
}
