import { siteConfig } from "@/config/site";

type ShellPageProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function ShellPage({ title, description, actions, children }: ShellPageProps) {
  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2F80ED]">
              {siteConfig.institution}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0A2342] dark:text-white">
              {title}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
