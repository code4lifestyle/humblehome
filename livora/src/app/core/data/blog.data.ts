import { BlogCategory, BlogPost, BlogTag } from '../models';

/*
 * Blog content of the original Livora site: 4 of its 6 posts, extracted from the static mirror and kept verbatim
 * (titles, excerpts, dates and the placeholder article text). The originals share the same article text and carry
 * no author; each post nevertheless owns its body so they can diverge.
 */

export const BLOG_CATEGORIES: BlogCategory[] = [{ slug: 'uncategorized', name: 'Uncategorized' }];

export const BLOG_TAGS: BlogTag[] = [
  { slug: 'luxury', name: 'Luxury' },
  { slug: 'performance', name: 'Performance' },
  { slug: 'quality', name: 'Quality' },
];

/**
 * Newest first, in the order of the original blog page. All posts are dated June 22, 2026, so BlogService keeps this
 * order for equal dates.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'modern-interior-trends',
    title: 'Modern Interior Trends',
    excerpt: 'A watch is far more than a simple tool for telling time […]',
    image: 'assets/images/post-1-1024x576.jpg',
    date: '2026-06-22',
    categories: ['uncategorized'],
    tags: ['luxury', 'performance', 'quality'],
    body: [
      {
        type: 'paragraph',
        text: 'A watch is far more than a simple tool for telling time — it represents craftsmanship, precision, and personal style. Whether it’s a luxury timepiece passed down through generations or a modern watch worn daily, each piece carries its own value and significance. Over time, however, even the finest watches can lose their accuracy and appearance if not properly maintained.',
      },
      {
        type: 'paragraph',
        text: 'Maintaining your watch is not just about preserving its look, but also about protecting the intricate mechanisms that keep it running smoothly. From delicate internal components to the exterior finish, every part requires attention to ensure long-term reliability. A well-maintained watch not only performs better but also retains its elegance and durability over the years.',
      },
      {
        type: 'paragraph',
        text: 'Caring for your furniture with regular cleaning and proper maintenance helps preserve its beauty, comfort, and durability. With premium-quality craftsmanship, Humble Home furniture is designed to elevate your home with timeless elegance and everyday functionality.',
        quote: true,
      },
      {
        type: 'paragraph',
        text: 'A well-designed home creates a welcoming and relaxing atmosphere for family and guests. Whether you prefer modern minimalism or luxurious interiors, selecting the right furniture enhances both style and comfort. At Humble Home, we focus on delivering elegant furniture collections that perfectly blend aesthetics, quality, and functionality.',
      },
      { type: 'heading', text: 'Create living space' },
      {
        type: 'paragraph',
        text: 'When choosing furniture, focus on quality materials, practical design, and comfort. Premium furniture not only enhances your interior but also creates a relaxing and stylish environment for everyday living.',
      },
      {
        type: 'list',
        items: [
          'Choose durable furniture crafted with premium-quality materials.',
          'Keep furniture clean and protected to maintain its elegant finish.',
          'Select modern designs that match your home interior beautifully.',
          'Use comfortable seating and functional storage for better living.',
          'Add stylish décor elements to create a warm and inviting atmosphere.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At Humble Home, we believe every home deserves furniture that combines comfort, beauty, and modern craftsmanship. Our collections are designed to transform your spaces into elegant and functional living environments.',
      },
    ],
  },
  {
    slug: 'home-styling-tips',
    title: 'Home Styling Tips',
    excerpt: 'A watch is far more than a simple tool for telling time […]',
    image: 'assets/images/post-2-1024x576.jpg',
    date: '2026-06-22',
    categories: ['uncategorized'],
    tags: ['luxury', 'performance', 'quality'],
    body: [
      {
        type: 'paragraph',
        text: 'A watch is far more than a simple tool for telling time — it represents craftsmanship, precision, and personal style. Whether it’s a luxury timepiece passed down through generations or a modern watch worn daily, each piece carries its own value and significance. Over time, however, even the finest watches can lose their accuracy and appearance if not properly maintained.',
      },
      {
        type: 'paragraph',
        text: 'Maintaining your watch is not just about preserving its look, but also about protecting the intricate mechanisms that keep it running smoothly. From delicate internal components to the exterior finish, every part requires attention to ensure long-term reliability. A well-maintained watch not only performs better but also retains its elegance and durability over the years.',
      },
      {
        type: 'paragraph',
        text: 'Caring for your furniture with regular cleaning and proper maintenance helps preserve its beauty, comfort, and durability. With premium-quality craftsmanship, Humble Home furniture is designed to elevate your home with timeless elegance and everyday functionality.',
        quote: true,
      },
      {
        type: 'paragraph',
        text: 'A well-designed home creates a welcoming and relaxing atmosphere for family and guests. Whether you prefer modern minimalism or luxurious interiors, selecting the right furniture enhances both style and comfort. At Humble Home, we focus on delivering elegant furniture collections that perfectly blend aesthetics, quality, and functionality.',
      },
      { type: 'heading', text: 'Create living space' },
      {
        type: 'paragraph',
        text: 'When choosing furniture, focus on quality materials, practical design, and comfort. Premium furniture not only enhances your interior but also creates a relaxing and stylish environment for everyday living.',
      },
      {
        type: 'list',
        items: [
          'Choose durable furniture crafted with premium-quality materials.',
          'Keep furniture clean and protected to maintain its elegant finish.',
          'Select modern designs that match your home interior beautifully.',
          'Use comfortable seating and functional storage for better living.',
          'Add stylish décor elements to create a warm and inviting atmosphere.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At Humble Home, we believe every home deserves furniture that combines comfort, beauty, and modern craftsmanship. Our collections are designed to transform your spaces into elegant and functional living environments.',
      },
    ],
  },
  {
    slug: 'furniture-care-guides',
    title: 'Furniture Care Guides',
    excerpt: 'A watch is far more than a simple tool for telling time […]',
    image: 'assets/images/post-3-1024x576.jpg',
    date: '2026-06-22',
    categories: ['uncategorized'],
    tags: ['luxury', 'performance', 'quality'],
    body: [
      {
        type: 'paragraph',
        text: 'A watch is far more than a simple tool for telling time — it represents craftsmanship, precision, and personal style. Whether it’s a luxury timepiece passed down through generations or a modern watch worn daily, each piece carries its own value and significance. Over time, however, even the finest watches can lose their accuracy and appearance if not properly maintained.',
      },
      {
        type: 'paragraph',
        text: 'Maintaining your watch is not just about preserving its look, but also about protecting the intricate mechanisms that keep it running smoothly. From delicate internal components to the exterior finish, every part requires attention to ensure long-term reliability. A well-maintained watch not only performs better but also retains its elegance and durability over the years.',
      },
      {
        type: 'paragraph',
        text: 'Caring for your furniture with regular cleaning and proper maintenance helps preserve its beauty, comfort, and durability. With premium-quality craftsmanship, Humble Home furniture is designed to elevate your home with timeless elegance and everyday functionality.',
        quote: true,
      },
      {
        type: 'paragraph',
        text: 'A well-designed home creates a welcoming and relaxing atmosphere for family and guests. Whether you prefer modern minimalism or luxurious interiors, selecting the right furniture enhances both style and comfort. At Humble Home, we focus on delivering elegant furniture collections that perfectly blend aesthetics, quality, and functionality.',
      },
      { type: 'heading', text: 'Create living space' },
      {
        type: 'paragraph',
        text: 'When choosing furniture, focus on quality materials, practical design, and comfort. Premium furniture not only enhances your interior but also creates a relaxing and stylish environment for everyday living.',
      },
      {
        type: 'list',
        items: [
          'Choose durable furniture crafted with premium-quality materials.',
          'Keep furniture clean and protected to maintain its elegant finish.',
          'Select modern designs that match your home interior beautifully.',
          'Use comfortable seating and functional storage for better living.',
          'Add stylish décor elements to create a warm and inviting atmosphere.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At Humble Home, we believe every home deserves furniture that combines comfort, beauty, and modern craftsmanship. Our collections are designed to transform your spaces into elegant and functional living environments.',
      },
    ],
  },
  {
    slug: 'space-saving-ideas',
    title: 'Space-Saving Ideas',
    excerpt: 'A watch is far more than a simple tool for telling time […]',
    image: 'assets/images/post-4-1024x576.jpg',
    date: '2026-06-22',
    categories: ['uncategorized'],
    tags: ['luxury', 'performance', 'quality'],
    body: [
      {
        type: 'paragraph',
        text: 'A watch is far more than a simple tool for telling time — it represents craftsmanship, precision, and personal style. Whether it’s a luxury timepiece passed down through generations or a modern watch worn daily, each piece carries its own value and significance. Over time, however, even the finest watches can lose their accuracy and appearance if not properly maintained.',
      },
      {
        type: 'paragraph',
        text: 'Maintaining your watch is not just about preserving its look, but also about protecting the intricate mechanisms that keep it running smoothly. From delicate internal components to the exterior finish, every part requires attention to ensure long-term reliability. A well-maintained watch not only performs better but also retains its elegance and durability over the years.',
      },
      {
        type: 'paragraph',
        text: 'Caring for your furniture with regular cleaning and proper maintenance helps preserve its beauty, comfort, and durability. With premium-quality craftsmanship, Humble Home furniture is designed to elevate your home with timeless elegance and everyday functionality.',
        quote: true,
      },
      {
        type: 'paragraph',
        text: 'A well-designed home creates a welcoming and relaxing atmosphere for family and guests. Whether you prefer modern minimalism or luxurious interiors, selecting the right furniture enhances both style and comfort. At Humble Home, we focus on delivering elegant furniture collections that perfectly blend aesthetics, quality, and functionality.',
      },
      { type: 'heading', text: 'Create living space' },
      {
        type: 'paragraph',
        text: 'When choosing furniture, focus on quality materials, practical design, and comfort. Premium furniture not only enhances your interior but also creates a relaxing and stylish environment for everyday living.',
      },
      {
        type: 'list',
        items: [
          'Choose durable furniture crafted with premium-quality materials.',
          'Keep furniture clean and protected to maintain its elegant finish.',
          'Select modern designs that match your home interior beautifully.',
          'Use comfortable seating and functional storage for better living.',
          'Add stylish décor elements to create a warm and inviting atmosphere.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At Humble Home, we believe every home deserves furniture that combines comfort, beauty, and modern craftsmanship. Our collections are designed to transform your spaces into elegant and functional living environments.',
      },
    ],
  },
];
