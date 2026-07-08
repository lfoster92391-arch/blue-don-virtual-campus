"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageKnowledge } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  createKnowledgeArticle,
  updateArticleStatus,
} from "@/services/knowledge-service";
import type { KnowledgeArticleStatus } from "@/generated/prisma/client";

export type KnowledgeActionState = {
  error?: string;
  success?: string;
  articleId?: string;
};

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  content: z.string().trim().min(1, "Content is required"),
  category: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  academyId: z.string().optional(),
});

function revalidateKnowledgePaths(slug?: string) {
  revalidatePath("/knowledge");
  revalidatePath("/admin/knowledge");
  if (slug) {
    revalidatePath(`/knowledge/${slug}`);
  }
}

export async function createKnowledgeArticleAction(
  _prev: KnowledgeActionState,
  formData: FormData,
): Promise<KnowledgeActionState> {
  const user = await requireCompleteProfile();

  if (!canManageKnowledge(user.role)) {
    return { error: "You do not have permission to create articles." };
  }

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
    academyId: formData.get("academyId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid article data." };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const articleId = await createKnowledgeArticle({
    title: parsed.data.title,
    slug: parsed.data.slug,
    content: parsed.data.content,
    category: parsed.data.category,
    tags,
    authorId: user.id,
    academyId: parsed.data.academyId,
    status: "DRAFT",
  });

  if (!articleId) {
    return { error: "Unable to create article." };
  }

  revalidateKnowledgePaths(parsed.data.slug);
  return { success: "Article created as draft.", articleId };
}

export async function publishKnowledgeArticleAction(
  articleId: string,
  slug: string,
): Promise<KnowledgeActionState> {
  const user = await requireCompleteProfile();

  if (!canManageKnowledge(user.role)) {
    return { error: "You do not have permission to publish articles." };
  }

  const success = await updateArticleStatus(articleId, "PUBLISHED");

  if (!success) {
    return { error: "Unable to publish article." };
  }

  revalidateKnowledgePaths(slug);
  return { success: "Article published." };
}

export async function archiveKnowledgeArticleAction(
  articleId: string,
  slug: string,
): Promise<KnowledgeActionState> {
  const user = await requireCompleteProfile();

  if (!canManageKnowledge(user.role)) {
    return { error: "You do not have permission to archive articles." };
  }

  const success = await updateArticleStatus(articleId, "ARCHIVED");

  if (!success) {
    return { error: "Unable to archive article." };
  }

  revalidateKnowledgePaths(slug);
  return { success: "Article archived." };
}
