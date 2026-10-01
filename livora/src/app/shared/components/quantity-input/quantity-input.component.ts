import { ChangeDetectionStrategy, Component, effect, input, model, untracked } from '@angular/core';

/**
 * Pill-shaped "− 1 +" quantity control (the WooCommerce product-page look). Two-way bindable:
 *
 *   <app-quantity-input [(value)]="qty" [min]="1" [max]="10" />
 *
 * Typing is allowed – valid numbers are applied immediately, anything else is clamped/restored on blur or Enter.
 */
@Component({
  selector: 'app-quantity-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quantity-input.component.html',
  styleUrl: './quantity-input.component.scss',
})
export class QuantityInputComponent {
  readonly value = model(1);
  readonly min = input(1);
  readonly max = input(99);
  /** Accessible name of the group / number field. */
  readonly label = input('Quantity');
  readonly disabled = input(false);

  constructor() {
    // keep an externally-set value (or a lowered `max`) inside the allowed range
    effect(() => {
      const current = this.value();
      const clamped = this.clamp(current);
      if (clamped !== current) {
        untracked(() => this.value.set(clamped));
      }
    });
  }

  protected step(delta: number): void {
    this.value.set(this.clamp(this.value() + delta));
  }

  /** Live update while typing – only accepts whole numbers inside the range. */
  protected onInput(event: Event): void {
    const n = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isInteger(n) && n >= this.min() && n <= this.max()) {
      this.value.set(n);
    }
  }

  /** Normalises whatever was typed (empty, 0, 500, 007, 2.7 …) and writes it back to the field. */
  protected commit(event: Event): void {
    const el = event.target as HTMLInputElement;
    const n = el.valueAsNumber;
    const next = Number.isFinite(n) ? this.clamp(Math.round(n)) : this.clamp(this.value());
    this.value.set(next);
    el.value = String(next);
  }

  private clamp(n: number): number {
    const min = this.min();
    const max = Math.max(min, this.max());
    return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
  }
}
