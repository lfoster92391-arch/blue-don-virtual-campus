import { headers } from "next/headers";

import type { SubmissionAuditMeta } from "@/services/form-service";

/**
 * Captures digital-signature audit metadata (IP + user agent) from the
 * current request headers. Used on every agreement submission (agreement #13).
 */
export async function getRequestAuditMeta(
  signerRole?: string,
): Promise<SubmissionAuditMeta> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      null;
    return {
      ip,
      userAgent: headerList.get("user-agent"),
      signerRole: signerRole ?? null,
    };
  } catch {
    return { ip: null, userAgent: null, signerRole: signerRole ?? null };
  }
}
