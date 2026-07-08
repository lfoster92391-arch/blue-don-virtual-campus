"use client";

import { useState } from "react";
import { Bot, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";

type TicketScenario = {
  id: string;
  subject: string;
  description: string;
  category: "TECHNICAL" | "ACCOUNT" | "FACILITIES";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  correctCategory: "TECHNICAL" | "ACCOUNT" | "FACILITIES";
  correctPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  resolution: string;
};

const TICKETS: TicketScenario[] = [
  {
    id: "t1",
    subject: "Cannot log into Chromebook",
    description: "Student reports login loop after password change yesterday.",
    category: "TECHNICAL",
    priority: "HIGH",
    correctCategory: "TECHNICAL",
    correctPriority: "HIGH",
    resolution: "Clear cached credentials, verify AD sync, re-enroll device if needed.",
  },
  {
    id: "t2",
    subject: "New student account request",
    description: "Counselor needs Google Workspace and AD account for transfer student.",
    category: "ACCOUNT",
    priority: "MEDIUM",
    correctCategory: "ACCOUNT",
    correctPriority: "MEDIUM",
    resolution: "Create AD user, assign Google license, add to correct OU groups.",
  },
  {
    id: "t3",
    subject: "Projector not displaying in Room 204",
    description: "Teacher cannot get HDMI signal during 1st period.",
    category: "FACILITIES",
    priority: "URGENT",
    correctCategory: "FACILITIES",
    correctPriority: "URGENT",
    resolution: "Check cable/adapter, input source, escalate to facilities if hardware fault.",
  },
];

export function HelpDeskLab() {
  const [index, setIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [resolution, setResolution] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const ticket = TICKETS[index];
  const allDone = scores.length === TICKETS.length;

  function scoreTicket() {
    let score = 0;
    if (selectedCategory === ticket.correctCategory) score += 35;
    if (selectedPriority === ticket.correctPriority) score += 35;
    if (resolution.trim().length >= 20) score += 30;

    const feedback =
      score >= 90
        ? "Excellent triage — category, priority, and resolution align with best practices."
        : score >= 70
          ? "Good work — review priority escalation rules for time-sensitive classroom issues."
          : "Needs improvement — compare your triage against the suggested resolution steps.";

    setScores((prev) => [...prev, score]);
    setAiFeedback(`AI Coach (placeholder): ${feedback} Score: ${score}/100`);
    setSubmitted(true);
  }

  function nextTicket() {
    setIndex((i) => i + 1);
    setSelectedCategory("");
    setSelectedPriority("");
    setResolution("");
    setAiFeedback(null);
    setSubmitted(false);
  }

  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-5">
      <div className="flex items-start gap-3">
        <Ticket className="size-5 shrink-0 text-[#2F80ED]" />
        <div>
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Help Desk Lab</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Triage support tickets, assign category and priority, and document resolution steps.
          </p>
        </div>
      </div>

      {!allDone && ticket ? (
        <div className="mt-5 space-y-4 rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Ticket {index + 1} of {TICKETS.length}
          </p>
          <p className="font-medium">{ticket.subject}</p>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium">Category</span>
              <select
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={submitted}
              >
                <option value="">Select category</option>
                <option value="TECHNICAL">Technical</option>
                <option value="ACCOUNT">Account</option>
                <option value="FACILITIES">Facilities</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium">Priority</span>
              <select
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                disabled={submitted}
              >
                <option value="">Select priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium">Resolution notes</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Document troubleshooting steps and resolution..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              disabled={submitted}
            />
          </label>

          {!submitted ? (
            <Button
              size="sm"
              disabled={!selectedCategory || !selectedPriority || resolution.trim().length < 10}
              onClick={scoreTicket}
            >
              Submit for AI scoring
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                <Bot className="mt-0.5 size-4 shrink-0 text-[#2F80ED]" />
                <p>{aiFeedback}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Suggested resolution: {ticket.resolution}
              </p>
              {index < TICKETS.length - 1 ? (
                <Button size="sm" onClick={nextTicket}>
                  Next ticket
                </Button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {allDone ? (
        <p className="mt-4 rounded-lg bg-[#2E8B57]/10 px-4 py-3 text-sm font-medium text-[#2E8B57]">
          Help Desk Lab complete — average AI score: {avgScore}/100 across {TICKETS.length} tickets.
        </p>
      ) : null}
    </div>
  );
}
