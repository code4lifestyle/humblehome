import { SiteConfig } from '../models';

/**
 * Site-wide configuration copied from the original Livora header / footer (header template 148, footer template 153):
 * contact details, main navigation, footer columns, and social links.
 * Owner: shell agent.
 */
export const SITE_CONFIG: SiteConfig = {
  name: 'Humble Home',
  tagline:
    'Crafted with passion deliver elegant furniture experiences for modern homes and lifestyles.',
  // Footer / "Contact Information" values. The header's "Need Help ?" box has its own number (see `header` below).
  contact: {
    phone: '+971 52 230 7573',
    phoneHref: 'tel:+971522307573',
    email: 'enquiry@humblehomefurniture.com',
    address: 'United Arab Emirates',
    hours: 'Monday - Friday 10 AM - 8 PM',
  },

  logo: 'assets/images/humble-home-logo.svg',
  logoLight: 'assets/images/humble-home-logo-white.svg',

  social: [
    {
      name: 'facebook',
      url: 'https://www.facebook.com/profile.php?id=61592578437627',
      icon: 'fa-brands fa-facebook-f',
    },
    {
      name: 'instagram',
      url: 'https://www.instagram.com/humblehome.furniture/',
      icon: 'fa-brands fa-instagram',
    },
    {
      name: 'tiktok',
      url: 'https://www.tiktok.com/@humble.home8',
      icon: 'fa-brands fa-tiktok',
    },
    {
      name: 'whatsapp',
      url: 'https://wa.me/971522307573',
      icon: 'fa-brands fa-whatsapp',
    },
  ],

  header: {
    helpLabel: 'Need Help ?',
    helpPhone: '+971 52 230 7573',
    helpPhoneHref: 'https://wa.me/971522307573',
    searchPlaceholder: 'Search Your Product',
  },

  mainNav: [
    { label: 'Home', link: '/' },
    {
      label: 'Furniture',
      link: '/furniture',
      alsoActive: ['/product/', '/shop', '/product-category/'],
    },
    { label: 'Curtains', link: '/curtains' },
    { label: 'Marble', link: '/marble' },
    { label: 'Our Locations', link: '/our-locations' },
    { label: 'Contact Us', link: '/contact-us' },
  ],

  footer: {
    about:
      'Crafted with passion deliver elegant furniture experiences for modern homes and lifestyles.',
    quickLinksTitle: 'Quick Links',
    quickLinks: [
      { label: 'Home', link: '/' },
      { label: 'Furniture', link: '/furniture' },
      { label: 'Curtains', link: '/curtains' },
      { label: 'Marble', link: '/marble' },
      { label: 'Our Locations', link: '/our-locations' },
      { label: 'Contact Us', link: '/contact-us' },
    ],
    customerServicesTitle: 'Customer Services',
    customerServices: [
      { label: 'Shipping Information', link: ['/policy', 'delivery-policy'] },
      { label: 'Return Policy', link: ['/policy', 'refunds-returns-policy'] },
      { label: 'Cancellation Policy', link: ['/policy', 'cancellation-policy'] },
      { label: 'Privacy Policy', link: ['/policy', 'privacy-policy'] },
      { label: 'Terms & Conditions', link: ['/policy', 'terms-conditions'] },
    ],
    contactTitle: 'Contact Information',
    callLabel: 'Call 24/7',
    newsletterPlaceholder: 'Enter Email Address*',
    newsletterButtonLabel: 'Subscribe',
    copyrightYear: 2026,
  },
};
