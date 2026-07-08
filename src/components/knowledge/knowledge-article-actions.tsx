"use client";

import { useTransition } from "react";

import {
  archiveKnowledgeArticleAction,
  publishKnowledgeArticleAction,
} from "@/features/knowledge/actions";
import { Button } from "@/components/ui/button";
import type { KnowledgeArticleStatus } from "@/generated/prisma/client";

export function KnowledgeArticleActions({
  articleId,
  slug,
  status,
}: {
  articleId: string;
  slug: string;
  status: KnowledgeArticleStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {status !== "PUBLISHED" ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await publishKnowledgeArticleAction(articleId, slug);
            })
          }
        >
          Publish
        </Button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await archiveKnowledgeArticleAction(articleId, slug);
            })
          }
        >
          Archive
        </Button>
      ) : null}
    </div>
  );
}
