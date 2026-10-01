import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
  /** Optional call-to-action link, e.g. { label: 'View cart', link: '/cart' } */
  action?: { label: string; link: string | any[] };
}

/** Tiny notification queue. `<app-toast-container>` (layout) renders it. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, options: { type?: Toast['type']; action?: Toast['action']; duration?: number } = {}): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, message, type: options.type ?? 'success', action: options.action }]);
    const duration = options.duration ?? 4500;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
