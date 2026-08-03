import { PartnerBackLink } from "@/components/layout/partner-back-link";
import { isPartnerLinked } from "@/config/partner";
import { getCurrentWave, siteConfig } from "@/config/site";

export function PageFooter() {
  const wave = getCurrentWave();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 px-4 py-3 text-center text-xs text-muted-foreground lg:px-6">
        <p>
          Blue Don Virtual Campus · {wave.id} · {wave.label} · 14 Academies · v
          {siteConfig.version}
        </p>
        {isPartnerLinked() ? <PartnerBackLink variant="footer" /> : null}
      </div>
      <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-6 text-sm text-muted-foreground lg:px-6 lg:grid-cols-2 xl:grid-cols-5">
        <FooterBlock
          title="Why This Matters"
          body="One campus platform connects learning, operations, and community in a single student experience."
        />
        <FooterBlock
          title="Life Application"
          body="Students practice real responsibilities before graduation through structured campus participation."
        />
        <FooterBlock
          title="Career Application"
          body="Every experience builds transferable skills that remain valuable in college, work, and leadership."
        />
        <FooterBlock
          title="Skills Built"
          body="Organization, communication, documentation, collaboration, and professional follow-through."
        />
        <FooterBlock
          title="Future Opportunities"
          body="Portfolio evidence, leadership records, and community impact open doors beyond the classroom."
        />
      </div>
    </footer>
  );
}

function FooterBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 leading-relaxed">{body}</p>
    </div>
  );
}
