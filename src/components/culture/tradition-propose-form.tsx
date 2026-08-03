"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TraditionProposal } from "@/config/madonna-culture";

type TraditionProposeFormProps = {
  approvedProposals: TraditionProposal[];
};

export function TraditionProposeForm({ approvedProposals }: TraditionProposeFormProps) {
  const [proposals, setProposals] = useState(approvedProposals);
  const [title, setTitle] = useState("");
  const [proposer, setProposer] = useState("");
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !proposer.trim() || !description.trim()) return;

    const newProposal: TraditionProposal = {
      id: `tp-local-${Date.now()}`,
      title: title.trim(),
      proposer: proposer.trim(),
      grade: grade.trim() || "Campus-wide",
      description: description.trim(),
      status: "pending",
      submittedLabel: "Submitted just now — pending review",
    };

    setProposals((prev) => [newProposal, ...prev]);
    setTitle("");
    setProposer("");
    setGrade("");
    setDescription("");
    setSubmitted(true);
  }

  const pending = proposals.filter((p) => p.status !== "approved");
  const approved = proposals.filter((p) => p.status === "approved");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-base font-semibold text-foreground">Propose a new tradition</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Students can suggest traditions for Student Council and administration review.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="tp-title" className="text-sm font-medium">Tradition name</label>
              <Input id="tp-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Senior Sunrise" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tp-proposer" className="text-sm font-medium">Your name / organization</label>
              <Input id="tp-proposer" value={proposer} onChange={(e) => setProposer(e.target.value)} required placeholder="Student Council, Class of 2028…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tp-grade" className="text-sm font-medium">Grade / scope (optional)</label>
            <Input id="tp-grade" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Seniors, Campus-wide…" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tp-desc" className="text-sm font-medium">Description</label>
            <textarea
              id="tp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe the tradition, when it would happen, and why it matters…"
              className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
            />
          </div>
          {submitted ? (
            <p className="text-sm text-[#2E8B57]">Proposal submitted! Student Council will review it.</p>
          ) : null}
          <Button type="submit" className="w-fit">Submit proposal</Button>
        </form>
      </div>

      {pending.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Under review</h3>
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id} className="rounded-lg border border-dashed border-[#D4A017]/40 px-3 py-2.5">
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.proposer} · {p.grade} · {p.submittedLabel}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Approved traditions archive</h3>
        <ul className="space-y-2">
          {approved.map((p) => (
            <li key={p.id} className="rounded-lg border border-border px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{p.title}</p>
                <span className="shrink-0 rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">Approved</span>
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.proposer} · {p.grade} · {p.submittedLabel}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
