import { ProductCategory } from '../models';

/**
 * The 5 product categories of the reduced catalog, in the original's (alphabetical) order – the order of the shop
 * sidebar "Categories" filter. The original taxonomy pages carry no description text, so none is invented here.
 *
 * `image` = category tile picture:
 *  - living-room / bedroom / dining-room / office-furniture reuse the original home-page "Shop By Category" tiles
 *    (`category-item-image-1..4.jpg`, 180×180; the tile called "Office" there is the Office Furniture category);
 *  - luxury-collection has no tile in the original, so it uses the brown Chesterfield leather sofa photo
 *    `best-seller-img-4.jpg` (620×588) – the closest match to its leather / premium products.
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { slug: 'curtains', name: 'Curtains', image: 'assets/images/product-image-23.jpg' },
  { slug: 'furniture', name: 'Furniture', image: 'assets/images/category-item-image-1.jpg' },
  { slug: 'marble', name: 'Marble', image: 'assets/images/product-image-26.jpg' },
  { slug: 'bedroom', name: 'Bedroom', image: 'assets/images/category-item-image-2.jpg' },
  { slug: 'dining-room', name: 'Dining Room', image: 'assets/images/category-item-image-3.jpg' },
  { slug: 'living-room', name: 'Living Room', image: 'assets/images/category-item-image-1.jpg' },
  {
    slug: 'luxury-collection',
    name: 'Luxury Collection',
    image: 'assets/images/best-seller-img-4.jpg',
  },
  {
    slug: 'office-furniture',
    name: 'Office Furniture',
    image: 'assets/images/category-item-image-4.jpg',
  },
];
