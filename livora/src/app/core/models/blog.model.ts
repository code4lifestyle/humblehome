export interface BlogCategory {
  slug: string;
  name: string;
}

export interface BlogTag {
  slug: string;
  name: string;
}

/** One block of an article body. */
export type BlogBlock =
  | {
      type: 'paragraph';
      text: string;
      /** `true` = the original renders this paragraph as a `<blockquote>` (pull quote). Plain paragraph otherwise. */
      quote?: boolean;
    }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] };

/** Query accepted by BlogService.query() – everything optional. */
export interface BlogQuery {
  /** Category slug. */
  category?: string;
  /** Tag slug. */
  tag?: string;
  /** 1-based, clamped to the available pages. */
  page?: number;
  /** Default 6. */
  perPage?: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Short teaser used on cards. */
  excerpt: string;
  /** Path relative to site root, e.g. assets/images/post-1-1024x576.jpg */
  image: string;
  /** ISO date. */
  date: string;
  author?: string;
  /** Category slugs (see BlogCategory.slug). */
  categories: string[];
  /** Tag slugs (see BlogTag.slug). */
  tags: string[];
  /** Article body in render order. */
  body: BlogBlock[];
}
