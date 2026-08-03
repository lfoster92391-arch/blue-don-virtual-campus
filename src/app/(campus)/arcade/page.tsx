import Link from "next/link";
import { Gamepad2, Star, Trophy } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { CURRENT_CAMPUS_CHALLENGE } from "@/config/campus-challenge";
import { getModuleShell } from "@/config/module-shells";

const ARCADE_GAMES = [
  { id: "g-memory", name: "Memory Match", description: "Match campus icons and earn XP.", emoji: "🧠", xp: 25 },
  { id: "g-trivia", name: "Blue Don Trivia", description: "School history, traditions, and Madonna facts.", emoji: "❓", xp: 30 },
  { id: "g-word", name: "Word Scramble", description: "Unscramble words from literature, science, and more.", emoji: "🔤", xp: 20 },
  { id: "g-math", name: "Math Sprint", description: "60-second arithmetic challenge.", emoji: "🔢", xp: 35 },
  { id: "g-history", name: "History Challenge", description: "U.S. and world history questions.", emoji: "📜", xp: 35 },
  { id: "g-geo", name: "Geography Quiz", description: "Capitals, landmarks, and world cultures.", emoji: "🌍", xp: 30 },
  { id: "g-science", name: "Science Trivia", description: "Biology, chemistry, physics, and earth science.", emoji: "🔬", xp: 35 },
  { id: "g-faith", name: "Saint Quiz", description: "Learn about patron saints and church history.", emoji: "⛪", xp: 25 },
] as const;

const LEADERBOARD = [
  { rank: 1, name: "Alex M.", xp: 4820, streak: 14 },
  { rank: 2, name: "Jordan K.", xp: 4650, streak: 11 },
  { rank: 3, name: "Sam R.", xp: 4310, streak: 9 },
  { rank: 4, name: "You", xp: 2340, streak: 5, highlight: true },
  { rank: 5, name: "Casey L.", xp: 2180, streak: 7 },
];

export default function ArcadePage() {
  const config = getModuleShell("arcade")!;
  const challenge = CURRENT_CAMPUS_CHALLENGE;

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Gamepad2 className="size-3.5" aria-hidden="true" />
          Play · Learn · Earn
        </span>
      }
    >
      <DashboardCard
        title={`Campus Quest: ${challenge.title}`}
        description={challenge.description}
        icon={<Trophy className="size-5" />}
        status={{ label: "W17", variant: "info" }}
        progress={{ value: challenge.progress, label: challenge.endsLabel }}
      >
        <div className="flex flex-wrap gap-2">
          {challenge.rewards.map((reward) => (
            <span
              key={reward}
              className="rounded-full bg-[#D4A017]/10 px-2.5 py-0.5 text-xs font-medium text-[#D4A017]"
            >
              {reward}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Theme: {challenge.theme}</p>
      </DashboardCard>

      <DashboardCard title="Brain Games" description="Trivia and puzzles across every subject — history, science, faith, and more.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ARCADE_GAMES.map((game) => (
            <div
              key={game.id}
              className="rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40"
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{game.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{game.name}</p>
                  <p className="text-xs text-muted-foreground">{game.description}</p>
                  <p className="mt-1 text-xs font-medium text-[#2F80ED]">+{game.xp} XP</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Leaderboard" description="Top players this month." icon={<Star className="size-5" />}>
        <ul className="space-y-2">
          {LEADERBOARD.map((entry) => (
            <li
              key={entry.rank}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                "highlight" in entry && entry.highlight
                  ? "border-[#2F80ED]/40 bg-[#2F80ED]/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {entry.rank}
                </span>
                <span className="font-medium text-foreground">{entry.name}</span>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-[#2F80ED]">{entry.xp.toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground">{entry.streak}-day streak</p>
              </div>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" nativeButton={false} render={<Link href="/rewards">View rewards</Link>} />
        <Button variant="outline" nativeButton={false} render={<Link href="/discover">Daily Discovery</Link>} />
        <Button variant="outline" nativeButton={false} render={<Link href="/simulators">Simulators</Link>} />
      </div>
    </ShellPage>
  );
}
