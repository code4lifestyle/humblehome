import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Product } from '../models';
import { readStorage, writeStorage } from './storage.util';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'livora.wishlist.v1';

/** Signal-based wishlist (product ids), persisted in localStorage. `has()` is reactive when used in templates. */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly toast = inject(ToastService);
  private readonly _ids = signal<number[]>(readStorage<number[]>(STORAGE_KEY, []));

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);

  constructor() {
    effect(() => writeStorage(STORAGE_KEY, this._ids()));
  }

  has(productId: number): boolean {
    return this._ids().includes(productId);
  }

  toggle(product: Product): void {
    if (this.has(product.id)) {
      this.remove(product.id);
      this.toast.show(`“${product.name}” has been removed from your wishlist.`, { type: 'info' });
    } else {
      this._ids.update((ids) => [...ids, product.id]);
      this.toast.show(`“${product.name}” has been added to your wishlist.`, {
        action: { label: 'View wishlist', link: '/wishlist' },
      });
    }
  }

  remove(productId: number): void {
    this._ids.update((ids) => ids.filter((id) => id !== productId));
  }

  clear(): void {
    this._ids.set([]);
  }
}
