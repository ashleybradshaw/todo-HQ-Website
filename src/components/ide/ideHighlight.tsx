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
  plain: "text-syn-property",
};

type Token = { kind: IdeTokenKind; text: string };

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

/** Lightweight markdown tokenizer for README.md source lines. */
export function tokenizeMarkdownLine(line: string): Token[] {
  if (line.length === 0) return [{ kind: "plain", text: "\u00a0" }];

  if (line.startsWith("<!--") || line.trimStart().startsWith("//")) {
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
      ...tokenizeInline(list[4]),
    ];
  }

  if (line.startsWith("|")) {
    return tokenizeInline(line);
  }

  return tokenizeInline(line);
}

function tokenizeInline(text: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\b[\w.]+\(\))|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([{}[\]().,;:|\\/\-→·]+)|(\s+)|([^\s`*[\]()"'0-9{}[\].,;:|\\/\-→·]+)/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const [
      ,
      code,
      bold,
      link,
      fn,
      str,
      num,
      punct,
      space,
      word,
    ] = match;

    if (code) tokens.push({ kind: "code", text: code });
    else if (bold) tokens.push({ kind: "bold", text: bold });
    else if (link) {
      // [label](href) — label muted-ish, href string tint
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
  }

  if (tokens.length === 0) pushPlain(tokens, text);
  return tokens;
}

/** Lightweight TypeScript-ish tokenizer for book.ts lines. */
export function tokenizeTsLine(line: string): Token[] {
  if (line.length === 0) return [{ kind: "plain", text: "\u00a0" }];
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return [{ kind: "comment", text: line }];
  }
  return tokenizeInline(line);
}

export function renderTokens(tokens: Token[]): ReactNode {
  return tokens.map((token, index) => (
    <span key={`${index}-${token.kind}`} className={TOKEN_CLASS[token.kind]}>
      {token.text}
    </span>
  ));
}
