"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { CampusPoll } from "@/config/madonna-culture";

type CampusVoicePollsProps = {
  initialPolls: CampusPoll[];
};

export function CampusVoicePolls({ initialPolls }: CampusVoicePollsProps) {
  const [polls, setPolls] = useState(initialPolls);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  function vote(pollId: string, optionId: string) {
    if (votedPolls.has(pollId)) return;

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.status !== "open") return poll;
        return {
          ...poll,
          options: poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
          ),
        };
      }),
    );
    setVotedPolls((prev) => new Set(prev).add(pollId));
  }

  return (
    <ul className="space-y-6">
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
        const hasVoted = votedPolls.has(poll.id);

        return (
          <li key={poll.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{poll.question}</p>
                <p className="text-sm text-muted-foreground">{poll.description}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  poll.status === "open"
                    ? "bg-[#2F80ED]/10 text-[#2F80ED]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {poll.status === "open" ? poll.endsLabel : "Closed"}
              </span>
            </div>

            <ul className="mt-4 space-y-2">
              {poll.options.map((option) => {
                const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                return (
                  <li key={option.id}>
                    {poll.status === "open" && !hasVoted ? (
                      <Button
                        variant="outline"
                        className="h-auto w-full justify-start px-3 py-2.5 text-left"
                        onClick={() => vote(poll.id, option.id)}
                      >
                        {option.label}
                      </Button>
                    ) : (
                      <div className="rounded-lg border border-border px-3 py-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{option.label}</span>
                          <span className="text-muted-foreground">{pct}% · {option.votes} votes</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[#2F80ED] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {poll.status === "open" && hasVoted ? (
              <p className="mt-3 text-xs text-[#2E8B57]">Thanks for voting!</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
