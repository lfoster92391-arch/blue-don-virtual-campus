import Link from "next/link";
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  Compass,
  LifeBuoy,
  Salad,
  UserPlus,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

import {
  CafeteriaBalances,
  type CafeteriaBalanceRow,
} from "@/components/cafeteria/cafeteria-balances";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  CAFETERIA_CREDIT_CONTACT,
  CAFETERIA_CREDIT_LOCATION,
  CAFETERIA_LOW_BALANCE_CENTS,
  formatCafeteriaMoney,
} from "@/config/cafeteria";
import { LUNCH_CHOICE_META, LUNCH_ORDER_CUTOFF_HOUR } from "@/config/lunch";
import { formatMinutes } from "@/config/school-hub";
import { IT_CONTACT_EMAIL } from "@/lib/auth/email-domain";
import { requireCampusAccess } from "@/lib/auth/session";
import { getCafeteriaAccounts } from "@/services/cafeteria-account-service";
import { listLinkedStudents } from "@/services/parent-student-service";

export const metadata = {
  title: "Parent Guide",
  description:
    "How to create a parent account, choose lunches, pay the cafeteria, and get campus news at Madonna High School.",
};

const CONTENTS = [
  { href: "#create-account", label: "Create your account" },
  { href: "#getting-around", label: "What you can do" },
  { href: "#choosing-lunch", label: "Choose lunches" },
  { href: "#check-selections", label: "Check what saved" },
  { href: "#allergies", label: "Allergies" },
  { href: "#paying-for-lunch", label: "Pay for lunch" },
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
  const user = await requireCampusAccess();

  // Shown only to a signed-in parent who actually has a tracked balance, so
  // the guide doubles as a quick check without becoming a second lunch page.
  const linkedStudents = await listLinkedStudents(user.id);
  const accounts = await getCafeteriaAccounts(
    linkedStudents.map((student) => student.id),
  );
  const balanceRows: CafeteriaBalanceRow[] = linkedStudents
    .map((student) => {
      const account = accounts[student.id];
      if (!account) {
        return null;
      }
      return {
        studentId: student.id,
        studentName: student.displayName,
        balanceLabel: account.balanceLabel,
        balanceCents: account.balanceCents,
        isLow: account.isLow,
      };
    })
    .filter((row): row is CafeteriaBalanceRow => row !== null);

  const cutoffLabel = formatMinutes(LUNCH_ORDER_CUTOFF_HOUR * 60);

  return (
    <ShellPage
      title="Parent Guide"
      description="Everything a Madonna parent needs, start to finish — setting up your account, choosing your student's lunches, paying the cafeteria, and keeping up with campus news."
      actions={
        <>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/lunch">Cafeteria lunch</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/parent">Parent Portal</Link>}
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

      {balanceRows.length > 0 ? (
        <Section id="your-balances">
          <DashboardCard
            title="Your cafeteria balances"
            description="What the office currently has on file for your student."
            icon={<Wallet className="size-5" />}
          >
            <CafeteriaBalances rows={balanceRows} showGuideLink={false} />
          </DashboardCard>
        </Section>
      ) : null}

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
                title: "Home",
                href: "/home",
                body: "Today at Madonna — the daily schedule, the weather, today's announcements, and any messages sent to you.",
              },
              {
                title: "Parent Portal",
                href: "/parent",
                body: "Your linked students, agreements waiting for your signature, and club permission requests from your child.",
              },
              {
                title: "Cafeteria Lunch",
                href: "/lunch",
                body: "Choose a lunch for each school day, see your cafeteria balance, and send in an allergy form.",
              },
              {
                title: "Your Lunch Selections",
                href: "/lunch/selections",
                body: "A plain list of every lunch you have saved, which days are still open, and what is locked in.",
              },
              {
                title: "Madonna Hub",
                href: "/madonna",
                body: "The school's front page inside the campus — announcements, sports recaps, and the highlight reel.",
              },
              {
                title: "Announcements",
                href: "/madonna/announcements",
                body: "Today's broadcast announcements plus the archive of past days.",
              },
              {
                title: "Watch Broadcasting",
                href: "/media",
                body: "Live streams and recorded video from the student broadcast team.",
              },
              {
                title: "Blue Don Sports",
                href: "/sports",
                body: "Schedules, scores, and game coverage for Madonna teams.",
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

      <Section id="choosing-lunch">
        <DashboardCard
          title="3. Choose your student's lunches"
          description={`Orders for each day close at ${cutoffLabel} that morning.`}
          icon={<UtensilsCrossed className="size-5" />}
        >
          <Steps
            steps={[
              {
                id: "open",
                body: (
                  <>
                    Open{" "}
                    <Link
                      href="/lunch"
                      className="font-medium text-[#2F80ED] underline underline-offset-4"
                    >
                      Cafeteria Lunch
                    </Link>{" "}
                    from the menu on the left, or from the Parent Portal.
                  </>
                ),
              },
              {
                id: "find-child",
                body: (
                  <>
                    Your student&apos;s name is at the top of their own section.
                    If more than one child is linked to you, each gets a
                    section.
                  </>
                ),
              },
              {
                id: "read-menu",
                body: <>Each row is one school day and shows that day&apos;s menu.</>,
              },
              {
                id: "pick",
                body: (
                  <>
                    Tap one of the four choices for that day:
                    <ul className="mt-2 space-y-1">
                      {Object.values(LUNCH_CHOICE_META).map((choice) => (
                        <li key={choice.choice}>
                          <span className="font-medium text-foreground">
                            {choice.label}
                          </span>{" "}
                          — {choice.hint}
                        </li>
                      ))}
                    </ul>
                  </>
                ),
              },
              {
                id: "saved",
                body: (
                  <>
                    Your choice saves the moment you tap it and shows a{" "}
                    <span className="font-medium text-foreground">Saved</span>{" "}
                    check. There is no separate submit button, and nothing to
                    send at the end.
                  </>
                ),
              },
              {
                id: "confirm",
                body: (
                  <>
                    Scroll to{" "}
                    <span className="font-medium text-foreground">
                      Your selections
                    </span>{" "}
                    at the bottom of the page to see everything you have chosen
                    in one list. See{" "}
                    <Link
                      href="#check-selections"
                      className="font-medium text-[#2F80ED] underline underline-offset-4"
                    >
                      the next section
                    </Link>
                    .
                  </>
                ),
              },
              {
                id: "change",
                body: (
                  <>
                    Change your mind by tapping a different choice. You can
                    change a day right up until {cutoffLabel} that morning.
                  </>
                ),
              },
              {
                id: "closed",
                body: (
                  <>
                    After the cutoff the day shows{" "}
                    <span className="font-medium text-foreground">
                      Ordering closed
                    </span>{" "}
                    with a lock. Call the office if something changes after
                    that.
                  </>
                ),
              },
              {
                id: "ahead",
                body: (
                  <>
                    You can set two full school weeks ahead. Many families do
                    the whole stretch on Sunday night.
                  </>
                ),
              },
            ]}
          />
        </DashboardCard>
      </Section>

      <Section id="check-selections">
        <DashboardCard
          title="4. Check what you already saved"
          description="A running list of every choice on file, so you never have to wonder whether a tap went through."
          icon={<ClipboardCheck className="size-5" />}
          actions={
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/lunch/selections">Open my selections</Link>}
            />
          }
        >
          <Steps
            steps={[
              {
                id: "where",
                body: (
                  <>
                    Open{" "}
                    <Link
                      href="/lunch/selections"
                      className="font-medium text-[#2F80ED] underline underline-offset-4"
                    >
                      Your Lunch Selections
                    </Link>{" "}
                    from the menu, or scroll to the{" "}
                    <span className="font-medium text-foreground">
                      Your selections
                    </span>{" "}
                    card at the bottom of the Cafeteria Lunch page.
                  </>
                ),
              },
              {
                id: "read",
                body: (
                  <>
                    Each student gets their own list: the date, what you picked,
                    and the dish behind it. A green{" "}
                    <span className="font-medium text-foreground">Saved</span>{" "}
                    means the cafeteria already has it.
                  </>
                ),
              },
              {
                id: "gaps",
                body: (
                  <>
                    Days still waiting on you are marked{" "}
                    <span className="font-medium text-foreground">
                      Not chosen yet
                    </span>
                    , and the top of the list counts them for you.
                  </>
                ),
              },
              {
                id: "fix",
                body: (
                  <>
                    Anything you want to change, tap{" "}
                    <span className="font-medium text-foreground">
                      Change a lunch
                    </span>{" "}
                    to go back to the board. Locked days show a padlock — those
                    are past the {cutoffLabel} cutoff.
                  </>
                ),
              },
            ]}
          />
        </DashboardCard>
      </Section>

      <Section id="allergies">
        <DashboardCard
          title="5. Tell the cafeteria about allergies"
          description="Food allergies and dietary restrictions are reviewed by the office before they take effect."
          icon={<Salad className="size-5" />}
        >
          <Steps
            steps={[
              {
                id: "form",
                body: (
                  <>
                    On the{" "}
                    <Link
                      href="/lunch"
                      className="font-medium text-[#2F80ED] underline underline-offset-4"
                    >
                      Cafeteria Lunch
                    </Link>{" "}
                    page, scroll to{" "}
                    <span className="font-medium text-foreground">
                      Allergies &amp; dietary needs
                    </span>
                    .
                  </>
                ),
              },
              {
                id: "fill",
                body: (
                  <>
                    Pick your student, check off the allergens and restrictions,
                    and add anything the kitchen should know — for example,
                    &ldquo;carries an EpiPen in her bag.&rdquo;
                  </>
                ),
              },
              {
                id: "review",
                body: (
                  <>
                    The office reviews the form. Once it is accepted, the
                    allergy shows next to your student&apos;s name every time
                    someone orders a lunch for them.
                  </>
                ),
              },
              {
                id: "urgent",
                body: (
                  <>
                    A severe allergy is worth a phone call to the office as
                    well. Do not rely on the form alone for something serious.
                  </>
                ),
              },
            ]}
          />
        </DashboardCard>
      </Section>

      <Section id="paying-for-lunch">
        <DashboardCard
          title="6. Pay for lunch"
          description="Madonna does not take card payments online. Cafeteria money comes to school."
          icon={<Wallet className="size-5" />}
          status={{ label: "No online checkout", variant: "info" }}
        >
          <Steps
            steps={[
              {
                id: "envelope",
                body: (
                  <>
                    Put cash or a check in an{" "}
                    <span className="font-medium text-foreground">envelope</span>
                    .
                  </>
                ),
              },
              {
                id: "name",
                body: (
                  <>
                    Write your{" "}
                    <span className="font-medium text-foreground">
                      student&apos;s name
                    </span>{" "}
                    on the outside of the envelope. This is the part that
                    matters most — an envelope without a name cannot be credited
                    to the right account.
                  </>
                ),
              },
              {
                id: "send",
                body: (
                  <>
                    Send the envelope to {CAFETERIA_CREDIT_LOCATION} with your
                    student, or drop it off yourself.
                  </>
                ),
              },
              {
                id: "dalfol",
                body: (
                  <>
                    <span className="font-medium text-foreground">
                      {CAFETERIA_CREDIT_CONTACT}
                    </span>{" "}
                    adds the money to your student&apos;s cafeteria account.
                  </>
                ),
              },
              {
                id: "see-it",
                body: (
                  <>
                    The new balance appears on the{" "}
                    <Link
                      href="/lunch"
                      className="font-medium text-[#2F80ED] underline underline-offset-4"
                    >
                      Cafeteria Lunch
                    </Link>{" "}
                    page. If it does not show up within a day, call the office.
                  </>
                ),
              },
            ]}
          />

          <div className="mt-5 rounded-xl border border-[#D4A017]/40 bg-[#D4A017]/10 p-4 text-sm">
            <p className="font-semibold text-foreground">
              Never send a card number
            </p>
            <p className="mt-1 text-muted-foreground">
              Nobody at Madonna will ask for card or bank details through this
              site, by email, or by text. Cafeteria money is cash or a check,
              handed to {CAFETERIA_CREDIT_LOCATION}.
            </p>
          </div>
        </DashboardCard>
      </Section>

      <Section id="notifications">
        <DashboardCard
          title="7. How the school reaches you"
          description="Notices arrive inside the app. Sign in to see them."
          icon={<Bell className="size-5" />}
        >
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">
                Low cafeteria balance
              </dt>
              <dd className="mt-1 text-muted-foreground">
                When your student&apos;s balance drops to{" "}
                {formatCafeteriaMoney(CAFETERIA_LOW_BALANCE_CENTS)} or below, a
                message lands in your{" "}
                <Link
                  href="/home"
                  className="font-medium text-[#2F80ED] underline underline-offset-4"
                >
                  Home
                </Link>{" "}
                page with the current balance and a link to the lunch page. You
                get one message per slide downward, not one a day. Send an
                envelope and the reminder stops.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Daily announcements
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Today&apos;s announcements appear on your Home page and in full
                on{" "}
                <Link
                  href="/madonna/announcements"
                  className="font-medium text-[#2F80ED] underline underline-offset-4"
                >
                  Madonna Announcements
                </Link>
                , where you can also read past days.
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
          title="8. When something is wrong"
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
                A balance looks wrong, or an envelope was never credited
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Call {CAFETERIA_CREDIT_LOCATION} and ask for{" "}
                {CAFETERIA_CREDIT_CONTACT}.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                A lunch needs to change after the cutoff
              </dt>
              <dd className="mt-1 text-muted-foreground">
                Call {CAFETERIA_CREDIT_LOCATION}. The kitchen count is already
                set, but they can usually sort it out.
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
