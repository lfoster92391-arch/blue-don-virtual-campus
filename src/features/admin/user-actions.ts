"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  CAMPUS_ROLES,
  hasPermission,
  type CampusRole,
} from "@/config/roles";
import { isSupabaseAdminConfigured } from "@/config/env";
import { requireCompleteProfile } from "@/lib/auth/session";
import { normalizeAuthEmail } from "@/lib/auth/email-domain";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveUserAccount,
  assignUserRole,
  createCampusUser,
  getUserById,
} from "@/services/user-service";
import { linkParentToStudent } from "@/services/parent-student-service";

export type AdminUserActionState = {
  error?: string;
  success?: string;
};

function revalidateUserPaths() {
  revalidatePath("/service-desk/users");
  revalidatePath("/admin/users");
  revalidatePath("/admin/parent-approvals");
  revalidatePath("/service-desk");
}

const createUserSchema = z
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
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    role: z.enum(CAMPUS_ROLES as [CampusRole, ...CampusRole[]]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const resetPasswordSchema = z
  .object({
    userId: z.string().uuid("Invalid user."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be 72 characters or fewer."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const roleSchema = z.object({
  userId: z.string().uuid("Invalid user."),
  role: z.enum(
    CAMPUS_ROLES as [CampusRole, ...CampusRole[]],
  ),
});

const approveParentSchema = z.object({
  parentId: z.string().uuid("Invalid parent."),
  studentId: z.string().uuid("Select a student to link."),
  relationship: z.string().trim().optional(),
});

const linkParentSchema = z.object({
  parentId: z.string().uuid("Invalid parent."),
  studentId: z.string().uuid("Select a student to link."),
  relationship: z.string().trim().optional(),
});

export async function resetUserPasswordAction(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to manage user accounts." };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      error:
        "Password management is unavailable. Add SUPABASE_SERVICE_ROLE_KEY to the server environment.",
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password reset." };
  }

  const targetUser = await getUserById(parsed.data.userId);
  if (!targetUser) {
    return { error: "User not found." };
  }

  const client = createAdminClient();
  if (!client) {
    return { error: "Unable to connect to the authentication service." };
  }

  const { error } = await client.auth.admin.updateUserById(parsed.data.userId, {
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateUserPaths();
  return {
    success: `Password updated for ${targetUser.displayName}. They can sign in immediately with the new password.`,
  };
}

export async function createCampusUserAction(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireCompleteProfile();

  // This gate is also what authorizes the email address below: an administrator
  // may provision any role on an outside domain, because some students and
  // families have no school mailbox. Self-service registration still enforces
  // the school domain.
  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to create user accounts." };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      error:
        "Account creation is unavailable. Add SUPABASE_SERVICE_ROLE_KEY to the server environment.",
    };
  }

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid account data." };
  }

  const email = normalizeAuthEmail(parsed.data.email);
  const client = createAdminClient();
  if (!client) {
    return { error: "Unable to connect to the authentication service." };
  }

  const displayName =
    parsed.data.firstName && parsed.data.lastName
      ? `${parsed.data.firstName} ${parsed.data.lastName}`
      : email;

  const { data, error } = await client.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: parsed.data.role,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      display_name: displayName,
      onboarded: Boolean(parsed.data.firstName && parsed.data.lastName),
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
    role: parsed.data.role,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
  });

  if (!profile) {
    return {
      error:
        "Auth account created but campus profile failed. Check database configuration.",
    };
  }

  revalidateUserPaths();
  return {
    success: `Account created for ${profile.displayName}. They can sign in with the email and password you set.`,
  };
}

export async function updateUserRoleAction(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to manage user accounts." };
  }

  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid role change." };
  }

  const updated = await assignUserRole(parsed.data.userId, parsed.data.role);

  if (!updated) {
    return { error: "Unable to update role. Check database configuration." };
  }

  revalidateUserPaths();
  return { success: `Role updated to ${updated.role} for ${updated.displayName}.` };
}

export async function approveParentAccountAction(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to manage user accounts." };
  }

  const parsed = approveParentSchema.safeParse({
    parentId: formData.get("parentId"),
    studentId: formData.get("studentId"),
    relationship: formData.get("relationship") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid approval request." };
  }

  const parent = await getUserById(parsed.data.parentId);
  if (!parent || parent.role === "student") {
    return { error: "Parent account not found." };
  }

  const student = await getUserById(parsed.data.studentId);
  if (!student || student.role !== "student") {
    return { error: "Student account not found." };
  }

  const approved = await approveUserAccount(parsed.data.parentId);
  if (!approved) {
    return { error: "Unable to approve account. Check database configuration." };
  }

  const link = await linkParentToStudent({
    parentId: parsed.data.parentId,
    studentId: parsed.data.studentId,
    relationship: parsed.data.relationship,
  });

  if (!link) {
    return {
      error: "Account approved but student link failed. Link the student from account management.",
    };
  }

  revalidateUserPaths();
  return {
    success: `Approved ${approved.displayName} and linked to ${link.displayName}.`,
  };
}

export async function linkParentStudentAction(
  _prevState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to manage user accounts." };
  }

  const parsed = linkParentSchema.safeParse({
    parentId: formData.get("parentId"),
    studentId: formData.get("studentId"),
    relationship: formData.get("relationship") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid link request." };
  }

  const parent = await getUserById(parsed.data.parentId);
  if (!parent || parent.role === "student") {
    return { error: "Parent account not found." };
  }

  const student = await getUserById(parsed.data.studentId);
  if (!student || student.role !== "student") {
    return { error: "Student account not found." };
  }

  const link = await linkParentToStudent({
    parentId: parsed.data.parentId,
    studentId: parsed.data.studentId,
    relationship: parsed.data.relationship,
  });

  if (!link) {
    return { error: "Unable to link parent and student." };
  }

  revalidateUserPaths();
  return { success: `Linked ${parent.displayName} to ${link.displayName}.` };
}
