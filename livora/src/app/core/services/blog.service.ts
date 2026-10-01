import { Injectable } from '@angular/core';
import { BLOG_CATEGORIES, BLOG_POSTS, BLOG_TAGS } from '../data/blog.data';
import { BlogCategory, BlogPost, BlogQuery, BlogTag, Paginated } from '../models';

const DEFAULT_PER_PAGE = 6;
/** Derived results (query, latest, related, adjacent) are cached; the key space is tiny, this only bounds odd URLs. */
const MAX_CACHED_RESULTS = 64;

/** Whole number ≥ `min`; anything that is not a finite number (e.g. NaN from a bad `?page=`) becomes `fallback`. */
const toInt = (value: number | undefined, fallback: number, min = 1): number =>
  Number.isFinite(value) ? Math.max(min, Math.floor(value as number)) : fallback;

const sharedCount = (a: readonly string[], b: readonly string[]): number =>
  a.filter((item) => b.includes(item)).length;

/**
 * Read-only access to the blog content (`core/data/blog.data.ts`). Synchronous and pure.
 *
 * Every method returns the same object/array instance for the same arguments, so results can be bound straight to
 * component inputs (`[posts]="blog.latest(3)"`) without tripping Angular's "changed after checked" dev check.
 * Treat the returned arrays and posts as immutable.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  /** Newest first. `Array#sort` is stable, so posts with the same date keep the order of the data file. */
  private readonly sorted: BlogPost[] = [...BLOG_POSTS].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  private readonly postsBySlug = new Map(this.sorted.map((post) => [post.slug, post]));

  private readonly categoryList = BLOG_CATEGORIES.map((category) => ({
    ...category,
    count: this.sorted.filter((post) => post.categories.includes(category.slug)).length,
  }));
  private readonly tagList = BLOG_TAGS.map((tag) => ({
    ...tag,
    count: this.sorted.filter((post) => post.tags.includes(tag.slug)).length,
  }));

  private readonly cache = new Map<string, unknown>();

  /** All posts, newest first. */
  posts(): BlogPost[] {
    return this.sorted;
  }

  bySlug(slug: string): BlogPost | undefined {
    return this.postsBySlug.get(slug);
  }

  /** All categories with the number of posts in each. */
  categories(): (BlogCategory & { count: number })[] {
    return this.categoryList;
  }

  categoryBySlug(slug: string): BlogCategory | undefined {
    return BLOG_CATEGORIES.find((category) => category.slug === slug);
  }

  /** All tags with the number of posts carrying each. */
  tags(): (BlogTag & { count: number })[] {
    return this.tagList;
  }

  tagBySlug(slug: string): BlogTag | undefined {
    return BLOG_TAGS.find((tag) => tag.slug === slug);
  }

  /**
   * Filter by category and/or tag (slugs), newest first, then paginate. `perPage` defaults to 6, `page` is 1-based and
   * clamped to 1…pages (an empty result has `pages: 1`). An unknown slug simply yields no posts.
   */
  query(q: BlogQuery = {}): Paginated<BlogPost> {
    const perPage = toInt(q.perPage, DEFAULT_PER_PAGE);
    const category = q.category ?? '';
    const tag = q.tag ?? '';
    const matches = this.memo(`matches:${category}|${tag}`, () =>
      this.sorted.filter(
        (post) =>
          (!category || post.categories.includes(category)) && (!tag || post.tags.includes(tag)),
      ),
    );
    const total = matches.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(toInt(q.page, 1), pages);

    return this.memo(`query:${category}|${tag}|${page}|${perPage}`, () => ({
      items: matches.slice((page - 1) * perPage, page * perPage),
      total,
      page,
      perPage,
      pages,
    }));
  }

  /** The newest posts (Home "Latest News" uses 3). */
  latest(limit = 3): BlogPost[] {
    return this.memo(`latest:${limit}`, () => this.sorted.slice(0, Math.max(0, limit)));
  }

  /** Neighbours in the newest-first order: `prev` is the next older post, `next` the next newer one. */
  adjacent(slug: string): { prev?: BlogPost; next?: BlogPost } {
    return this.memo(`adjacent:${slug}`, () => {
      const index = this.sorted.findIndex((post) => post.slug === slug);
      if (index < 0) return {};
      const result: { prev?: BlogPost; next?: BlogPost } = {};
      if (index + 1 < this.sorted.length) result.prev = this.sorted[index + 1];
      if (index > 0) result.next = this.sorted[index - 1];
      return result;
    });
  }

  /** Other posts sharing the most categories (weighted ×2) and tags with `post`, newest first on ties. Never `post` itself. */
  related(post: BlogPost, limit = 3): BlogPost[] {
    return this.memo(`related:${post.slug}:${limit}`, () =>
      this.sorted
        .filter((other) => other.slug !== post.slug)
        .map((other, index) => ({
          other,
          index,
          score:
            sharedCount(other.categories, post.categories) * 2 + sharedCount(other.tags, post.tags),
        }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, Math.max(0, limit))
        .map(({ other }) => other),
    );
  }

  /** Compute once per key, keep the first result (stable identity), forget the oldest entries beyond the cap. */
  private memo<T>(key: string, compute: () => T): T {
    if (this.cache.has(key)) return this.cache.get(key) as T;
    const value = compute();
    if (this.cache.size >= MAX_CACHED_RESULTS) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, value);
    return value;
  }
}
