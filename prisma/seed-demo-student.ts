import { createClient } from "@supabase/supabase-js";

import type { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_STUDENT_EMAIL } from "../src/lib/auth/email-domain";

export const DEMO_STUDENT_PASSWORD = "DemoStudent123!";

const DEMO_STUDENT_FIRST_NAME = "Alex";
const DEMO_STUDENT_LAST_NAME = "Martinez";
const DEMO_STUDENT_DISPLAY_NAME = "Alex Martinez";

// The demo student intentionally starts as a BLANK SLATE — no club/team/class
// memberships, no academy enrollment, no XP, and no club progress. This lets
// reviewers experience the true first-time student journey and add their own
// communities over time. The shared catalog (orgs, forms, academies) is still
// seeded elsewhere so there is plenty for the student to discover and join.
//
// To seed a "rich" student with pre-loaded memberships instead, set the
// SEED_DEMO_STUDENT_MEMBERSHIPS env flag (see RICH_DEMO_ORGANIZATION_IDS below).
const RICH_DEMO_ORGANIZATION_IDS = [
  "org-it-club",
  "org-student-council-hs",
  "org-nhs",
] as const;

const RICH_DEMO_ACADEMY_ID = "academy-it";

function isTruthyFlag(value: string | undefined) {
  const flag = value?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes" || flag === "on";
}

function shouldSeedRichMemberships() {
  // Either the specific student flag or the campus-wide demo content flag
  // (npm run db:seed:demo) populates the rich Alex Martinez persona.
  return (
    isTruthyFlag(process.env.SEED_DEMO_STUDENT_MEMBERSHIPS) ||
    isTruthyFlag(process.env.SEED_DEMO_CONTENT)
  );
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
      `[seed] Could not list Supabase users for demo student: ${listError.message}`,
    );
    return null;
  }

  const existing = listData.users.find(
    (user) => user.email?.toLowerCase() === normalizedEmail,
  );
  if (existing) {
    // Reset password and force-confirm the email so login always works with
    // the documented credentials, even if the account was created earlier.
    const { data: updated, error: updateError } =
      await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: {
          role: "student",
          first_name: DEMO_STUDENT_FIRST_NAME,
          last_name: DEMO_STUDENT_LAST_NAME,
          display_name: DEMO_STUDENT_DISPLAY_NAME,
          onboarded: true,
        },
      });

    if (updateError) {
      console.warn(
        `[seed] Could not reset Supabase demo student (${email}): ${updateError.message}`,
      );
    }

    return updated?.user?.id ?? existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "student",
      first_name: DEMO_STUDENT_FIRST_NAME,
      last_name: DEMO_STUDENT_LAST_NAME,
      display_name: DEMO_STUDENT_DISPLAY_NAME,
      onboarded: true,
    },
  });

  if (error) {
    console.warn(
      `[seed] Could not create Supabase demo student (${email}): ${error.message}`,
    );
    return null;
  }

  return data.user?.id ?? null;
}

export async function seedDemoStudent(prisma: PrismaClient) {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: DEMO_STUDENT_EMAIL },
    select: { id: true },
  });

  // Always reconcile the Supabase auth user so login works with the documented
  // credentials. Fall back to any existing Prisma id only when the service role
  // key is unavailable (e.g. offline seeding of memberships after /register).
  const supabaseUserId =
    (await ensureSupabaseDemoUser(DEMO_STUDENT_EMAIL, DEMO_STUDENT_PASSWORD)) ??
    existingByEmail?.id ??
    null;

  if (!supabaseUserId) {
    console.warn(
      `[seed] Demo student skipped: SUPABASE_SERVICE_ROLE_KEY is not set, so the ` +
        `Supabase auth user could not be created. Either add the service role key to ` +
        `.env and re-run \`npm run db:seed\` (or \`node scripts/create-demo-student.mjs\`), ` +
        `or register ${DEMO_STUDENT_EMAIL} at /register and re-run to attach memberships.`,
    );
    return;
  }

  // If a stale profile shares this email but has a different id (e.g. seeded
  // before the auth user existed), remove it so the primary key can match the
  // Supabase auth user id. Membership rows cascade on delete.
  if (existingByEmail && existingByEmail.id !== supabaseUserId) {
    await prisma.user.delete({ where: { id: existingByEmail.id } });
  }

  const user = await prisma.user.upsert({
    where: { id: supabaseUserId },
    update: {
      email: DEMO_STUDENT_EMAIL,
      firstName: DEMO_STUDENT_FIRST_NAME,
      lastName: DEMO_STUDENT_LAST_NAME,
      displayName: DEMO_STUDENT_DISPLAY_NAME,
      role: "STUDENT",
      status: "ACTIVE",
      schoolId: "madonna-high-school",
      onboardedAt: new Date(),
    },
    create: {
      id: supabaseUserId,
      email: DEMO_STUDENT_EMAIL,
      firstName: DEMO_STUDENT_FIRST_NAME,
      lastName: DEMO_STUDENT_LAST_NAME,
      displayName: DEMO_STUDENT_DISPLAY_NAME,
      role: "STUDENT",
      status: "ACTIVE",
      schoolId: "madonna-high-school",
      onboardedAt: new Date(),
    },
  });

  if (!shouldSeedRichMemberships()) {
    // Blank-slate demo student (default): remove any personal associations that
    // may have been seeded previously so re-running the seed always yields the
    // clean first-time experience. Shared catalog data is untouched.
    await prisma.organizationMembership.deleteMany({ where: { userId: user.id } });
    await prisma.academyMembership.deleteMany({ where: { userId: user.id } });

    console.log(
      `Seeded demo student ${DEMO_STUDENT_DISPLAY_NAME} (${DEMO_STUDENT_EMAIL}) as a blank slate — ` +
        `no clubs, teams, classes, academies, or XP. Set SEED_DEMO_STUDENT_MEMBERSHIPS=1 to seed ` +
        `the rich demo instead.`,
    );
    return;
  }

  for (const organizationId of RICH_DEMO_ORGANIZATION_IDS) {
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
      update: {
        status: "ACTIVE",
        orgRole: "MEMBER",
        joinedAt: new Date(),
      },
      create: {
        organizationId,
        userId: user.id,
        status: "ACTIVE",
        orgRole: "MEMBER",
        joinedAt: new Date(),
      },
    });
  }

  await prisma.academyMembership.upsert({
    where: {
      userId_academyId: {
        userId: user.id,
        academyId: RICH_DEMO_ACADEMY_ID,
      },
    },
    update: {
      status: "ACTIVE",
      joinedAt: new Date(),
    },
    create: {
      userId: user.id,
      academyId: RICH_DEMO_ACADEMY_ID,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  });

  console.log(
    `Seeded demo student ${DEMO_STUDENT_DISPLAY_NAME} (${DEMO_STUDENT_EMAIL}) with IT Club, Student Council, NHS, and IT Academy memberships.`,
  );
}
