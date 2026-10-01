import { Testimonial } from '../models';

/** The original repeats one placeholder quote for all six customers (testimonials page). */
const QUOTE =
  '“Premium craftsmanship, timeless designs, and outstanding customer service made this one of the best furniture purchases we’ve ever made for our home interiors.”';

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Olivia Bennett',
    role: 'Homeowner',
    avatar: 'assets/images/author-1.jpg',
    quote: QUOTE,
    rating: 5,
  },
  {
    name: 'Emma Wilson',
    role: 'Store Manager',
    avatar: 'assets/images/author-2.jpg',
    quote: QUOTE,
    rating: 5,
  },
  {
    name: 'Charlotte Taylor',
    role: 'Sales Executive',
    avatar: 'assets/images/author-3.jpg',
    quote: QUOTE,
    rating: 5,
  },
  {
    name: 'Amelia Johnson',
    role: 'Showroom Coordinator',
    avatar: 'assets/images/author-4.jpg',
    quote: QUOTE,
    rating: 5,
  },
  {
    name: 'Grace Thompson',
    role: 'Product Stylist',
    avatar: 'assets/images/author-5.jpg',
    quote: QUOTE,
    rating: 5,
  },
  {
    name: 'Isabella Martin',
    role: 'Operations Manager',
    avatar: 'assets/images/author-6.jpg',
    quote: QUOTE,
    rating: 5,
  },
];

/**
 * "Authorised Dealer" logo strip (About page). The logos carry no alt text in the original, so the names are neutral;
 * the artwork shows well-known retail marks (2 IKEA, 3 Pepperfry, 4 Roche Bobois, 5 Godrej).
 */
export const BRAND_LOGOS: { name: string; image: string }[] = [
  { name: 'Brand 1', image: 'assets/images/logo-brand-1.png' },
  { name: 'Brand 2', image: 'assets/images/logo-brand-2.png' },
  { name: 'Brand 3', image: 'assets/images/logo-brand-3.png' },
  { name: 'Brand 4', image: 'assets/images/logo-brand-4.png' },
  { name: 'Brand 5', image: 'assets/images/logo-brand-5.png' },
];
