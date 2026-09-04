"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import {
  focusClubName,
  focusClubRoleLabel,
} from "@/config/focus-club-access";
import { isSupabaseAdminConfigured } from "@/config/env";
import { isSchoolEmail, normalizeAuthEmail, SCHOOL_EMAIL_DOMAIN } from "@/lib/auth/email-domain";
import { requireCompleteProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  hasPermission,
  ORG_MEMBERSHIP_ROLES,
  type OrgMembershipRole,
} from "@/config/roles";
import { assignFocusClubMembership } from "@/services/org-membership-service";
import {
  createCampusUser,
  getUserById,
  setUserAccountStatus,
} from "@/services/user-service";

export type StudentAdminActionState = {
  error?: string;
  success?: string;
};

function revalidateStudentPaths() {
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  revalidatePath("/admin/leadership");
  revalidatePath("/service-desk/users");
}

const createStudentSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be 72 characters or fewer."),
    confirmPassword: z.string(),
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    clubSlug: z.enum(FOCUS_CLUB_SLUGS).optional(),
    orgRole: z
      .enum(ORG_MEMBERSHIP_ROLES as [OrgMembershipRole, ...OrgMembershipRole[]])
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const statusSchema = z.object({
  userId: z.string().uuid("Invalid user."),
  status: z.enum(["active", "inactive"]),
});

export async function createStudentWithClubAction(
  _prevState: StudentAdminActionState,
  formData: FormData,
): Promise<StudentAdminActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to create student accounts." };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      error:
        "Account creation is unavailable. Add SUPABASE_SERVICE_ROLE_KEY to the server environment.",
    };
  }

  const clubRaw = String(formData.get("clubSlug") ?? "").trim();
  const roleRaw = String(formData.get("orgRole") ?? "").trim();

  const parsed = createStudentSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    clubSlug: clubRaw || undefined,
    orgRole: roleRaw || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid student data." };
  }

  // Outside addresses are allowed on purpose: the `users:manage` check above is
  // the authorization, and some students have no school mailbox yet. We only
  // flag it back to the administrator. Self-service registration still enforces
  // the school domain.
  const email = normalizeAuthEmail(parsed.data.email);
  const isOutsideEmail = !isSchoolEmail(email);

  const client = createAdminClient();
  if (!client) {
    return { error: "Unable to connect to the authentication service." };
  }

  const displayName = `${parsed.data.firstName} ${parsed.data.lastName}`;

  const { data, error } = await client.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: "student",
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      display_name: displayName,
      onboarded: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Account was not created. Try again." };
  }

  const profile = await createCampusUser({
    id: data.user.id,
    email,
    role: "student",
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
  });

  if (!profile) {
    return {
      error:
        "Auth account created but campus profile failed. Check database configuration.",
    };
  }

  let clubNote = "";
  if (parsed.data.clubSlug && parsed.data.orgRole) {
    const membership = await assignFocusClubMembership({
      userId: profile.id,
      clubSlug: parsed.data.clubSlug,
      orgRole: parsed.data.orgRole,
    });
    if (membership) {
      clubNote = ` Assigned to ${focusClubName(parsed.data.clubSlug)} as ${focusClubRoleLabel(parsed.data.clubSlug, parsed.data.orgRole)}.`;
    } else {
      clubNote =
        " Account created, but club assignment failed — assign from the student list.";
    }
  }

  revalidateStudentPaths();
  const emailNote = isOutsideEmail
    ? ` Heads up: this is an outside address, not @${SCHOOL_EMAIL_DOMAIN}. The account works, but they cannot reset it through school mail.`
    : "";
  return {
    success: `Created ${profile.displayName} (${email}). They can sign in with the temporary password.${clubNote}${emailNote}`,
  };
}

export async function setStudentStatusAction(
  _prevState: StudentAdminActionState,
  formData: FormData,
): Promise<StudentAdminActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to change account status." };
  }

  const parsed = statusSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid status change." };
  }

  const target = await getUserById(parsed.data.userId);
  if (!target || target.role !== "student") {
    return { error: "Student not found." };
  }

  const updated = await setUserAccountStatus(
    parsed.data.userId,
    parsed.data.status,
  );

  if (!updated) {
    return { error: "Unable to update status. Check database configuration." };
  }

  revalidateStudentPaths();
  return {
    success: `${updated.displayName} is now ${parsed.data.status}.`,
  };
}
