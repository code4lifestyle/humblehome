import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Product } from '@core/models';

type TabId = 'description' | 'additional';

interface Tab {
  id: TabId;
  label: string;
}

/**
 * "Description | Additional information" tabs (WAI-ARIA tabs pattern: `tablist` / `tab` / `tabpanel`,
 * roving tabindex, ← → Home End move between the tabs and activate them).
 *
 *  - Description: paragraphs + feature bullets.
 *  - Additional information: attribute table – only for products with attributes (the variable ones).
 */
@Component({
  selector: 'app-product-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-tabs.component.html',
  styleUrl: './product-tabs.component.scss',
})
export class ProductTabsComponent {
  readonly product = input.required<Product>();

  protected readonly active = signal<TabId>('description');
  protected readonly attributes = computed(() => this.product().attributes ?? []);

  protected readonly tabs = computed<Tab[]>(() => [
    { id: 'description', label: 'Description' },
    ...(this.attributes().length
      ? [{ id: 'additional' as const, label: 'Additional information' }]
      : []),
  ]);

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
