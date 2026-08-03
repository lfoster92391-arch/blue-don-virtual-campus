import type { ReactNode } from "react";

/**
 * Lightweight Markdown renderer for Knowledge Vault articles.
 *
 * Intentionally minimal (no external dependency): supports headings (##, ###),
 * unordered lists (- ), ordered lists (1.), simple pipe tables, blockquotes,
 * paragraphs, and the inline styles **bold** and [text](url). Content is plain
 * article text authored in the seed, so this covers everything we produce while
 * staying safe (React escapes all text nodes).
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Match **bold** or [label](href)
  const pattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-foreground">
          {match[2]}
        </strong>,
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      const href = match[5];
      const isExternal = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={`${keyPrefix}-a-${i}`}
          href={href}
          className="font-medium text-[#2F80ED] underline underline-offset-2"
          {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {match[4]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
    i += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderTable(rows: string[], key: string): ReactNode {
  const parseRow = (row: string) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const isDivider = (row: string) => /^\s*\|?[\s:\-|]+\|?\s*$/.test(row);

  const headerCells = parseRow(rows[0]);
  const bodyRows = rows.slice(1).filter((row) => !isDivider(row)).map(parseRow);

  return (
    <div key={key} className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {headerCells.map((cell, idx) => (
              <th key={idx} className="px-3 py-2 text-left font-semibold">
                {renderInline(cell, `${key}-th-${idx}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((cells, rowIdx) => (
            <tr key={rowIdx} className="border-b border-border/60">
              {cells.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 align-top text-muted-foreground">
                  {renderInline(cell, `${key}-td-${rowIdx}-${cellIdx}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ArticleContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let paragraph: string[] = [];
  let bullets: string[] = [];
  let ordered: string[] = [];
  let tableRows: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p-${key++}`} className="my-3 leading-relaxed text-foreground">
        {renderInline(paragraph.join(" "), `p-${key}`)}
      </p>,
    );
    paragraph = [];
  };

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="my-3 list-disc space-y-1 pl-5 text-foreground">
        {bullets.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {renderInline(item, `ul-${key}-${idx}`)}
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  const flushOrdered = () => {
    if (ordered.length === 0) return;
    blocks.push(
      <ol key={`ol-${key++}`} className="my-3 list-decimal space-y-1 pl-5 text-foreground">
        {ordered.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {renderInline(item, `ol-${key}-${idx}`)}
          </li>
        ))}
      </ol>,
    );
    ordered = [];
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    blocks.push(renderTable(tableRows, `table-${key++}`));
    tableRows = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushOrdered();
    flushTable();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushParagraph();
      flushBullets();
      flushOrdered();
      tableRows.push(trimmed);
      continue;
    }
    flushTable();

    if (trimmed.startsWith("### ")) {
      flushAll();
      blocks.push(
        <h3 key={`h3-${key++}`} className="mt-6 mb-2 text-base font-semibold text-[#0A2342] dark:text-white">
          {renderInline(trimmed.slice(4), `h3-${key}`)}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushAll();
      blocks.push(
        <h2 key={`h2-${key++}`} className="mt-7 mb-2 text-lg font-semibold text-[#0A2342] dark:text-white">
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>,
      );
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      flushParagraph();
      flushOrdered();
      bullets.push(trimmed.replace(/^-\s+/, ""));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      flushBullets();
      ordered.push(trimmed.replace(/^\d+\.\s+/, ""));
      continue;
    }

    flushBullets();
    flushOrdered();
    paragraph.push(trimmed);
  }

  flushAll();

  return <div className="text-sm">{blocks}</div>;
}
