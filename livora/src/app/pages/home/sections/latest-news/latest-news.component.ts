import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlogService } from '@core/services/blog.service';
import { BlogCardComponent } from '@shared/components/blog-card/blog-card.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/**
 * "Latest News / Creative Furniture Styling Tips" – the newest post as a big photo card on the left, the next two as small
 * "image + text" cards on the right (`BlogService.latest(3)`, `app-blog-card` variants `highlight` and `row`).
 * Original: Elementor container a250c70.
 */
@Component({
  selector: 'app-home-latest-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitleComponent, BlogCardComponent],
  templateUrl: './latest-news.component.html',
  styleUrl: './latest-news.component.scss',
})
export class HomeLatestNewsComponent {
  private readonly posts = inject(BlogService).latest(3);

  protected readonly featured = this.posts[0];
  protected readonly others = this.posts.slice(1);
}
