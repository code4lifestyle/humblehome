/** The three store sections every product belongs to (also the site menu: /furniture, /curtains, /marble). */
export const MAIN_CATEGORIES = [
  { slug: 'furniture', name: 'Furniture', icon: 'fa-couch' },
  { slug: 'curtains', name: 'Curtains', icon: 'fa-person-booth' },
  { slug: 'marble', name: 'Marble', icon: 'fa-gem' },
] as const;

export type MainCategorySlug = (typeof MAIN_CATEGORIES)[number]['slug'];

export const isMainCategory = (slug: string): slug is MainCategorySlug =>
  MAIN_CATEGORIES.some((c) => c.slug === slug);
