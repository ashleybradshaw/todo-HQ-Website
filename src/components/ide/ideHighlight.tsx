import Link from "next/link";
import type { ReactNode } from "react";

export type IdeTokenKind =
  | "keyword"
  | "string"
  | "number"
  | "property"
  | "function"
  | "punct"
  | "comment"
  | "heading"
  | "bold"
  | "code"
  | "bullet"
  | "link"
  | "plain";

const TOKEN_CLASS: Record<IdeTokenKind, string> = {
  keyword: "text-syn-keyword",
  string: "text-syn-string",
  number: "text-syn-number",
  property: "text-syn-property",
  function: "text-[color:var(--blog-cat-agents)]",
  // Use syn-property (4.81:1 on canvas) — raw foreground@55% fails AA.
  punct: "text-syn-property",
  comment: "text-muted italic",
  heading: "text-foreground font-medium",
  bold: "text-foreground font-medium",
  code: "text-syn-string",
  bullet: "text-muted",
  link: "text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2",
  plain: "text-syn-property",
};

type Token =
  | { kind: Exclude<IdeTokenKind, "link">; text: string }
  | { kind: "link"; text: string; href: string; label: string };

const TS_KEYWORDS = new Set([
  "export",
  "const",
  "let",
  "var",
  "function",
  "return",
  "import",
  "from",
  "type",
  "as",
  "null",
  "undefined",
]);

const TS_LITERALS = new Set(["true", "false"]);

function pushPlain(tokens: Token[], text: string) {
  if (text.length > 0) tokens.push({ kind: "plain", text });
}

/** Emit any unmatched gap so characters like the `1` in `v1.5` are never dropped. */
function pushGap(tokens: Token[], text: string, from: number, to: number) {
  if (to > from) pushPlain(tokens, text.slice(from, to));
}

/** Lightweight markdown tokenizer for README.md / services.md source lines. */
export function tokenizeMarkdownLine(line: string): Token[] {
  if (line.length === 0) return [{ kind: "plain", text: "\u00a0" }];

  // HTML comments only — a leading `//` in prose stays plain.
  if (line.startsWith("<!--")) {
    return [{ kind: "comment", text: line }];
  }

  const heading = /^(#{1,6})(\s+)(.*)$/.exec(line);
  if (heading) {
    return [
      { kind: "heading", text: heading[1] },
      { kind: "plain", text: heading[2] },
      { kind: "heading", text: heading[3] },
    ];
  }

  const list = /^(\s*)([-*]|\d+\.)(\s+)(.*)$/.exec(line);
  if (list) {
    return [
      { kind: "plain", text: list[1] },
      { kind: "bullet", text: list[2] },
      { kind: "plain", text: list[3] },
      ...tokenizeMarkdownInline(list[4]),
    ];
  }

  if (line.startsWith("|")) {
    return tokenizeMarkdownInline(line);
  }

  return tokenizeMarkdownInline(line);
}

/** Markdown-only inline: no TS keywords, quote-strings, or comment rules.
 * Dots stay inside words so versions like `v1.5` are never split/dropped.
 */
function tokenizeMarkdownInline(text: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[([^\]]+)\]\(([^)]+)\))|([{}[\](),;:|\\/\-→·]+)|(\s+)|([^\s`*[\](){}[\],;:|\\/\-→·]+)/g;

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    pushGap(tokens, text, last, match.index);
    const [, code, bold, , linkLabel, linkHref, punct, space, word] = match;

    if (code) tokens.push({ kind: "code", text: code });
    else if (bold) tokens.push({ kind: "bold", text: bold });
    else if (linkLabel !== undefined && linkHref !== undefined) {
      tokens.push({
        kind: "link",
        text: match[3],
        label: linkLabel,
        href: linkHref,
      });
    } else if (punct) tokens.push({ kind: "punct", text: punct });
    else if (space) pushPlain(tokens, space);
    else if (word) tokens.push({ kind: "plain", text: word });

    last = match.index + match[0].length;
  }
  pushGap(tokens, text, last, text.length);

  if (tokens.length === 0) pushPlain(tokens, text);
  return tokens;
}

/** Lightweight TypeScript-ish tokenizer for book.ts lines. */
export function tokenizeTsLine(line: string): Token[] {
  if (line.length === 0) return [{ kind: "plain", text: "\u00a0" }];
  const trimmed = line.trimStart();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*")
  ) {
    return [{ kind: "comment", text: line }];
  }
  return tokenizeTsInline(line);
}

function tokenizeTsInline(text: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\b[\w.]+\(\))|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([{}[\]().,;:|\\/\-→·]+)|(\s+)|([^\s`*[\]()"'0-9{}[\].,;:|\\/\-→·]+)/g;

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    pushGap(tokens, text, last, match.index);
    const [, code, bold, link, fn, str, num, punct, space, word] = match;

    if (code) tokens.push({ kind: "code", text: code });
    else if (bold) tokens.push({ kind: "bold", text: bold });
    else if (link) {
      const parts = /^(\[[^\]]+\])(\([^)]+\))$/.exec(link);
      if (parts) {
        tokens.push({ kind: "property", text: parts[1] });
        tokens.push({ kind: "string", text: parts[2] });
      } else {
        tokens.push({ kind: "string", text: link });
      }
    } else if (fn) tokens.push({ kind: "function", text: fn });
    else if (str) tokens.push({ kind: "string", text: str });
    else if (num) tokens.push({ kind: "number", text: num });
    else if (punct) tokens.push({ kind: "punct", text: punct });
    else if (space) pushPlain(tokens, space);
    else if (word) {
      if (TS_KEYWORDS.has(word)) tokens.push({ kind: "keyword", text: word });
      else if (TS_LITERALS.has(word)) tokens.push({ kind: "number", text: word });
      else tokens.push({ kind: "plain", text: word });
    }

    last = match.index + match[0].length;
  }
  pushGap(tokens, text, last, text.length);

  if (tokens.length === 0) pushPlain(tokens, text);
  return tokens;
}

const linkClass = `${TOKEN_CLASS.link} rounded-[4px] transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none`;

export function renderTokens(tokens: Token[]): ReactNode {
  return tokens.map((token, index) => {
    const key = `${index}-${token.kind}`;
    if (token.kind === "link") {
      const internal = token.href.startsWith("/");
      if (internal) {
        return (
          <Link key={key} href={token.href} className={linkClass}>
            {token.text}
          </Link>
        );
      }
      return (
        <a
          key={key}
          href={token.href}
          className={linkClass}
          rel="noopener noreferrer"
        >
          {token.text}
        </a>
      );
    }
    return (
      <span key={key} className={TOKEN_CLASS[token.kind]}>
        {token.text}
      </span>
    );
  });
}
