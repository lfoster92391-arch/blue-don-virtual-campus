import Link from "next/link";
import { BookOpen } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { canManageKnowledge } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPublishedArticles } from "@/services/knowledge-service";
import { Button } from "@/components/ui/button";

export default async function KnowledgePage() {
  const user = await requireCompleteProfile();
  const articles = await listPublishedArticles();
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))];

  return (
    <ShellPage
      title="Knowledge Vault"
      description="Campus guides, academy resources, and how-to documentation."
    >
      {canManageKnowledge(user.role) ? (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/knowledge">Manage articles</Link>} />
      ) : null}

      {categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {category}
            </span>
          ))}
        </div>
      ) : null}

      {articles.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`/knowledge/${article.slug}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
              >
                <BookOpen className="mt-0.5 size-5 text-[#0A2342] dark:text-white" />
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {[article.category, article.academyName, article.authorName]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {article.tags.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {article.tags.join(", ")}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No articles published yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Administrators can publish campus guides and academy resources here.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
