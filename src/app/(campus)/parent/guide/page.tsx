import Link from "next/link";
import {
  Bell,
  BookOpen,
  Compass,
  LifeBuoy,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FuelTheDonsLink, FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { FUEL_THE_DONS_NAME } from "@/config/fuel-the-dons";
import { IT_CONTACT_EMAIL } from "@/lib/auth/email-domain";
import { requireCampusAccess } from "@/lib/auth/session";

export const metadata = {
  title: "Parent Guide",
  description:
    "How to create a parent account, what it can do, where lunch lives, and how Madonna High School reaches you.",
};

const CONTENTS = [
  { href: "#create-account", label: "Create your account" },
  { href: "#getting-around", label: "What you can do" },
  { href: "#lunch", label: "Lunch" },
  { href: "#notifications", label: "How we reach you" },
  { href: "#help", label: "Get help" },
];

type Step = { id: string; body: React.ReactNode };

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0A2342] text-xs font-semibold text-white dark:bg-white dark:text-[#0A2342]">
            {index + 1}
          </span>
          <div className="text-sm leading-relaxed text-muted-foreground">
            {step.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Section({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {children}
    </section>
  );
}

export default async function ParentGuidePage() {
  await requireCampusAccess();

  return (
    <ShellPage
      title="Parent Guide"
      description="Everything a Madonna parent needs, start to finish — setting up your account, what you can see, where lunch lives, and how the school keeps you in the loop."
      actions={
        <>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/parent">Parent Portal</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/madonna">Madonna Hub</Link>}
          />
        </>
      }
    >
      <DashboardCard
        title="In this guide"
        description="Jump to what you need."
        icon={<BookOpen className="size-5" />}
      >
        <ul className="flex flex-wrap gap-2">
          {CONTENTS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <Section id="create-account">
        <DashboardCard
          title="1. Create your parent account"
          description="A parent account is approved by hand, so plan on a day or two before you can sign in."
          icon={<UserPlus className="size-5" />}
        >
          <Steps
            steps={[
              {
                id: "register",
                body: (
                  <>
                    Go to{" "}
                    <span className="font-medium text-foreground">
                      campus.assetpilotedu.com/register?role=parent
                    </span>
                    . Use that full address — it tells the site you are a parent
                    rather than a student.
                  </>
                ),
              },
              {
                id: "email",
                body: (
                  <>
                    Enter your own email address. Parents do{" "}
                    <span className="font-medium text-foreground">not</span>{" "}
                    need a school address, so Gmail, Yahoo, or anything else is
                    fine. Students and staff are the ones who must use
                    @weirtonmadonna.org.
                  </>
                ),
              },
              {
                id: "relationship",
                body: (
                  <>
                    Fill in{" "}
                    <span className="font-medium text-foreground">
                      Relationship to school
                    </span>{" "}
                    so the office knows who you are. For example: &ldquo;Parent
                    of Jane Smith, Class of 2028.&rdquo;
                  </>
                ),
              },
              {
                id: "password",
                body: (
                  <>
                    Choose a password of at least 8 characters, type it twice,
                    and press{" "}
                    <span className="font-medium text-foreground">
                      Create account
                    </span>
                    .
                  </>
                ),
              },
              {
                id: "confirm",
                body: (
                  <>
                    Check your inbox and click the confirmation link. If it is
                    not there in a few minutes, look in your spam folder.
                  </>
                ),
              },
              {
                id: "onboarding",
                body: (
                  <>
                    Sign in and fill in your first and last name when the site
                    asks.
                  </>
                ),
              },
              {
                id: "pending",
                body: (
                  <>
                    You will land on a page that says{" "}
                    <span className="font-medium text-foreground">
                      Account pending approval
                    </span>
                    . That is expected. Email{" "}
                    <a
                      href={`mailto:${IT_CONTACT_EMAIL}`}
                      className="font-medium text-[#2F80ED] underline underline-offset-4"
                    >
                      {IT_CONTACT_EMAIL}
                    </a>{" "}
                    and say which student is yours.
                  </>
                ),
              },
              {
                id: "approved",
                body: (
                  <>
                    The school approves your account and connects it to your
                    student at the same time. You cannot link a student
                    yourself, and you do not need a code. Sign in again and you
                    are in.
                  </>
                ),
              },
              {
                id: "more-children",
                body: (
                  <>
                    Have more than one student at Madonna? Ask the office to
                    link the others to the same account. They will all appear
                    together.
                  </>
                ),
              },
            ]}
          />
        </DashboardCard>
      </Section>

      <Section id="getting-around">
        <DashboardCard
          title="2. What a parent account can do"
          description="Everything below is open to you once your account is approved."
          icon={<Compass className="size-5" />}
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Madonna Hub",
                href: "/madonna",
                body: "The front door. Today's schedule and announcement, the next game, the campus broadcast, and school info.",
              },
              {
                title: "Parent Portal",
                href: "/parent",
                body: "Your linked students, agreements waiting for your signature, and club permission requests from your child.",
              },
              {
                title: "Today",
                href: "/madonna/today",
                body: "The bell schedule, campus weather, and the announcement Broadcasting read this morning.",
              },
              {
                title: "Sports",
                href: "/madonna/sports",
                body: "Schedules, scores, and game video for Madonna teams.",
              },
              {
                title: "Broadcast",
                href: "/madonna/broadcast",
                body: "Watch the student broadcast live, or catch up on any past announcement show.",
              },
              {
                title: "Campus",
                href: "/madonna/campus",
                body: "Bell schedule, calendar, weather station, lunch, and the Madonna archive.",
              },
              {
                title: "Home",
                href: "/home",
                body: "Messages sent to you, plus anything waiting on your signature.",
              },
              {
                title: "Your profile",
                href: "/profile",
                body: "Your name, your password, and your display settings.",
              },
            ].map((item) => (
              <div key={item.href}>
                <dt>
                  <Link
                    href={item.href}
                    className="font-medium text-[#2F80ED] underline underline-offset-4"
                  >
                    {item.title}
                  </Link>
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-sm text-muted-foreground">
            A few things are deliberately not on a parent account. You cannot
            see other families&apos; students, grades are not kept here, and
            there is no way to message a teacher directly through the app —
            email or a phone call to the office is still the way to reach a
            teacher.
          </p>
        </DashboardCard>
      </Section>

      <Section id="lunch">
        <DashboardCard
          title="3. Lunch"
          description={`Menus, orders, and cafeteria payments are on ${FUEL_THE_DONS_NAME} — not in this app.`}
          icon={<UtensilsCrossed className="size-5" />}
          status={{ label: "Outside this site", variant: "info" }}
        >
          <FuelTheDonsRow />

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              This campus site used to take lunch orders. It no longer does —{" "}
              <FuelTheDonsLink /> is the one place the kitchen works from, so
              anything you choose or pay there is what your student gets.
            </p>
            <p>
              A food allergy or dietary restriction is worth a phone call to the
              school office as well. Do not rely on a web form alone for
              something serious.
            </p>
            <p>
              Questions about a charge, a credit, or a missed order go to the
              school office or to {FUEL_THE_DONS_NAME} directly. Nobody at
              Madonna will ask for card or bank details through this site, by
              email, or by text.
            </p>
          </div>
        </DashboardCard>
      </Section>

      <Section id="notifications">
        <DashboardCard
          title="4. How the school reaches you"
          description="Notices arrive inside the app. Sign in to see them."
          icon={<Bell className="size-5" />}
        >
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">
                Daily announcements
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Today&apos;s announcement appears on{" "}
                <Link
                  href="/madonna/today"
                  className="font-medium text-[#2F80ED] underline underline-offset-4"
                >
                  Today
                </Link>{" "}
                and in full — with the archive of past days — on{" "}
                <Link
                  href="/madonna/broadcast"
                  className="font-medium text-[#2F80ED] underline underline-offset-4"
                >
                  Broadcast
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Agreements and permission slips
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Anything waiting for your signature is listed on the{" "}
                <Link
                  href="/parent"
                  className="font-medium text-[#2F80ED] underline underline-offset-4"
                >
                  Parent Portal
                </Link>{" "}
                and on your Home page until you handle it.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Messages from the school
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Notes sent to you by staff show on your Home page. You can mark
                one as done or save it for later.
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-sm text-muted-foreground">
            The app does not send text messages, and it only emails you for
            account things like confirming your address or resetting a password.
            Urgent school matters still come from the office the usual way.
          </p>
        </DashboardCard>
      </Section>

      <Section id="help">
        <DashboardCard
          title="5. When something is wrong"
          description="Who to ask, depending on what you need."
          icon={<LifeBuoy className="size-5" />}
        >
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-foreground">
                Cannot sign in, or your student is not showing up
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Email{" "}
                <a
                  href={`mailto:${IT_CONTACT_EMAIL}`}
                  className="font-medium text-[#2F80ED] underline underline-offset-4"
                >
                  {IT_CONTACT_EMAIL}
                </a>
                .
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Anything about lunch — a menu, an order, a charge
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Start at <FuelTheDonsLink />, then call the school office if it
                is not sorted out there.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Anything about grades, attendance, or a teacher
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Contact the school directly. Those are not handled in this app.
              </dd>
            </div>
          </dl>
        </DashboardCard>
      </Section>
    </ShellPage>
  );
}
