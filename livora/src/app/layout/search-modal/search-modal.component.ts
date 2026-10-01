import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { SITE_CONFIG } from '../../core/data/site.data';
import { LayoutService } from '../layout.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * Full-screen product search overlay ("Search Your Product"). Opened through `LayoutService.openSearch()`; submitting
 * navigates to `/shop?search=<text>` (the shop page reads the `search` query param).
 */
@Component({
  selector: 'app-search-modal',
  imports: [SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class SearchModalComponent {
  protected readonly layout = inject(LayoutService);
  private readonly router = inject(Router);

  protected readonly placeholder = SITE_CONFIG.header?.searchPlaceholder ?? 'Search Your Product';

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');

  constructor() {
    // focus the input once the overlay is visible (one frame later – it is still hidden in the current one)
    afterRenderEffect(() => {
      if (this.layout.searchOpen()) {
        const input = this.field().nativeElement;
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
      }
    });
  }

  protected submit(event: Event, value: string): void {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      this.field().nativeElement.focus();
      return;
    }
    this.layout.closeSearch(false);
    this.field().nativeElement.value = '';
    void this.router.navigate(['/shop'], { queryParams: { search: query } });
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.layout.closeSearch();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.layout.searchOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.layout.closeSearch();
      return;
    }
    if (event.key !== 'Tab') return;

    // keep the focus inside the dialog
    const focusable = Array.from(
      this.dialog().nativeElement.querySelectorAll<HTMLElement>('button, input'),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
