"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canAccessAdmin } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  submitPartnerApplication,
  updatePartnerStatus,
} from "@/services/business-partner-service";

export type PartnerActionState = {
  error?: string;
  success?: string;
};

const applySchema = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  industry: z.string().trim().min(2, "Industry is required"),
  description: z.string().trim().min(20, "Please describe your business and student opportunities"),
  address: z.string().trim().optional(),
  website: z.string().trim().url("Enter a valid website URL").optional().or(z.literal("")),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
});

function revalidatePartnerPaths() {
  revalidatePath("/business-partners");
  revalidatePath("/business-partners/apply");
  revalidatePath("/partners");
  revalidatePath("/partners/apply");
  revalidatePath("/community-partners");
  revalidatePath("/admin");
  revalidatePath("/admin/business-partners");
  revalidatePath("/admin/partners");
  revalidatePath("/pathways");
}

export async function applyPartnerFormAction(
  _prev: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  return applyPartnerAction({
    name: String(formData.get("name") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    description: String(formData.get("description") ?? ""),
    address: String(formData.get("address") ?? ""),
    website: String(formData.get("website") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
  });
}

export async function applyPartnerAction(
  input: z.infer<typeof applySchema>,
): Promise<PartnerActionState> {
  await requireCompleteProfile();

  const parsed = applySchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid application." };
  }

  const result = await submitPartnerApplication({
    name: parsed.data.name,
    industry: parsed.data.industry,
    description: parsed.data.description,
    address: parsed.data.address || undefined,
    website: parsed.data.website || undefined,
    contactEmail: parsed.data.contactEmail,
  });

  if (!result) {
    return {
      error:
        "Unable to submit your application right now. Check database configuration or try again later.",
    };
  }

  revalidatePartnerPaths();
  return {
    success:
      "Application received! Our team will review your business profile and contact you when it is approved.",
  };
}

export async function reviewPartnerAction(
  partnerId: string,
  approve: boolean,
): Promise<PartnerActionState> {
  const user = await requireCompleteProfile();

  if (!canAccessAdmin(user.role)) {
    return { error: "You do not have permission to review partner applications." };
  }

  const updated = await updatePartnerStatus(
    partnerId,
    approve ? "APPROVED" : "REJECTED",
    approve ? user.id : undefined,
  );

  if (!updated) {
    return { error: "Unable to update partner status." };
  }

  revalidatePartnerPaths();
  return { success: approve ? "Partner approved." : "Partner rejected." };
}
