export interface Testimonial {
  name: string;
  role: string;
  avatar: string; // assets/images/author-1.jpg
  /** Verbatim from the original, including the typographic quotation marks “ … ” (don't wrap it in quotes again). */
  quote: string;
  rating: number; // 1–5
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  /** Anchor id used by the FAQ page side navigation, e.g. 'general'. */
  id: string;
  title: string;
  items: FaqItem[];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

/**
 * Inline fragment of a policy text. Optional rich version of a `text` / list item: the `text` of all runs,
 * concatenated, is exactly the plain string. Renderers that ignore runs simply show the plain text.
 */
export interface PolicyRun {
  text: string;
  /** Phrase highlighted in the original (darker text colour; bold when it is inside a link). */
  highlight?: boolean;
  /** Link target: 'mailto:…' / 'tel:…' / 'https://…', or an app route starting with '/' (→ routerLink). */
  href?: string;
}

/** A block inside a policy section. */
export type PolicyBlock =
  | {
      type: 'paragraph';
      text: string;
      /** Rich version of `text` (only present when the original has highlighted words or links). */
      runs?: PolicyRun[];
    }
  | { type: 'subheading'; text: string }
  | {
      type: 'list';
      items: string[];
      /** `false` = render the items as plain lines without bullet markers (original: icon-less list). Default `true`. */
      bullets?: boolean;
      /** Rich versions of `items`, same length and order (only present when some item has highlights or links). */
      itemRuns?: PolicyRun[][];
    };

export interface PolicySection {
  /** Anchor id, e.g. 'privacy-1' – used by the table of contents. */
  id: string;
  /** e.g. '1. Information we collect' */
  heading: string;
  /** Text of the table-of-contents entry when it differs from `heading` (e.g. '1. Information we Collect'). */
  tocLabel?: string;
  blocks: PolicyBlock[];
}

export interface PolicyPage {
  /** Route slug: privacy-policy | terms-conditions | cancellation-policy | delivery-policy | refunds-returns-policy */
  slug: string;
  /** Page title (h1 in the banner) and link label. */
  title: string;
  /** Short label used in the footer "Customer Services" list, e.g. 'Shipping Information'. */
  footerLabel?: string;
  /** Label of the last breadcrumb item / browser-tab title in the original when it differs from `title`. */
  breadcrumb?: string;
  /** Date only, verbatim from the original (e.g. '9rd June, 2026'); the page renders it as "Effective Date: …". */
  effectiveDate?: string;
  intro: string[];
  /** Rich versions of `intro` paragraphs (same length/order), e.g. with the 'Livora' link to '/'. */
  introRuns?: PolicyRun[][];
  sections: PolicySection[];
}
