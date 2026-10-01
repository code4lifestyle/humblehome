import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface PageHeaderCrumb {
  label: string;
  /** Router link of the crumb. Omit for the current page (last crumb). */
  link?: string | any[];
}

/**
 * Inner-page banner: `page-header-bg-image.jpg` behind a 60 % dark overlay, centred white 64px/900 `<h1>`,
 * optional description and a breadcrumb trail (`Home / Shop`).
 *
 *   <app-page-header title="Shop" [crumbs]="[{ label: 'Home', link: '/' }, { label: 'Shop' }]" />
 */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  /** Breadcrumb trail; the last entry is the current page and is rendered without a link. */
  readonly crumbs = input<PageHeaderCrumb[]>([]);
  readonly description = input<string>();
  /** Optional photo behind the title. The default banner is used when this is empty. */
  readonly image = input<string>();

  protected readonly backgroundImage = computed(() => {
    const image = this.image();
    if (!image) {
      return null;
    }
    const path = image.startsWith('/') ? image : `/${image}`;
    return `url("${path}")`;
  });
}
