import { cn } from "@/lib/utils";

/**
 * Dark console primitives for the Broadcast Control Studio. Navy/silver
 * hardware surfaces — deliberately not the campus card language.
 */

export function StudioPanel({
  title,
  meta,
  badge,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  meta?: string;
  badge?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-md border border-white/10 bg-[#0C1A2E]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <h2 className="truncate text-[0.65rem] font-semibold tracking-[0.18em] text-slate-300 uppercase">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {meta ? (
            <span className="font-mono text-[0.65rem] text-slate-500">
              {meta}
            </span>
          ) : null}
          {badge}
        </div>
      </header>
      <div className={cn("min-h-0 flex-1 overflow-auto p-3", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function PhaseBadge({ phase = 3 }: { phase?: number }) {
  return (
    <span className="rounded-sm border border-[#C9A227]/40 bg-[#C9A227]/10 px-1.5 py-0.5 font-mono text-[0.6rem] tracking-wider text-[#E0B93B] uppercase">
      Phase {phase}
    </span>
  );
}

/** A single hardware-style button face. Inert in the Phase 2 shell. */
export function StudioTile({
  label,
  detail,
  state = "idle",
  className,
}: {
  label: string;
  detail?: string;
  state?: "idle" | "program" | "preview" | "muted";
  className?: string;
}) {
  const states: Record<string, string> = {
    idle: "border-white/10 bg-white/[0.04] text-slate-300",
    program: "border-[#E11D48]/50 bg-[#E11D48]/15 text-[#FF8098]",
    preview: "border-[#2F80ED]/50 bg-[#2F80ED]/15 text-[#8FBEFF]",
    muted: "border-white/5 bg-white/[0.02] text-slate-500",
  };

  return (
    <div
      className={cn(
        "rounded-sm border px-2.5 py-2 text-left transition-colors",
        states[state],
        className,
      )}
    >
      <p className="truncate text-xs font-semibold tracking-wide">{label}</p>
      {detail ? (
        <p className="mt-0.5 truncate text-[0.65rem] text-slate-500">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export function StudioEmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[0.7rem] leading-relaxed text-slate-500">
      {children}
    </p>
  );
}

export function OnAirLamp({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 font-mono text-[0.7rem] font-semibold tracking-[0.2em] uppercase",
        live
          ? "border-[#E11D48]/60 bg-[#E11D48]/20 text-[#FF7A93]"
          : "border-white/15 bg-white/5 text-slate-400",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          live ? "animate-pulse bg-[#FF3B5C]" : "bg-slate-600",
        )}
        aria-hidden="true"
      />
      {live ? "On air" : "Off air"}
    </span>
  );
}
