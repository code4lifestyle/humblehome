import { Injectable } from '@angular/core';
import { FAQ_GROUPS, FAQ_PREVIEW } from '../data/faq.data';
import { POLICIES } from '../data/policies.data';
import { TEAM } from '../data/team.data';
import { BRAND_LOGOS, TESTIMONIALS } from '../data/testimonials.data';
import { FaqGroup, FaqItem, PolicyPage, TeamMember, Testimonial } from '../models';

/**
 * Read-only access to the static marketing content (FAQ, testimonials, team, brand logos, policy pages). Synchronous and
 * pure; every call returns the same instances, so results can be bound to component inputs safely. Treat them as
 * immutable.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  /** The 5 FAQ groups (ids: general, orders-payments, shipping-delivery, returns-warranty, product-care). */
  faqGroups(): FaqGroup[] {
    return FAQ_GROUPS;
  }

  /** The 5 "general" questions shown on Home / About / Testimonials. */
  faqPreview(): FaqItem[] {
    return FAQ_PREVIEW;
  }

  /** The 6 customer testimonials. */
  testimonials(): Testimonial[] {
    return TESTIMONIALS;
  }

  /** The 4 team members. */
  team(): TeamMember[] {
    return TEAM;
  }

  /** The 5 "Authorised Dealer" logos (`assets/images/logo-brand-1..5.png`). */
  brandLogos(): { name: string; image: string }[] {
    return BRAND_LOGOS;
  }

  /** The 5 policy pages, ordered like the footer's "Customer Services" list. */
  policies(): PolicyPage[] {
    return POLICIES;
  }

  policyBySlug(slug: string): PolicyPage | undefined {
    return POLICIES.find((policy) => policy.slug === slug);
  }
}
