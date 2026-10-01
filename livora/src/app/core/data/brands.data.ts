import { Brand } from '../models';

/**
 * The 5 product brands, in the original's (alphabetical) order – the order of the shop sidebar "Brands" filter.
 * The original brand archives (`brand/<slug>/`) have no description or logo, so none is set here (the
 * `logo-brand-*.png` files on the site are unrelated third-party logos, not these brands).
 */
export const BRANDS: Brand[] = [
  { slug: 'elite-comfort', name: 'Elite Comfort' },
  { slug: 'humble-home', name: 'Humble Home' },
  { slug: 'nordic-living', name: 'Nordic Living' },
  { slug: 'urbannest', name: 'UrbanNest' },
  { slug: 'woodcraft-studio', name: 'WoodCraft Studio' },
];
