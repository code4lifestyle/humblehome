import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { imageVariant } from '@core/utils/image.utils';
import { MAIN_CATEGORIES } from '../admin-categories';
import { deleteStoredImages } from '../product-images';

type Tab = 'all' | (typeof MAIN_CATEGORIES)[number]['slug'];

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** `?category=` query param keeps the selected tab across edit → back. */
  readonly category = input<string>();

  protected readonly mainCategories = MAIN_CATEGORIES;
  protected readonly search = signal('');
  protected readonly pendingDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);
  protected readonly importing = signal(false);
  protected readonly source = this.products.source;

  constructor() {
    // pick up changes made from another device since the site was opened
    void this.products.load();
  }

  protected async importProducts(): Promise<void> {
    this.importing.set(true);
    try {
      await this.products.importBundled();
      this.toast.show(`${this.all().length} products were imported into the database.`);
    } catch (error) {
      this.toast.show((error as Error).message, { type: 'error', duration: 8000 });
    } finally {
      this.importing.set(false);
    }
  }

  protected readonly tab = computed<Tab>(() => {
    const value = this.category();
    return MAIN_CATEGORIES.some((c) => c.slug === value) ? (value as Tab) : 'all';
  });

  protected readonly all = computed(() => this.products.all());

  protected readonly stats = computed(() => [
    { label: 'All products', icon: 'fa-table-list', count: this.all().length },
    ...MAIN_CATEGORIES.map((c) => ({
      label: c.name,
      icon: c.icon,
      count: this.all().filter((p) => p.categories.includes(c.slug)).length,
    })),
  ]);

  protected readonly rows = computed(() => {
    const tab = this.tab();
    const term = this.search().trim().toLowerCase();
    return this.all()
      .filter((p) => tab === 'all' || p.categories.includes(tab))
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.slug.includes(term))
      .sort((a, b) => b.id - a.id);
  });

  protected thumb(p: Product): string {
    return imageVariant(p.images[0] ?? '', '300x300');
  }

  protected categoryNames(p: Product): string {
    return this.products
      .categoriesOf(p)
      .map((c) => c.name)
      .join(', ');
  }

  protected selectTab(tab: Tab): void {
    this.router.navigate([], { queryParams: { category: tab === 'all' ? null : tab }, replaceUrl: true });
  }

  protected async confirmDelete(): Promise<void> {
    const product = this.pendingDelete();
    if (!product || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    try {
      await this.products.remove(product.id);
      void deleteStoredImages(product.images);
      this.pendingDelete.set(null);
      this.toast.show(`“${product.name}” was deleted.`, { type: 'info' });
    } catch (error) {
      this.toast.show((error as Error).message, { type: 'error', duration: 8000 });
    } finally {
      this.deleting.set(false);
    }
  }
}
