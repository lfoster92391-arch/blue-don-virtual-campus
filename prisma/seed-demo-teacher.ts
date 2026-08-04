import { createClient } from "@supabase/supabase-js";

import type { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_TEACHER_EMAIL } from "../src/lib/auth/email-domain";

export const DEMO_TEACHER_PASSWORD = "BlueDons123!";

const DEMO_TEACHER_FIRST_NAME = "Demo";
const DEMO_TEACHER_LAST_NAME = "Teacher";
const DEMO_TEACHER_DISPLAY_NAME = "Demo Teacher";

/** IT Club advisor — wishlists, equipment, and org leadership tools. */
const DEMO_TEACHER_ORGANIZATION_ID = "org-it-club";

/**
 * Clean slate: the demo teacher LOGIN works but starts with no organization
 * leadership. Set SEED_DEMO_CONTENT=1 (npm run db:seed:demo) to attach the
 * IT Club advisor role for a populated walkthrough.
 */
function shouldSeedDemoTeacherMembership(): boolean {
  const flag = process.env.SEED_DEMO_CONTENT?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes" || flag === "on";
}

function createSeedAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  const placeholders = ["your-project", "your-service-role-key", "xxxx.supabase.co"];
  if (
    placeholders.some(
      (placeholder) =>
        url.includes(placeholder) || serviceRoleKey.includes(placeholder),
    )
  ) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function ensureSupabaseDemoUser(email: string, password: string) {
  const admin = createSeedAdminClient();
  if (!admin) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();
  const { data: listData, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    console.warn(
      `[seed] Could not list Supabase users for demo teacher: ${listError.message}`,
    );
    return null;
  }

  const existing = listData.users.find(
    (user) => user.email?.toLowerCase() === normalizedEmail,
  );
  if (existing) {
    const { data: updated, error: updateError } =
      await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: {
          role: "teacher",
          first_name: DEMO_TEACHER_FIRST_NAME,
          last_name: DEMO_TEACHER_LAST_NAME,
          display_name: DEMO_TEACHER_DISPLAY_NAME,
          onboarded: true,
        },
      });

    if (updateError) {
      console.warn(
        `[seed] Could not reset Supabase demo teacher (${email}): ${updateError.message}`,
      );
    }

    return updated?.user?.id ?? existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "teacher",
      first_name: DEMO_TEACHER_FIRST_NAME,
      last_name: DEMO_TEACHER_LAST_NAME,
      display_name: DEMO_TEACHER_DISPLAY_NAME,
      onboarded: true,
    },
  });

  if (error) {
    console.warn(
      `[seed] Could not create Supabase demo teacher (${email}): ${error.message}`,
    );
    return null;
  }

  return data.user?.id ?? null;
}

export async function seedDemoTeacher(prisma: PrismaClient) {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: DEMO_TEACHER_EMAIL },
    select: { id: true },
  });

  const supabaseUserId =
    (await ensureSupabaseDemoUser(DEMO_TEACHER_EMAIL, DEMO_TEACHER_PASSWORD)) ??
    existingByEmail?.id ??
    null;

  if (!supabaseUserId) {
    console.warn(
      `[seed] Demo teacher skipped: SUPABASE_SERVICE_ROLE_KEY is not set, so the ` +
        `Supabase auth user could not be looked up. Either add the service role key to ` +
        `.env and re-run \`npm run db:seed\`, or register ${DEMO_TEACHER_EMAIL} at ` +
        `/register (teacher role) and re-run to attach IT Club advisor membership.`,
    );
    return;
  }

  if (existingByEmail && existingByEmail.id !== supabaseUserId) {
    await prisma.user.delete({ where: { id: existingByEmail.id } });
  }

  const user = await prisma.user.upsert({
    where: { id: supabaseUserId },
    update: {
      email: DEMO_TEACHER_EMAIL,
      firstName: DEMO_TEACHER_FIRST_NAME,
      lastName: DEMO_TEACHER_LAST_NAME,
      displayName: DEMO_TEACHER_DISPLAY_NAME,
      role: "TEACHER",
      status: "ACTIVE",
      schoolId: "madonna-high-school",
      onboardedAt: new Date(),
    },
    create: {
      id: supabaseUserId,
      email: DEMO_TEACHER_EMAIL,
      firstName: DEMO_TEACHER_FIRST_NAME,
      lastName: DEMO_TEACHER_LAST_NAME,
      displayName: DEMO_TEACHER_DISPLAY_NAME,
      role: "TEACHER",
      status: "ACTIVE",
      schoolId: "madonna-high-school",
      onboardedAt: new Date(),
    },
  });

  if (!shouldSeedDemoTeacherMembership()) {
    // Blank-slate demo teacher (default): remove any leadership/memberships that
    // may have been seeded previously so re-running always yields the clean
    // first-time experience. Shared catalog data is untouched.
    await prisma.organizationMembership.deleteMany({ where: { userId: user.id } });

    console.log(
      `Seeded demo teacher ${DEMO_TEACHER_DISPLAY_NAME} (${DEMO_TEACHER_EMAIL}) as a blank slate — ` +
        `no organization leadership. Set SEED_DEMO_CONTENT=1 to seed the IT Club advisor role.`,
    );
    return;
  }

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: DEMO_TEACHER_ORGANIZATION_ID,
        userId: user.id,
      },
    },
    update: {
      status: "ACTIVE",
      orgRole: "PRESIDENT",
      joinedAt: new Date(),
    },
    create: {
      organizationId: DEMO_TEACHER_ORGANIZATION_ID,
      userId: user.id,
      status: "ACTIVE",
      orgRole: "PRESIDENT",
      joinedAt: new Date(),
    },
  });

  console.log(
    `Seeded demo teacher ${DEMO_TEACHER_DISPLAY_NAME} (${DEMO_TEACHER_EMAIL}) as IT Club advisor (PRESIDENT).`,
  );
}
