import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { getWriter, type GhostWriter } from "../../content/blog/writers";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  isBlogCategory,
  type BlogCategory,
  type BlogIndexPost,
} from "@/lib/blog-shared";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const RESERVED_SLUGS = new Set(["all"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_WEBP = /^\/blog\/[\w./-]+\.webp$/;

export type BlogPost = {
  title: string;
  date: string;
  readMinutes: number;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  featured: boolean;
  body: string;
  html: string;
  writer: GhostWriter;
  avatarSrc: string | null;
  heroSrc: string | null;
  ogImageSrc: string | null;
};

const REQUIRED_FIELDS = [
  "title",
  "authorId",
  "date",
  "readMinutes",
  "slug",
  "excerpt",
  "category",
] as const;

function parseFrontmatter(raw: string, filePath: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing YAML frontmatter in ${filePath}`);
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`Invalid frontmatter line in ${filePath}: ${line}`);
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2].trim() };
}

function requireFields(data: Record<string, string>, filePath: string) {
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      throw new Error(`Missing frontmatter "${field}" in ${filePath}`);
    }
  }
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("https://") || href.startsWith("#")) {
    return href;
  }
  return "#";
}

function renderInline(text: string) {
  const escaped = escapeHtml(text);
  return escaped
    .replaceAll(/`([^`]+)`/g, "<code>$1</code>")
    .replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replaceAll(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_full, label: string, href: string) =>
        `<a href="${escapeHtml(safeHref(href))}" class="underline">${label}</a>`,
    );
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      html.push(`<h3>${renderInline(line.slice(4))}</h3>`);
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      html.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      index += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      html.push(`<h1>${renderInline(line.slice(2))}</h1>`);
      index += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(`<li>${renderInline(lines[index].slice(2))}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(
        `<blockquote><p>${renderInline(quote.join(" ").trim())}</p></blockquote>`,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("#") &&
      !lines[index].startsWith("- ") &&
      !lines[index].startsWith(">")
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return html.join("");
}

function publicAssetIfPresent(pathname: string) {
  return existsSync(path.join(PUBLIC_DIR, pathname)) ? pathname : null;
}

function writerAvatarSrc(writerId: string) {
  return publicAssetIfPresent(`/blog/avatars/${writerId}.webp`);
}

function parseLocalWebp(
  value: string | undefined,
  filePath: string,
  field: "hero" | "ogImage",
) {
  if (!value) {
    return null;
  }
  if (!LOCAL_WEBP.test(value) || value.includes("..")) {
    throw new Error(`${field} must be a /blog/*.webp path in ${filePath}`);
  }
  return publicAssetIfPresent(value);
}

function toPost(
  data: Record<string, string>,
  body: string,
  filePath: string,
): BlogPost {
  requireFields(data, filePath);

  const slug = data.slug;
  const date = data.date;
  const readMinutes = Number.parseInt(data.readMinutes, 10);
  const filename = path.basename(filePath, ".md");
  const writer = getWriter(data.authorId);
  const category = data.category;

  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`Reserved blog slug "${slug}" in ${filePath}`);
  }
  if (filename !== slug) {
    throw new Error(`Slug "${slug}" must match filename ${filename}.md`);
  }
  if (!ISO_DATE.test(date)) {
    throw new Error(`date must be ISO YYYY-MM-DD in ${filePath}`);
  }
  if (!Number.isFinite(readMinutes) || readMinutes < 1) {
    throw new Error(`readMinutes must be a positive integer in ${filePath}`);
  }
  if (!isBlogCategory(category)) {
    throw new Error(
      `category must be one of projects, leaps, agents, deep-cuts in ${filePath}`,
    );
  }

  return {
    title: data.title,
    date,
    readMinutes,
    slug,
    excerpt: data.excerpt,
    category,
    featured: data.featured === "true",
    body,
    html: markdownToHtml(body),
    writer,
    avatarSrc: writerAvatarSrc(writer.id),
    heroSrc: parseLocalWebp(data.hero, filePath, "hero"),
    ogImageSrc: parseLocalWebp(data.ogImage, filePath, "ogImage"),
  };
}

export function toBlogIndexPost(post: BlogPost): BlogIndexPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    featured: post.featured,
    writerName: post.writer.name,
    avatarSrc: post.avatarSrc,
  };
}

export const getAllPosts = cache(async (): Promise<BlogPost[]> => {
  const files = (await readdir(BLOG_DIR)).filter((name) => name.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (name) => {
      const filePath = path.join(BLOG_DIR, name);
      const raw = await readFile(filePath, "utf8");
      const { data, body } = parseFrontmatter(raw, filePath);
      return toPost(data, body, filePath);
    }),
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});

export function moreByWriter(posts: readonly BlogPost[], current: BlogPost) {
  return posts.filter(
    (post) => post.writer.id === current.writer.id && post.slug !== current.slug,
  );
}

export function blogPostingGraph(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.writer.name,
      jobTitle: post.writer.role,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    url: `${SITE_URL}/blog/${post.slug}`,
  };
}
