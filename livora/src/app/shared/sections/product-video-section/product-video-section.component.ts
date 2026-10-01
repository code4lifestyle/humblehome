import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/** The YouTube video shown by the original site's play button. */
const VIDEO_ID = 'Y-x0efG1seA';

let nextRingId = 0;

/**
 * "Product Video / Watch Products Designed For Modern Living" – full-width background image with a rotating circular
 * text and a play button that opens the YouTube video in an accessible modal (native `<dialog>`: focus trap, ESC to
 * close, backdrop click to close, focus returns to the play button). The iframe only exists while the modal is open.
 * Used on Home and Testimonials.
 */
@Component({
  selector: 'app-product-video-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitleComponent],
  templateUrl: './product-video-section.component.html',
  styleUrl: './product-video-section.component.scss',
})
export class ProductVideoSectionComponent {
  private readonly document = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);

  /** Trusted once (a constant, first-party choice) so change detection never re-creates the iframe source. */
  protected readonly videoUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`,
  );

  /** Unique id of the circular text path (SVG ids are document-wide). */
  protected readonly ringId = `product-video-ring-${nextRingId++}`;

  /** True while the modal is open – the iframe is rendered only then, so closing it also stops the video. */
  protected readonly playing = signal(false);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.lockScroll(false));
  }

  protected open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;
    this.playing.set(true);
    dialog.showModal();
    this.lockScroll(true);
  }

  protected close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
  }

  /** Fired for Escape, the close button and `dialog.close()` alike. */
  protected onClosed(): void {
    this.playing.set(false);
    this.lockScroll(false);
  }

  /** A click on the dialog element itself (not its content) is a click on the backdrop. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  private lockScroll(lock: boolean): void {
    const body = this.document.body;
    if (lock) body.style.overflow = 'hidden';
    else body.style.removeProperty('overflow');
  }
}
