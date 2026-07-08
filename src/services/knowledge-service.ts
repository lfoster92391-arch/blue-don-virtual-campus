import { isDatabaseConfigured } from "@/config/env";
import type { KnowledgeArticleStatus } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type KnowledgeArticleListItem = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[];
  status: KnowledgeArticleStatus;
  authorName: string;
  academyName: string | null;
  updatedAt: Date;
};

export type KnowledgeArticleDetail = KnowledgeArticleListItem & {
  content: string;
};

export async function listPublishedArticles(options?: {
  category?: string;
  academyId?: string;
  query?: string;
}): Promise<KnowledgeArticleListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const articles = await withDatabase((prisma) =>
    prisma.knowledgeArticle.findMany({
      where: {
        status: "PUBLISHED",
        category: options?.category,
        academyId: options?.academyId,
        ...(options?.query
          ? {
              OR: [
                { title: { contains: options.query, mode: "insensitive" as const } },
                { content: { contains: options.query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: {
        author: { select: { displayName: true, firstName: true, lastName: true, email: true } },
        academy: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  );

  if (!articles) {
    return [];
  }

  return articles.map(mapArticleListItem);
}

export async function listAllArticles(): Promise<KnowledgeArticleListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const articles = await withDatabase((prisma) =>
    prisma.knowledgeArticle.findMany({
      include: {
        author: { select: { displayName: true, firstName: true, lastName: true, email: true } },
        academy: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  );

  return articles?.map(mapArticleListItem) ?? [];
}

export async function getArticleBySlug(
  slug: string,
  includeDraft = false,
): Promise<KnowledgeArticleDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const article = await withDatabase((prisma) =>
    prisma.knowledgeArticle.findFirst({
      where: {
        slug,
        status: includeDraft ? undefined : "PUBLISHED",
      },
      include: {
        author: { select: { displayName: true, firstName: true, lastName: true, email: true } },
        academy: { select: { name: true } },
      },
    }),
  );

  if (!article) {
    return null;
  }

  return {
    ...mapArticleListItem(article),
    content: article.content,
  };
}

export async function createKnowledgeArticle(input: {
  title: string;
  slug: string;
  content: string;
  category?: string;
  tags?: string[];
  authorId: string;
  academyId?: string;
  status?: KnowledgeArticleStatus;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const article = await withDatabase((prisma) =>
    prisma.knowledgeArticle.create({
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        category: input.category,
        tags: input.tags ?? [],
        authorId: input.authorId,
        academyId: input.academyId,
        status: input.status ?? "DRAFT",
      },
      select: { id: true },
    }),
  );

  return article?.id ?? null;
}

export async function updateArticleStatus(
  id: string,
  status: KnowledgeArticleStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.knowledgeArticle.update({
      where: { id },
      data: { status },
    }),
  );

  return result !== null;
}

export async function searchCampus(query: string): Promise<{
  articles: KnowledgeArticleListItem[];
}> {
  const articles = await listPublishedArticles({ query });
  return { articles };
}

function mapArticleListItem(article: {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[];
  status: KnowledgeArticleStatus;
  updatedAt: Date;
  author: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  academy: { name: string } | null;
}): KnowledgeArticleListItem {
  const authorName =
    article.author.displayName ??
    [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") ??
    article.author.email;

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    tags: article.tags,
    status: article.status,
    authorName,
    academyName: article.academy?.name ?? null,
    updatedAt: article.updatedAt,
  };
}
