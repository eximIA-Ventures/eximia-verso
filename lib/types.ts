export interface Author {
  id: string;
  slug: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  role: string;
  socialLinks: Record<string, string>;
}

export interface AuthorRow {
  id: string;
  slug: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  role: string;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export function rowToAuthor(row: AuthorRow): Author {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    role: row.role,
    socialLinks: row.social_links ?? {},
  };
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  pillar: string;
  tags: string[];
  publishDate: string;
  author: string;
  authors: Author[];
  heroImage?: string;
  readingTime: number;
  status: "draft" | "published" | "archived";
  sources?: { title: string; url: string }[];
  content: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  pillar: string;
  tags: string[];
  publishDate: string;
  author: string;
  authors: Author[];
  heroImage?: string;
  readingTime: number;
  status: "draft" | "published" | "archived";
}

// DB row — mapeia colunas snake_case do Supabase
export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  pillar: string;
  tags: string[];
  publish_date: string | null;
  author: string;
  hero_image: string | null;
  reading_time: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
  sources: { title: string; url: string }[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Converter DB row para Article (camelCase)
export function rowToArticle(row: ArticleRow, authors: Author[] = []): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    pillar: row.pillar,
    tags: row.tags ?? [],
    publishDate: row.publish_date ?? "",
    author: row.author,
    authors,
    heroImage: row.hero_image ?? undefined,
    readingTime: row.reading_time,
    status: row.status,
    sources: row.sources ?? [],
    content: row.content,
  };
}

export function rowToMeta(row: ArticleRow, authors: Author[] = []): ArticleMeta {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    pillar: row.pillar,
    tags: row.tags ?? [],
    publishDate: row.publish_date ?? "",
    author: row.author,
    authors,
    heroImage: row.hero_image ?? undefined,
    readingTime: row.reading_time,
    status: row.status,
  };
}

export interface Pillar {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  pillar: string;
  angle: string;
  type: "pillar_article" | "cross_pillar" | "trend_commentary";
  status:
    | "planned"
    | "researched"
    | "writing"
    | "review"
    | "approved"
    | "adapting"
    | "published";
  scheduledDate: string;
  publishedDate?: string;
  researchBrief?: string;
  assignedAgent?: string;
  adaptations: {
    linkedin: { posts: number; status: string };
    x: { posts: number; threads: number; status: string };
  };
  tags: string[];
  notes?: string;
  metrics?: {
    articleWordCount?: number;
    linkedinPosts?: number;
    xPosts?: number;
    xThreads?: number;
  };
}
