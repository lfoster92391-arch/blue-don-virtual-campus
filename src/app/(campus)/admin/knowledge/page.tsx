import Link from "next/link";
import { redirect } from "next/navigation";

import { KnowledgeArticleCreateForm } from "@/components/knowledge/knowledge-article-create-form";
import { KnowledgeArticleActions } from "@/components/knowledge/knowledge-article-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageKnowledge } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAllArticles } from "@/services/knowledge-service";
import { listAcademies } from "@/services/event-service";

export default async function AdminKnowledgePage() {
  const user = await requireCompleteProfile();

  if (!canManageKnowledge(user.role)) {
    redirect("/knowledge");
  }

  const [articles, academies] = await Promise.all([
    listAllArticles(),
    listAcademies(),
  ]);

  return (
    <ShellPage
      title="Manage Knowledge Vault"
      description="Create, publish, and archive campus documentation."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">New article</h2>
        <KnowledgeArticleCreateForm academies={academies} />
      </section>

      <ul className="mt-8 space-y-3">
        {articles.map((article) => (
          <li
            key={article.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{article.title}</p>
              <p className="text-sm text-muted-foreground">
                /knowledge/{article.slug} · {article.status.toLowerCase()}
              </p>
            </div>
            <KnowledgeArticleActions
              articleId={article.id}
              slug={article.slug}
              status={article.status}
            />
          </li>
        ))}
      </ul>
    </ShellPage>
  );
}
