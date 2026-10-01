import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '@core/models';
import { BlogService } from '@core/services/blog.service';

/** 'home-styling' → 'Home Styling' (fallback when the blog service does not know the category). */
const prettify = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Blog post card.
 *
 *   <app-blog-card [post]="p" />                        blog list look: cream card, image on top, excerpt, "Read More"
 *   <app-blog-card [post]="p" variant="highlight" />    home "Latest News" – big image, text on a dark gradient
 *   <app-blog-card [post]="p" variant="row" />          home "Latest News" – small card, image left / text right
 *
 * Links to `/blog/:slug` (image, title, "Read More") and `/category/:slug` (category names).
 */
@Component({
  selector: 'app-blog-card',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
})
export class BlogCardComponent {
  readonly post = input.required<BlogPost>();
  readonly variant = input<'card' | 'highlight' | 'row'>('card');
  /** Date and category line above the title. */
  readonly showMeta = input(true);

  private readonly blog = inject(BlogService);

  protected readonly link = computed(() => ['/blog', this.post().slug]);
  protected readonly categories = computed(() =>
    this.post().categories.map((slug) => ({
      slug,
      name: this.blog.categoryBySlug(slug)?.name ?? prettify(slug),
    })),
  );
}
