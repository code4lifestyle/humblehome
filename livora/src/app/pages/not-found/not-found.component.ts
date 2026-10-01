import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';

/**
 * 404 page – `/404` and every unknown URL (`**`). Also shown (with `skipLocationChange`) for unknown blog posts,
 * blog categories / tags and policies.
 */
@Component({
  selector: 'app-not-found-page',
  imports: [PageHeaderComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  host: { 'data-page': 'not-found' },
})
export class NotFoundComponent {
  protected readonly crumbs: PageHeaderCrumb[] = [
    { label: 'Home', link: '/' },
    { label: '404 Error Page' },
  ];
}
