import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SITE_CONFIG } from '../../core/data/site.data';
import { LayoutService } from '../layout.service';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

type OpenedBy = 'hover' | 'focus' | 'click';

/**
 * Desktop main navigation (≥ 1025px): Home · Shop (full-width mega menu) · Collection / Pages dropdowns · …
 * Menus open on hover, on keyboard focus and on click/tap (touch), close on Escape, on leaving and on every navigation.
 * `compact` = the slim variant inside the sticky bar (links fill the bar height, no trailing margin).
 */
@Component({
  selector: 'app-main-nav',
  imports: [RouterLink, RouterLinkActive, SvgIconComponent, MegaMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
  host: {
    '[class.is-compact]': 'compact()',
    '(keydown.escape)': 'close()',
  },
})
export class MainNavComponent {
  readonly compact = input(false);

  protected readonly layout = inject(LayoutService);
  protected readonly items = SITE_CONFIG.mainNav;
  /** Index of the item whose dropdown / mega panel is open. */
  protected readonly open = signal<number | null>(null);

  private openedBy: OpenedBy | null = null;
  private wasOpenOnPointerDown = false;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.close());
  }

  protected close(): void {
    this.open.set(null);
    this.openedBy = null;
  }

  protected show(index: number, by: OpenedBy): void {
    this.open.set(index);
    this.openedBy = by;
  }

  protected onEnter(index: number): void {
    this.show(index, 'hover');
  }

  protected onLeave(index: number): void {
    if (this.open() === index) this.close();
  }

  protected onFocusIn(index: number): void {
    if (this.open() !== index) this.show(index, 'focus');
  }

  protected onFocusOut(event: FocusEvent, index: number): void {
    const next = event.relatedTarget as Node | null;
    if (this.open() === index && !(event.currentTarget as HTMLElement).contains(next)) this.close();
  }

  /** Button parents (Collection, Pages): click/tap toggles, hover/focus already opened it. */
  protected toggle(index: number): void {
    if (this.open() === index && this.openedBy === 'click') {
      this.close();
    } else {
      this.show(index, 'click');
    }
  }

  protected onTopLinkPointerDown(index: number): void {
    this.wasOpenOnPointerDown = this.open() === index;
  }

  /** Link parents (Shop): on touch devices the first tap only opens the mega menu, the second one follows the link. */
  protected onTopLinkClick(event: MouseEvent, index: number): void {
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover && !this.wasOpenOnPointerDown) {
      event.preventDefault();
      this.show(index, 'click');
    }
  }
}
