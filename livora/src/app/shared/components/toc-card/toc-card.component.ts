import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { TOC_ARROW } from './toc-card.icons';

export interface TocItem {
  label: string;
  /** Element id on the current page (without '#'). */
  fragment: string;
}

/**
 * Table-of-contents card (list of in-page anchor links) of the FAQ page and the policy pages (sticky sidebar).
 * The links stay on the current route and set the URL fragment (`/faqs#shipping-delivery`).
 *
 *   <app-toc-card [items]="[{ label: 'General Questions', fragment: 'general' }]" />
 *   <app-toc-card [items]="…" [arrows]="true" />        <!-- FAQ page: with the up-right arrow on every entry -->
 *
 * Two looks of the original:
 *  · `arrows = false` (default, policy pages): plain entries, 15px spacing above/below every divider.
 *  · `arrows = true` (FAQ page): 20px up-right arrow at the end of each entry (turns 45° on hover), 20px spacing.
 * Additive optional input: `arrows`. The optional `title` renders a heading above the list (the original has none).
 *
 * Scrolling: the router's anchor scrolling uses `window.scrollTo(top)` and therefore ignores the global
 * `scroll-padding-top` (the sticky header would cover the target). While a card is on the page it re-aligns every
 * fragment target after the router scrolled – on clicks and on direct loads such as `/faqs#returns-warranty`.
 */
@Component({
  selector: 'app-toc-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toc-card.component.html',
  styleUrl: './toc-card.component.scss',
})
export class TocCardComponent {
  readonly items = input.required<TocItem[]>();
  readonly title = input<string>();
  /** Show the up-right arrow at the end of every entry (FAQ page look). */
  readonly arrows = input(false);

  protected readonly arrow = TOC_ARROW;
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event): event is Scroll => event instanceof Scroll && !!event.anchor),
        takeUntilDestroyed(),
      )
      // one task later, so this runs after the router's own (offset-less) scroll to the anchor
      .subscribe((event) => setTimeout(() => this.alignBelowHeader(event.anchor!)));
  }

  /**
   * The router ignores a navigation to the URL that is already active, so a second click on the same entry (after the
   * visitor scrolled away) would do nothing – in that case scroll to the target ourselves.
   */
  protected onLinkClick(fragment: string): void {
    if (this.document.location.hash === `#${fragment}`) {
      this.alignBelowHeader(fragment);
    }
  }

  /** Scroll so that the element with this id sits just below the sticky header (`scroll-padding-top` of `<html>`). */
  private alignBelowHeader(fragment: string): void {
    const view = this.document.defaultView;
    const target = this.document.getElementById(fragment);
    if (!view || !target) {
      return;
    }
    const padding =
      parseFloat(view.getComputedStyle(this.document.documentElement).scrollPaddingTop) || 0;
    const top = target.getBoundingClientRect().top + view.scrollY - padding;
    view.scrollTo({ top: Math.max(0, top) });
  }
}
