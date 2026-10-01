import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIconComponent } from '@layout/svg-icon/svg-icon.component';
import { Order } from '@core/models';
import { OrderSummaryComponent, OrderSummaryLine } from '../order-summary/order-summary.component';
import { PAYMENT_METHODS } from '../checkout.data';

/**
 * The WooCommerce "Order received" (thank-you) view: notice, overview strip, payment instructions, order details table
 * and the billing / shipping address. Rendered by `CheckoutComponent` at `/checkout` after an order was placed.
 */
@Component({
  selector: 'app-order-received',
  imports: [CurrencyPipe, DatePipe, RouterLink, SvgIconComponent, OrderSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-received.component.html',
  styleUrl: './order-received.component.scss',
})
export class OrderReceivedComponent {
  readonly order = input.required<Order>();

  private readonly notice = viewChild<ElementRef<HTMLElement>>('notice');

  protected readonly lines = computed<OrderSummaryLine[]>(() =>
    this.order().items.map((item) => ({
      key: `${item.productId}:${item.variation ?? ''}`,
      name: item.name,
      slug: item.slug,
      image: item.image,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      variation: item.variation,
    })),
  );

  /** Instructions that belong to the chosen payment method (WooCommerce prints them under the overview). */
  protected readonly paymentNote = computed(() => {
    const order = this.order();
    switch (order.payment.id) {
      case 'bacs':
        return `Make your payment directly into our bank account. Please use your order number (${order.id}) as the payment reference. Your order will not be shipped until the funds have cleared in our account.`;
      case 'card':
        return 'Your card payment was accepted. This is a demo store, so nothing was actually charged.';
      default:
        return (
          PAYMENT_METHODS.find((m) => m.id === order.payment.id)?.description ??
          'Pay with cash upon delivery.'
        );
    }
  });

  constructor() {
    // announce the confirmation to keyboard / screen-reader users (no scrolling: the page is at its top already)
    afterNextRender(() => this.notice()?.nativeElement.focus({ preventScroll: true }));
  }
}
