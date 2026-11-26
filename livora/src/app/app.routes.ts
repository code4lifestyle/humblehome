import { Routes } from '@angular/router';
import { adminGuard, adminGuestGuard } from './pages/admin/admin-auth.service';

/**
 * ROUTE MAP  (≈ 40 original WordPress URLs collapse into 14 lazy page components)
 *
 *  /                          Home
 *  /about-us                  About
 *  /shop                      Shop            data.mode = 'shop'      all products
 *  /product-category/:slug    Shop            data.mode = 'category'  one category
 *  /brand/:slug               Shop            data.mode = 'brand'     one brand
 *  /product/:slug             ProductDetail
 *  /cart  /checkout
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
    data: {
      description:
        'Humble Home designs and makes custom furniture, curtains, and marble for homes in Dubai. Visit us at Dragon Mart 2 or call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about-us',
    title: 'Custom Furniture Studio in Dubai',
    data: {
      description:
        'Humble Home is a Dubai studio for custom furniture, curtains, and marble. We design, make, and install pieces for your home. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },

  // Shop – one component, three modes
  {
    path: 'shop',
    title: 'Shop Furniture, Curtains & Marble',
    data: {
      mode: 'shop',
      description:
        'Browse Humble Home furniture, curtains, and marble in Dubai. Every piece can be made to your size, fabric, and finish. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'furniture',
    title: 'Bespoke Furniture in Dubai',
    data: {
      mode: 'category',
      slug: 'furniture',
      description:
        'Bespoke furniture in Dubai from Humble Home — sofas, beds, dining sets, storage and full room designs. Free consultation, call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'curtains',
    title: 'Made-to-Measure Curtains in Dubai',
    data: {
      mode: 'category',
      slug: 'curtains',
      description:
        'Made-to-measure curtains in Dubai — sheer, blackout, wave, roller and pleated. Humble Home measures, sews and installs. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'marble',
    title: 'Marble Furniture & Stone in Dubai',
    data: {
      mode: 'category',
      slug: 'marble',
      description:
        'Marble tables, kitchen islands, consoles and natural stone in Dubai from Humble Home. Each slab is unique. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'product-category/:slug',
    data: {
      mode: 'category',
      description:
        'Browse Humble Home furniture, curtains, and marble in Dubai. Made to your size, fabric, and finish. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'brand/:slug',
    data: {
      mode: 'brand',
      description:
        'Shop Humble Home furniture, curtains, and marble in Dubai. Made to your size, fabric, and finish. Call +971 55 485 0711.',
    },
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
    data: { robots: 'noindex, nofollow' },
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    title: 'Checkout',
    data: { robots: 'noindex, nofollow' },
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  { path: 'wishlist', redirectTo: '', pathMatch: 'full' },
  {
    path: 'my-account',
    title: 'My Account',
    data: { view: 'auth', robots: 'noindex, nofollow' },
    loadComponent: () => import('./pages/account/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'my-account/lost-password',
    title: 'Lost Password',
    data: { view: 'lost-password', robots: 'noindex, nofollow' },
    loadComponent: () => import('./pages/account/account.component').then((m) => m.AccountComponent),
  },

  // Blog – list/archives share one component
  {
    path: 'blog',
    title: 'Design Stories & Home Inspiration',
    data: {
      mode: 'blog',
      description: 'Design stories and home inspiration from Humble Home in Dubai — furniture, curtains, and marble ideas.',
    },
    loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'category/:slug',
    data: {
      mode: 'category',
      description: 'Design stories and home inspiration from Humble Home in Dubai — furniture, curtains, and marble.',
    },
    loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'tag/:slug',
    data: {
      mode: 'tag',
      description: 'Design stories and home inspiration from Humble Home in Dubai — furniture, curtains, and marble.',
    },
    loadComponent: () => import('./pages/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent),
  },

  // Content pages
  {
    path: 'our-locations',
    title: 'Visit Our Showrooms in Dubai',
    data: {
      description:
        'Visit Humble Home at Dragon Mart 2, International City, Dubai — GD-01, GD-34, GD-45, GC-47. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/locations/locations.component').then((m) => m.LocationsComponent),
  },
  {
    path: 'contact-us',
    title: 'Book a Free Visit in Dubai',
    data: {
      description:
        'Book a free Humble Home visit in Dubai — furniture, curtains or marble. Call +971 55 485 0711 or email enquiry@humblehomefurniture.com.',
    },
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'faqs',
    title: 'Furniture, Curtains & Marble FAQs',
    data: {
      description:
        'Answers about Humble Home custom furniture, curtains, marble, visits, and installation in Dubai. Call +971 55 485 0711.',
    },
    loadComponent: () => import('./pages/faqs/faqs.component').then((m) => m.FaqsComponent),
  },
  {
    path: 'testimonials',
    title: 'Customer Reviews in Dubai',
    data: {
      description: 'What clients say about Humble Home furniture, curtains, and marble work in Dubai. Book a free visit: +971 55 485 0711.',
    },
    loadComponent: () =>
      import('./pages/testimonials/testimonials.component').then((m) => m.TestimonialsComponent),
  },
  {
    path: 'policy/:slug',
    loadComponent: () => import('./pages/policy/policy.component').then((m) => m.PolicyComponent),
  },

  // Dashboard (site header/footer are hidden under /admin)
  {
    path: 'admin/login',
    title: 'Dashboard Sign In',
    data: { robots: 'noindex, nofollow' },
    canActivate: [adminGuestGuard],
    loadComponent: () =>
      import('./pages/admin/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    data: { robots: 'noindex, nofollow' },
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'products/new',
        title: 'Add Product',
        loadComponent: () =>
          import('./pages/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent,
          ),
      },
      {
        path: 'products/:id/edit',
        title: 'Edit Product',
        loadComponent: () =>
          import('./pages/admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent,
          ),
      },
    ],
  },

  // 404
  {
    path: '404',
    title: 'Page Not Found',
    data: { robots: 'noindex, follow' },
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    title: 'Page Not Found',
    data: { robots: 'noindex, follow' },
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
