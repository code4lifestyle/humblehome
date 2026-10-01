import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ProductReview } from '@core/models';
import { ToastService } from '@core/services/toast.service';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { scrollBehavior } from '../product-detail.utils';

const STARS = [1, 2, 3, 4, 5];
const BAR_ORDER = [5, 4, 3, 2, 1];
/** Names of the original "Your rating" options (5 Perfect … 1 Very poor), index = stars - 1. */
const STAR_LABELS = ['Very poor', 'Not that bad', 'Average', 'Good', 'Perfect'];

/** Rejects text that is only whitespace (Validators.required accepts "   "). */
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { blank: true };
}

/** something@something.tld – a little stricter than Angular's built-in `Validators.email`. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Content of the "Reviews (n)" tab (ShopEngine / WooCommerce reviews template): on the left the rating summary
 * (average, stars, "n Review(s)" and the 5 → 1 star bars) and the review list, on the right the "Add a review" form.
 *
 * The list comes from the parent (`reviews`); a valid form is turned into a `ProductReview` and emitted – the parent adds
 * it to its local list, nothing is stored anywhere.
 */
@Component({
  selector: 'app-product-reviews',
  imports: [ReactiveFormsModule, DatePipe, StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss',
})
export class ProductReviewsComponent {
  readonly productName = input.required<string>();
  readonly reviews = input.required<ProductReview[]>();
  readonly reviewSubmitted = output<ProductReview>();

  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly stars = STARS;
  protected readonly starLabels = STAR_LABELS;

  protected readonly form = inject(NonNullableFormBuilder).group({
    rating: [0, [Validators.min(1)]],
    comment: ['', [Validators.required, notBlank]],
    author: ['', [Validators.required, notBlank]],
    email: ['', [Validators.required, Validators.pattern(EMAIL)]],
    remember: [false],
  });

  /** Set by the first submit attempt: from then on every invalid field shows its message. */
  private readonly submitted = signal(false);
  /** Changes on every form event (value, touched, status, reset) – keeps the OnPush template in sync. */
  private readonly formEvents = toSignal(this.form.events);
  protected readonly rating = toSignal(this.form.controls.rating.valueChanges, { initialValue: 0 });
  /** Star under the pointer (0 = none) – previews the rating while choosing. */
  protected readonly hovered = signal(0);
  protected readonly shownStars = computed(() => this.hovered() || this.rating());

  /** Which messages are visible right now. */
  protected readonly errors = computed(() => {
    this.formEvents();
    const submitted = this.submitted();
    const controls = this.form.controls;
    const show = (control: AbstractControl): boolean =>
      control.invalid && (control.touched || submitted);
    return {
      rating: show(controls.rating),
      comment: show(controls.comment),
      author: show(controls.author),
      email: show(controls.email),
      emailFormat: show(controls.email) && !controls.email.hasError('required'),
    };
  });

  // ------------------------------------------------------------------- summary + list

  protected readonly count = computed(() => this.reviews().length);
  protected readonly average = computed(() => {
    const list = this.reviews();
    return list.length ? list.reduce((sum, review) => sum + review.rating, 0) / list.length : 0;
  });
  protected readonly averageText = computed(() => this.average().toFixed(2));
  /** "1 Review" / "2 Reviews". */
  protected readonly countLabel = computed(
    () => `${this.count()} ${this.count() === 1 ? 'Review' : 'Reviews'}`,
  );
  /** Share of the reviews per star, rounded like the original (5 star 100%, 4 star 0% …). */
  protected readonly bars = computed(() => {
    const list = this.reviews();
    return BAR_ORDER.map((star) => ({
      star,
      percent: list.length
        ? Math.round(
            (list.filter((review) => Math.round(review.rating) === star).length / list.length) *
              100,
          )
        : 0,
    }));
  });

  // ------------------------------------------------------------------- star input

  protected setRating(value: number): void {
    const control = this.form.controls.rating;
    control.setValue(value);
    control.markAsTouched();
  }

  /** Roving tabindex: the chosen star – or the first one – is the tab stop of the radio group. */
  protected tabStop(star: number): 0 | -1 {
    return star === (this.rating() || 1) ? 0 : -1;
  }

  /** Radio-group keys: arrows / Home / End choose the neighbouring star and move the focus with it. */
  protected onStarKey(event: KeyboardEvent, star: number): void {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(5, star + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = Math.max(1, star - 1);
        break;
      case 'Home':
        next = 1;
        break;
      case 'End':
        next = 5;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setRating(next);
    (event.currentTarget as HTMLElement).parentElement
      ?.querySelectorAll<HTMLElement>('[role="radio"]')
      [next - 1]?.focus();
  }

  // ------------------------------------------------------------------- submit

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const value = this.form.getRawValue();
    const review: ProductReview = {
      id: Date.now(),
      author: value.author.trim(),
      rating: value.rating,
      date: this.today(),
      content: value.comment.trim(),
    };
    this.reviewSubmitted.emit(review);
    this.toast.show('Thank you! Your review has been submitted.');

    // "Save my name, email…": keep the person's details for the next review
    this.form.reset({
      rating: 0,
      comment: '',
      author: value.remember ? value.author : '',
      email: value.remember ? value.email : '',
      remember: value.remember,
    });
    this.submitted.set(false);
    this.hovered.set(0);

    // on narrow screens the list sits above the form: bring the new review into view
    afterNextRender(
      () =>
        this.host.nativeElement
          .querySelector<HTMLElement>(`[data-review="${review.id}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() }),
      { injector: this.injector },
    );
  }

  private focusFirstInvalid(): void {
    const controls = this.form.controls;
    const root = this.host.nativeElement;
    const selector = controls.rating.invalid
      ? '.star[tabindex="0"]'
      : controls.comment.invalid
        ? '#review-comment'
        : controls.author.invalid
          ? '#review-author'
          : controls.email.invalid
            ? '#review-email'
            : null;
    if (selector) {
      root.querySelector<HTMLElement>(selector)?.focus();
    }
  }

  /** yyyy-MM-dd in local time (ProductReview.date is a calendar date). */
  private today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
}
