/** Static copy of the About page blocks that are not part of the shared content services (text verbatim from the original). */

export interface OfferBanner {
  title: string;
  text: string;
  image: string;
  /** Discount shown in the round "Save 40%" tag. */
  save: string;
}

export interface OfferChip {
  label: string;
  image: string;
  /** Router link of the chip (the original chips are not links – they lead to the matching shop page here). */
  link: string | string[];
}

export interface VisionMissionCard {
  title: string;
  text: string;
  image: string;
}

/** "Best Offer / Where Comfort Meets Timeless Design": the two banners. */
export const OFFER_BANNERS: OfferBanner[] = [
  {
    title: 'Lounge Chair',
    text: 'Contemporary Chair Collections Inspired By Modern Living Room',
    image: 'assets/images/best-offer-image-1.png',
    save: '40%',
  },
  {
    title: 'Recliner Chair',
    text: 'Contemporary Chair Collections Inspired By Modern Living Room',
    image: 'assets/images/best-offer-image-2.png',
    save: '40%',
  },
];

/** The six round chips under the banners. Only "Living Room" has a matching category in the reduced catalog. */
export const OFFER_CHIPS: OfferChip[] = [
  {
    label: 'Living Room',
    image: 'assets/images/best-offer-product-1.jpg',
    link: ['/product-category', 'living-room'],
  },
  { label: 'Planters', image: 'assets/images/best-offer-product-2.jpg', link: '/shop' },
  { label: 'Gravel Rug', image: 'assets/images/best-offer-product-3.jpg', link: '/shop' },
  { label: 'Table Mirror', image: 'assets/images/best-offer-product-4.jpg', link: '/shop' },
  { label: 'Table Wears', image: 'assets/images/best-offer-product-5.jpg', link: '/shop' },
  { label: 'Chairs', image: 'assets/images/best-offer-product-6.jpg', link: '/shop' },
];

/** "Our Vision" / "Our Mission" cards (the mission text lacks its full stop and ends in "dedicate" in the original). */
export const VISION_MISSION: VisionMissionCard[] = [
  {
    title: 'Our Vision',
    text: 'Our vision is to create stylish, comfortable & high-quality furniture that enhance everyday living we are dedicated.',
    image: 'assets/images/vision-mission-item-image-1.jpg',
  },
  {
    title: 'Our Mission',
    text: 'Our mission is to create stylish, comfortable & high-quality furniture that enhance everyday living we are dedicate',
    image: 'assets/images/vision-mission-item-image-2.jpg',
  },
];
