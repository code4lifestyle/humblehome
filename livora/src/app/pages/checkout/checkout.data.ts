import { PaymentMethodId } from '@core/models';

export interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  description: string;
}

/** Payment gateways of the demo checkout (WooCommerce default wording; the card option is a demo – nothing is charged). */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  {
    id: 'bacs',
    title: 'Direct bank transfer',
    description:
      'Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.',
  },
  {
    id: 'cod',
    title: 'Cash on delivery',
    description: 'Pay with cash upon delivery.',
  },
  {
    id: 'card',
    title: 'Credit / debit card (demo)',
    description:
      'Pay with your credit or debit card. This is a demo store: no card details are collected and nothing is charged.',
  },
];

export interface Country {
  code: string;
  name: string;
}

/** Country / Region select of the checkout. The first entry is the default (the store is in New York). */
export const COUNTRIES: readonly Country[] = [
  { code: 'US', name: 'United States (US)' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NO', name: 'Norway' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom (UK)' },
];
