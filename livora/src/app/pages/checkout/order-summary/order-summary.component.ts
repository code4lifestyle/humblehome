import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { imageVariant } from '@core/utils/image.utils';

/** One row of the order table – built from a cart line (checkout) or from a stored order item (order received). */
export interface OrderSummaryLine {
  key: string;
  name: string;
  slug: string;
  /** Base image path; omitted rows / `showImages = false` render text only. */
  image?: string;
  quantity: number;
  lineTotal: number;
  /** e.g. `Color: Black` */
  variation?: string;
}

/**
 * WooCommerce style order table: Product | Subtotal rows, then Subtotal, coupon, shipping, (payment method) and Total.
 *
 *   <app-order-summary [lines]="lines()" [subtotal]="cart.subtotal()" [discount]="cart.discount()"
 *                      [couponCode]="cart.coupon()?.code" [shipping]="cart.shipping()" [total]="cart.total()" />
 */
@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  readonly lines = input.required<OrderSummaryLine[]>();
  readonly subtotal = input.required<number>();
  readonly discount = input(0);
  readonly couponCode = input<string | null | undefined>(null);
  readonly shipping = input.required<number>();
  readonly total = input.required<number>();
  /** Adds a "Payment method" row when given (order received page). */
  readonly paymentTitle = input<string | null>(null);
  /** Product names link to the product page (order received) or stay plain text (checkout). */
  readonly linkProducts = input(false);
  readonly showImages = input(true);

  protected thumb(path: string): string {
    return imageVariant(path, '300x300');
  }
}
