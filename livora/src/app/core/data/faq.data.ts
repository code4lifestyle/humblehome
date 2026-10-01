import { FaqGroup, FaqItem } from '../models';

/*
 * FAQ page content, verbatim from the original. The original repeats one placeholder answer for all five questions
 * of a group, so each group has a single answer constant. Group ids are the anchors of the side navigation.
 */

const GENERAL_ANSWER =
  'Humble Home offers a wide range of furniture including sofas, beds, dining tables, chairs, storage solutions, office furniture, and home décor accessories.';
const ORDERS_ANSWER =
  'Browse our furniture collections and explore products designed for every room and lifestyle. Once you find the items you love, add them to your shopping cart, review your selections, and proceed.';
const SHIPPING_ANSWER =
  'Most furniture orders are delivered within 5-10 business days, depending on your location, product availability, and delivery requirements.';
const RETURNS_ANSWER =
  'We want every customer to be completely satisfied with their furniture purchase. If for any reason you are not happy with your order, eligible products may be returned within the specified return period after delivery.';
const CARE_ANSWER =
  'For routine cleaning, use a slightly damp cloth along with a mild wood-safe cleaning solution, then immediately wipe the surface dry with a clean cloth to prevent moisture damage.';

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'general',
    title: 'General Questions',
    items: [
      { question: 'What types of furniture does Humble Home offer?', answer: GENERAL_ANSWER },
      { question: 'Do you provide custom furniture options?', answer: GENERAL_ANSWER },
      { question: 'What materials are used in Humble Home furniture?', answer: GENERAL_ANSWER },
      { question: 'Do you offer home delivery services?', answer: GENERAL_ANSWER },
      { question: 'How do I maintain my furniture?', answer: GENERAL_ANSWER },
    ],
  },
  {
    id: 'orders-payments',
    title: 'Orders & Payments',
    items: [
      { question: 'How can I place an order online?', answer: ORDERS_ANSWER },
      { question: 'What payment methods do you accept?', answer: ORDERS_ANSWER },
      { question: 'Can I modify my order after purchase?', answer: ORDERS_ANSWER },
      { question: 'Do you offer installment payment options?', answer: ORDERS_ANSWER },
      { question: 'Will I receive an order confirmation?', answer: ORDERS_ANSWER },
    ],
  },
  {
    id: 'shipping-delivery',
    title: 'Shipping & Delivery',
    items: [
      { question: 'How long does furniture delivery take?', answer: SHIPPING_ANSWER },
      { question: 'Do you offer free shipping services?', answer: SHIPPING_ANSWER },
      { question: 'Can I track my order online?', answer: SHIPPING_ANSWER },
      { question: 'Do you provide furniture assembly services?', answer: SHIPPING_ANSWER },
      { question: 'What happens if my delivery is delayed?', answer: SHIPPING_ANSWER },
    ],
  },
  {
    id: 'returns-warranty',
    title: 'Returns & Warranty',
    items: [
      { question: 'What is your return policy?', answer: RETURNS_ANSWER },
      { question: 'Can I exchange a damaged furniture item?', answer: RETURNS_ANSWER },
      { question: 'Do your products include a warranty?', answer: RETURNS_ANSWER },
      { question: 'How do I request a return?', answer: RETURNS_ANSWER },
      { question: 'What does the warranty cover?', answer: RETURNS_ANSWER },
    ],
  },
  {
    id: 'product-care',
    title: 'Product Care group',
    items: [
      { question: 'How should I clean wooden furniture?', answer: CARE_ANSWER },
      { question: 'How can I maintain upholstered furniture?', answer: CARE_ANSWER },
      { question: 'Should furniture be kept away from sunlight?', answer: CARE_ANSWER },
      { question: 'How do I protect furniture from scratches?', answer: CARE_ANSWER },
      { question: 'How often should I perform furniture maintenance?', answer: CARE_ANSWER },
    ],
  },
];

/** The accordion on About / Testimonials is identical to the "general" group (verified against the mirror). */
export const FAQ_PREVIEW: FaqItem[] = FAQ_GROUPS[0].items;
