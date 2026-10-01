import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Product, ProductReview } from '@core/models';
import { ProductReviewsComponent } from '../product-reviews/product-reviews.component';

type TabId = 'description' | 'additional' | 'reviews';

interface Tab {
  id: TabId;
  label: string;
}

/**
 * "Description | Additional information | Reviews (n)" tabs (WAI-ARIA tabs pattern: `tablist` / `tab` / `tabpanel`,
 * roving tabindex, ← → Home End move between the tabs and activate them).
 *
 *  - Description: paragraphs + feature bullets.
 *  - Additional information: attribute table – only for products with attributes (the variable ones).
 *  - Reviews: rating summary, review list and the "Add a review" form. Submitted reviews live in a local signal list
 *    (not stored anywhere), so the tab label, the average and the bars follow immediately.
 *
 * All panels stay in the DOM (inactive ones are `hidden`), so half-typed review text survives a tab change.
 */
@Component({
  selector: 'app-product-tabs',
  imports: [ProductReviewsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-tabs.component.html',
  styleUrl: './product-tabs.component.scss',
})
export class ProductTabsComponent {
  readonly product = input.required<Product>();

  protected readonly active = signal<TabId>('description');
  /** Reviews submitted through the form during this visit. */
  private readonly submitted = signal<ProductReview[]>([]);

  /** The original's reviews (oldest first) followed by the new ones. */
  protected readonly reviews = computed(() => [
    ...(this.product().reviews ?? []),
    ...this.submitted(),
  ]);
  protected readonly attributes = computed(() => this.product().attributes ?? []);

  protected readonly tabs = computed<Tab[]>(() => [
    { id: 'description', label: 'Description' },
    ...(this.attributes().length
      ? [{ id: 'additional' as const, label: 'Additional information' }]
      : []),
    { id: 'reviews', label: `Reviews (${this.reviews().length})` },
  ]);

  protected addReview(review: ProductReview): void {
    this.submitted.update((list) => [...list, review]);
  }

  protected select(id: TabId): void {
    this.active.set(id);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const tabs = this.tabs();
    let target: number;
    switch (event.key) {
      case 'ArrowRight':
        target = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        target = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(tabs[target].id);
    (event.currentTarget as HTMLElement).parentElement
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      [target]?.focus();
  }
}
