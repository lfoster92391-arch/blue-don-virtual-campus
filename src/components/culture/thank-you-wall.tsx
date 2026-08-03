"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ThankYouMessage } from "@/config/madonna-culture";

type ThankYouWallProps = {
  initialMessages: ThankYouMessage[];
};

export function ThankYouWall({ initialMessages }: ThankYouWallProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [author, setAuthor] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const approved = messages.filter((m) => m.status === "approved");
  const pending = messages.filter((m) => m.status === "pending");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !message.trim()) return;

    const newMessage: ThankYouMessage = {
      id: `ty-local-${Date.now()}`,
      author: author.trim(),
      recipient: recipient.trim() || undefined,
      message: message.trim(),
      status: "pending",
      dateLabel: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setMessages((prev) => [newMessage, ...prev]);
    setAuthor("");
    setRecipient("");
    setMessage("");
    setSubmitted(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-base font-semibold text-foreground">Share your thanks</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages are reviewed by moderators before appearing on the wall.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ty-author" className="text-sm font-medium">Your name</label>
              <Input id="ty-author" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="Your name or class year" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ty-recipient" className="text-sm font-medium">Thanking (optional)</label>
              <Input id="ty-recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Teacher, coach, staff member…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ty-message" className="text-sm font-medium">Message</label>
            <textarea
              id="ty-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              placeholder="Share what Madonna means to you…"
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
            />
          </div>
          {submitted ? (
            <p className="text-sm text-[#2E8B57]">Thank you! Your message is pending moderator review.</p>
          ) : null}
          <Button type="submit" className="w-fit">Submit message</Button>
        </form>
      </div>

      {pending.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Pending review</h3>
          <ul className="space-y-2">
            {pending.map((msg) => (
              <li key={msg.id} className="rounded-lg border border-dashed border-[#D4A017]/40 bg-[#D4A017]/5 px-3 py-2.5">
                <p className="text-sm text-foreground">{msg.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {msg.author}{msg.recipient ? ` → ${msg.recipient}` : ""} · {msg.dateLabel}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Thank You Wall</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {approved.map((msg) => (
            <li key={msg.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm leading-relaxed text-foreground">&ldquo;{msg.message}&rdquo;</p>
              <p className="mt-3 text-xs text-muted-foreground">
                — {msg.author}
                {msg.recipient ? <span className="text-[#2F80ED]"> · thanking {msg.recipient}</span> : null}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{msg.dateLabel}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
