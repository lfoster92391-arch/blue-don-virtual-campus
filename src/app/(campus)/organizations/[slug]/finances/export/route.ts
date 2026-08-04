import { NextResponse } from "next/server";

import { requireCompleteProfile } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  canViewClubFinances,
  getClubFinanceSnapshot,
  ledgerToCsv,
} from "@/services/club-finance-service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireCompleteProfile();
  const { slug } = await context.params;

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const canView = await canViewClubFinances(user.id, user.role, org.id);
  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshot = await getClubFinanceSnapshot(org.id);
  if (!snapshot) {
    return NextResponse.json({ error: "Finances unavailable" }, { status: 503 });
  }

  const csv = ledgerToCsv(snapshot.entries);
  const filename = `${org.slug}-ledger-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
