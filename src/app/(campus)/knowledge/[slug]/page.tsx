import Link from "next/link";
import { notFound } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageKnowledge } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getArticleBySlug } from "@/services/knowledge-service";

type KnowledgeArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function KnowledgeArticlePage({
  params,
}: KnowledgeArticlePageProps) {
  const { slug } = await params;
  const user = await requireCompleteProfile();
  const article = await getArticleBySlug(
    slug,
    canManageKnowledge(user.role),
  );

  if (!article) {
    notFound();
  }

  return (
    <ShellPage
      title={article.title}
      description={[article.category, article.authorName].filter(Boolean).join(" · ")}
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/knowledge">All articles</Link>} />

      {article.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <article className="prose prose-sm mt-8 max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {article.content}
        </div>
      </article>
    </ShellPage>
  );
}
