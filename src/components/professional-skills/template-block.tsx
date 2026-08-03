"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SkillTemplate } from "@/config/professional-skills";

type TemplateBlockProps = {
  template: SkillTemplate;
};

export function TemplateBlock({ template }: TemplateBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-start justify-between gap-3 border-b border-border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-foreground">{template.title}</p>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-foreground">
        {template.content}
      </pre>
    </div>
  );
}
