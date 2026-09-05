import Link from "next/link";
import { BookOpen, Search, Star } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageKnowledge } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  listPublishedArticles,
  type KnowledgeArticleListItem,
} from "@/services/knowledge-service";

type KnowledgePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

const CATEGORY_ORDER = [
  "Getting Started",
  "About Madonna",
  "Campus Life",
  "Academics",
  "Athletics",
  "Faith & Service",
  "Future Center",
  "IT & Technology",
  "Admissions",
] as const;

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const user = await requireCompleteProfile();
  const params = await searchParams;
  const query = params.q?.trim();
  const categoryFilter = params.category?.trim();

  const [allArticles, filteredArticles] = await Promise.all([
    listPublishedArticles(),
    listPublishedArticles({
      query: query || undefined,
      category: categoryFilter || undefined,
    }),
  ]);

  const isFiltering = Boolean(query || categoryFilter);
  const featured = allArticles.filter((a) => a.tags.includes("featured"));
  const categories = [
    ...new Set(
      allArticles
        .map((a) => a.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a as (typeof CATEGORY_ORDER)[number]);
    const bi = CATEGORY_ORDER.indexOf(b as (typeof CATEGORY_ORDER)[number]);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const articlesByCategory = groupByCategory(filteredArticles);

  return (
    <ShellPage
      title="Knowledge Vault"
      description="Campus guides, academy resources, and how-to documentation for Madonna students and families."
      actions={
        canManageKnowledge(user.role) ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/knowledge">Manage articles</Link>}
          />
        ) : undefined
      }
    >
      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1 space-y-1">
          <label htmlFor="knowledge-q" className="text-xs text-muted-foreground">
            Search guides
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="knowledge-q"
              name="q"
              defaultValue={query}
              placeholder="IT help, service hours, campus calendar…"
              className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pr-3 pl-9 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="knowledge-category" className="text-xs text-muted-foreground">
            Category
          </label>
          <select
            id="knowledge-category"
            name="category"
            defaultValue={categoryFilter ?? ""}
            className="flex h-9 min-w-[10rem] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
        {isFiltering ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/knowledge">Clear</Link>}
          />
        ) : null}
      </form>

      {!isFiltering && featured.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Star className="size-4 text-[#2F80ED]" />
            <h2 className="text-sm font-semibold">Featured guides</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.slice(0, 6).map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
          </div>
        </section>
      ) : null}

      {filteredArticles.length > 0 ? (
        <div className="mt-8 space-y-8">
          {isFiltering ? (
            <p className="text-sm text-muted-foreground">
              {filteredArticles.length} guide{filteredArticles.length === 1 ? "" : "s"}
              {query ? ` matching “${query}”` : ""}
              {categoryFilter ? ` in ${categoryFilter}` : ""}
            </p>
          ) : null}

          {isFiltering ? (
            <ul className="space-y-3">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </ul>
          ) : (
            categories.map((category) => {
              const items = articlesByCategory.get(category);
              if (!items?.length) return null;
              return (
                <section key={category}>
                  <h2 className="mb-3 text-sm font-semibold text-[#0A2342] dark:text-white">
                    {category}
                  </h2>
                  <ul className="space-y-3">
                    {items.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      ) : allArticles.length > 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No guides match your search</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try different keywords or browse all categories.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/knowledge">View all guides</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No guides published yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Run <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run db:seed</code> to
            load starter campus guides, or ask an administrator to publish articles.
          </p>
        </div>
      )}
    </ShellPage>
  );
}

function groupByCategory(
  articles: KnowledgeArticleListItem[],
): Map<string, KnowledgeArticleListItem[]> {
  const map = new Map<string, KnowledgeArticleListItem[]>();
  for (const article of articles) {
    const key = article.category ?? "General";
    const list = map.get(key) ?? [];
    list.push(article);
    map.set(key, list);
  }
  return map;
}

function ArticleCard({
  article,
  compact = false,
}: {
  article: KnowledgeArticleListItem;
  compact?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/knowledge/${article.slug}`}
        className={`flex items-start gap-3 rounded-xl border border-border bg-card transition-colors hover:border-[#2F80ED]/40 ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <BookOpen className="mt-0.5 size-5 shrink-0 text-[#0A2342] dark:text-white" />
        <div className="min-w-0">
          <p className={`font-medium ${compact ? "text-sm" : ""}`}>{article.title}</p>
          {!compact ? (
            <p className="text-sm text-muted-foreground">
              {[article.category, article.academyName, article.authorName]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{article.category}</p>
          )}
          {article.tags.length > 0 && !compact ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {article.tags.filter((t) => t !== "featured").join(", ")}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
