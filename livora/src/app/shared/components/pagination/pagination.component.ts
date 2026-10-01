import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Page numbers to render; `null` is an ellipsis. Keeps the width constant (7 slots) for long lists. */
function buildRange(page: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | null)[] = [1];
  const start = Math.max(2, Math.min(page - 1, total - 4));
  const end = Math.min(total - 1, Math.max(page + 1, 5));
  if (start > 2) items.push(null);
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push(null);
  items.push(total);
  return items;
}

/**
 * Numbered pagination (prev / 1 2 3 … 10 / next). Renders nothing when there is only one page.
 *
 *   <app-pagination [page]="page()" [pages]="result().pages" (pageChange)="goTo($event)" />
 *
 * `variant="load-more"` shows the single "Load More" pill the original shop uses instead; it emits
 * `pageChange(page + 1)` and disappears on the last page.
 */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  /** Current page, 1-based. */
  readonly page = input<number>(1);
  /** Total number of pages. */
  readonly pages = input<number>(1);
  readonly variant = input<'numbers' | 'load-more'>('numbers');
  readonly loadMoreLabel = input('Load More');
  /** Emits the requested page (never the current one, always within 1…pages). */
  readonly pageChange = output<number>();

  protected readonly current = computed(() =>
    Math.min(Math.max(1, Math.floor(this.page()) || 1), this.total()),
  );
  protected readonly total = computed(() => Math.max(1, Math.floor(this.pages()) || 1));
  protected readonly items = computed(() => buildRange(this.current(), this.total()));

  protected go(target: number): void {
    const next = Math.min(Math.max(1, target), this.total());
    if (next !== this.current()) {
      this.pageChange.emit(next);
    }
  }
}
