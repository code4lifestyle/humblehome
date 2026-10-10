import { DatePipe, DOCUMENT, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BlogPost } from '@core/models';
import { BlogService } from '@core/services/blog.service';
import { PageTitleService } from '@core/services/page-title.service';
import { BlogCardComponent } from '@shared/components/blog-card/blog-card.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/** 'space-saving' → 'Space Saving' (fallback when the blog service does not know a category / tag). */
const prettify = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** Length of the LinkedIn `summary` parameter (the original cuts the first paragraph after 250 characters). */
const SUMMARY_LENGTH = 250;

/**
 * Single blog post – `/blog/:slug`.
 *
 * Banner (title, date, category links) · featured image · article body from `post.body` (heading → h2, list → ul,
 * paragraph → p, quoted paragraph → blockquote) · tags + share links · previous / next post · related posts.
 * An unknown slug renders the 404 page (the URL is kept: `skipLocationChange`).
 */
@Component({
  selector: 'app-blog-detail-page',
  imports: [BlogCardComponent, DatePipe, RouterLink, SectionTitleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
})
export class BlogDetailComponent {
  /** `:slug` route parameter. */
  readonly slug = input<string>();

  private readonly blog = inject(BlogService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly document = inject(DOCUMENT);
  private readonly pageTitle = inject(PageTitleService);

  protected readonly post = computed(() => this.blog.bySlug(this.slug() ?? ''));

  protected readonly categories = computed(() =>
    (this.post()?.categories ?? []).map((slug) => ({
      slug,
      name: this.blog.categoryBySlug(slug)?.name ?? prettify(slug),
    })),
  );

  protected readonly tags = computed(() =>
    (this.post()?.tags ?? []).map((slug) => ({
      slug,
      name: this.blog.tagBySlug(slug)?.name ?? prettify(slug),
    })),
  );

  /** `prev` = the next older post, `next` = the next newer one. */
  protected readonly nav = computed(() => this.blog.adjacent(this.slug() ?? ''));

  protected readonly related = computed(() => {
    const post = this.post();
    return post ? this.blog.related(post, 3) : [];
  });

  /** Share links built from the absolute URL of this post (same networks and parameters as the original). */
  protected readonly share = computed(() => {
    const post = this.post();
    if (!post) return undefined;

    const path = this.location.prepareExternalUrl(
      this.router.serializeUrl(this.router.createUrlTree(['/blog', post.slug])),
    );
    const url = encodeURIComponent(new URL(path, this.document.location.href).href);
    const title = encodeURIComponent(post.title);
    const summary = encodeURIComponent(firstParagraph(post).slice(0, SUMMARY_LENGTH));

    return {
      facebook: `https://www.facebook.com/sharer.php?u=${url}&t=${title}`,
      whatsapp: `https://api.whatsapp.com/send?text=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`,
    };
  });

  constructor() {
    effect(() => {
      const post = this.post();
      if (post) {
        this.pageTitle.set(post.title, {
          description: firstParagraph(post).slice(0, 220),
          image: post.image,
        });
      } else {
        untracked(() => void this.router.navigateByUrl('/404', { skipLocationChange: true }));
      }
    });
  }
}

function firstParagraph(post: BlogPost): string {
  for (const block of post.body) {
    if (block.type === 'paragraph') return block.text;
  }
  return post.excerpt;
}
