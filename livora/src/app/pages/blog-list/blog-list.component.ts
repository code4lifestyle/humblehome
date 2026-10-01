import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '@core/services/blog.service';
import { PageTitleService } from '@core/services/page-title.service';
import { BlogCardComponent } from '@shared/components/blog-card/blog-card.component';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

/** Posts per page (the blog service's default; the original theme shows 6 as well). */
const PER_PAGE = 6;

interface ListView {
  /** Banner `<h1>`. */
  title: string;
  /** Browser-tab title (without the site name). */
  pageTitle: string;
  crumbs: PageHeaderCrumb[];
}

/**
 * Blog archive – `/blog`, `/category/:slug` and `/tag/:slug` (one component, route `data.mode`).
 *
 * Route inputs (`withComponentInputBinding`): `mode` (route data), `slug` (path param), `page` (`?page=`).
 * An unknown category / tag renders the 404 page (the URL is kept: `skipLocationChange`).
 */
@Component({
  selector: 'app-blog-list-page',
  imports: [BlogCardComponent, PageHeaderComponent, PaginationComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
})
export class BlogListComponent {
  readonly mode = input<'blog' | 'category' | 'tag'>('blog');
  readonly slug = input<string>();
  readonly page = input<string>();

  private readonly blog = inject(BlogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pageTitle = inject(PageTitleService);

  /** Heading data of the current archive; `undefined` = unknown category / tag (→ 404). */
  protected readonly view = computed<ListView | undefined>(() => {
    const slug = this.slug() ?? '';
    const home: PageHeaderCrumb = { label: 'Home', link: '/' };
    const blog: PageHeaderCrumb = { label: 'Blog', link: '/blog' };

    switch (this.mode()) {
      case 'category': {
        const category = this.blog.categoryBySlug(slug);
        return category
          ? {
              title: category.name,
              pageTitle: category.name,
              crumbs: [home, blog, { label: category.name }],
            }
          : undefined;
      }
      case 'tag': {
        const tag = this.blog.tagBySlug(slug);
        return tag
          ? {
              title: `Tag: ${tag.name}`,
              pageTitle: tag.name,
              crumbs: [home, blog, { label: tag.name }],
            }
          : undefined;
      }
      default:
        return { title: 'Our Blog', pageTitle: 'Blog', crumbs: [home, { label: 'Blog' }] };
    }
  });

  /** The posts of the current page (a bad / out-of-range `?page=` is clamped by the service). */
  protected readonly result = computed(() =>
    this.blog.query({
      category: this.mode() === 'category' ? this.slug() : undefined,
      tag: this.mode() === 'tag' ? this.slug() : undefined,
      page: Number(this.page()),
      perPage: PER_PAGE,
    }),
  );

  constructor() {
    effect(() => {
      const view = this.view();
      if (view) {
        this.pageTitle.set(view.pageTitle);
      } else {
        untracked(() => void this.router.navigateByUrl('/404', { skipLocationChange: true }));
      }
    });
  }

  /** `?page=n` (page 1 = no query parameter), any other query parameter is kept. */
  protected goTo(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }
}
