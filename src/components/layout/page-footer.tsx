import { siteConfig } from "@/config/site";

export function PageFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-1 px-4 py-4 text-center text-xs text-muted-foreground lg:px-6">
        <p className="font-medium text-foreground/80">
          {siteConfig.institution}
        </p>
        <p>Home of the Blue Dons</p>
      </div>
    </footer>
  );
}
