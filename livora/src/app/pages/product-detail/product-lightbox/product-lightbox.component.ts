import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

/**
 * Full-screen image viewer (the original uses PhotoSwipe): dark backdrop, "1 / 4" counter, close button, prev / next
 * arrows and the full-size (1200px) image.
 *
 * Accessible modal dialog: focus moves into it on open and returns to the opener on close, Tab / Shift+Tab are
 * trapped, Escape closes, ← / → change the image, a click on the backdrop closes, the page does not scroll behind it
 * and a horizontal swipe changes the image on touch screens.
 *
 * The parent renders it with `@if` – it exists only while it is open:
 *   @if (open()) { <app-product-lightbox [images]="…" [alt]="…" [(index)]="i" (closed)="open.set(false)" /> }
 */
@Component({
  selector: 'app-product-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-lightbox.component.html',
  styleUrl: './product-lightbox.component.scss',
})
export class ProductLightboxComponent {
  /** Full-size image paths. */
  readonly images = input.required<string[]>();
  /** Product name – image k gets the alt text "<name>" / "<name> - Image k" like the original gallery. */
  readonly alt = input.required<string>();
  readonly index = model(0);
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');
  private readonly doc = inject(DOCUMENT);

  protected readonly count = computed(() => this.images().length);
  protected readonly src = computed(() => this.images()[this.index()] ?? '');
  protected readonly imageAlt = computed(() =>
    this.index() === 0 ? this.alt() : `${this.alt()} - Image ${this.index() + 1}`,
  );

  private swipeStart: number | null = null;

  constructor() {
    const opener = this.doc.activeElement as HTMLElement | null;
    const root = this.doc.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    afterNextRender(() =>
      this.dialog().nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus(),
    );

    inject(DestroyRef).onDestroy(() => {
      root.style.overflow = previousOverflow;
      if (opener && opener !== this.doc.body && this.doc.contains(opener)) {
        opener.focus();
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected step(delta: number): void {
    const n = this.count();
    if (n > 1) {
      this.index.set((this.index() + delta + n) % n);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.step(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.step(1);
        break;
      case 'Tab':
        this.trapFocus(event);
        break;
    }
  }

  /** Keeps Tab / Shift+Tab inside the dialog. */
  private trapFocus(event: KeyboardEvent): void {
    const focusable = Array.from(
      this.dialog().nativeElement.querySelectorAll<HTMLElement>('button:not([disabled])'),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.doc.activeElement;
    if (event.shiftKey && (active === first || !this.dialog().nativeElement.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (active === last || !this.dialog().nativeElement.contains(active))
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.swipeStart = event.pointerType === 'mouse' ? null : event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.swipeStart === null) {
      return;
    }
    const dx = event.clientX - this.swipeStart;
    this.swipeStart = null;
    if (Math.abs(dx) > 50) {
      this.step(dx < 0 ? 1 : -1);
    }
  }
}
