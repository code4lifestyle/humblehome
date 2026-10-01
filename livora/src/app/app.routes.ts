import { Routes } from '@angular/router';

/**
 * ROUTE MAP  (≈ 40 original WordPress URLs collapse into 14 lazy page components)
 *
 *  /                          Home
 *  /about-us                  About
 *  /shop                      Shop            data.mode = 'shop'      all products
 *  /product-category/:slug    Shop            data.mode = 'category'  one category
 *  /brand/:slug               Shop            data.mode = 'brand'     one brand
 *  /product/:slug             ProductDetail
 *  /cart  /checkout  /wishlist
 *  /my-account                Account         data.view = 'auth'            (login + register)
 *  /my-account/lost-password  Account         data.view = 'lost-password'
 *  /blog                      BlogList        data.mode = 'blog'
 *  /category/:slug            BlogList        data.mode = 'category'
 *  /tag/:slug                 BlogList        data.mode = 'tag'
 *  /blog/:slug                BlogDetail
 *  /contact-us  /faqs  /testimonials
 *  /policy/:slug              Policy          privacy-policy | terms-conditions | cancellation-policy | delivery-policy | refunds-returns-policy
 *  /404  and  **              NotFound
 *
 * Route params, query params and `data` are bound to component `input()`s (withComponentInputBinding).
 * Static `title`s are handled by LivoraTitleStrategy; dynamic pages set their own via PageTitleService.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Humble Home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about-us',
    title: 'About Us',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },

  // Shop – one component, three modes
  {
    path: 'shop',
    title: 'Shop',
    data: { mode: 'shop' },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'furniture',
    title: 'Furniture',
    data: { mode: 'category', slug: 'furniture' },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'curtains',
    title: 'Curtains',
    data: { mode: 'category', slug: 'curtains' },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'marble',
    title: 'Marble',
    data: { mode: 'category', slug: 'marble' },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'product-category/:slug',
    data: { mode: 'category' },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'brand/:slug',
    data: { mode: 'brand' },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
  },

  // Commerce
  {
    path: 'cart',
    title: 'Cart',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    title: 'Checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'wishlist',
    title: 'Wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist.component').then((m) => m.WishlistComponent),
  },
  {
    path: 'my-account',
    title: 'My Account',
    data: { view: 'auth' },
    loadComponent: () => import('./pages/account/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'my-account/lost-password',
    title: 'Lost Password',
    data: { view: 'lost-password' },
    loadComponent: () => import('./pages/account/account.component').then((m) => m.AccountComponent),
  },

  // Blog – list/archives share one component
  {
    path: 'blog',
    title: 'Blog',
    data: { mode: 'blog' },
    loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'category/:slug',
    data: { mode: 'category' },
    loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'tag/:slug',
    data: { mode: 'tag' },
    loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent),
  },

  // Content pages
  {
    path: 'contact-us',
    title: 'Contact Us',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'faqs',
    title: 'FAQs',
    loadComponent: () => import('./pages/faqs/faqs.component').then((m) => m.FaqsComponent),
  },
  {
    path: 'testimonials',
    title: 'Testimonials',
    loadComponent: () =>
      import('./pages/testimonials/testimonials.component').then((m) => m.TestimonialsComponent),
  },
  {
    path: 'policy/:slug',
    loadComponent: () => import('./pages/policy/policy.component').then((m) => m.PolicyComponent),
  },

  // 404
  {
    path: '404',
    title: 'Page Not Found',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
