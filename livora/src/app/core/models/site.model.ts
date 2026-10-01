/** Site-wide configuration (contact details, navigation, footer). Owned by the shell agent – see core/data/site.data.ts */

export interface NavLink {
  label: string;
  /** Angular router link (array or string), e.g. '/shop' or ['/product-category', 'bedroom']. Omit for non-link parents. */
  link?: string | any[];
  children?: NavLink[];
  /** Optional rich mega-menu payload for the "Shop" item. */
  mega?: MegaMenu;
  /** Additive (shell agent): URL prefixes that also mark this item as the current section, e.g. ['/product/'] for Shop. */
  alsoActive?: string[];
}

export interface MegaMenu {
  collectionsTitle: string;
  collections: NavLink[];
  featuresTitle: string;
  features: NavLink[];
  tiles: { image: string; title: string; text: string; link?: string | any[] }[];
  promo?: { eyebrow: string; title: string; text: string; link?: string | any[]; image?: string };
}

export interface SocialLink {
  name: 'facebook' | 'instagram' | 'twitter' | 'x' | 'linkedin' | 'youtube' | 'pinterest' | 'whatsapp';
  url: string;
  /** Font Awesome class, e.g. 'fa-brands fa-facebook-f' */
  icon: string;
}

export interface SiteConfig {
  name: string;
  tagline?: string;
  contact: {
    phone: string; // display
    phoneHref: string; // tel: value
    email: string;
    address: string;
    hours: string;
  };
  logo: string; // assets/images/logo.svg
  logoLight: string; // assets/images/logo-white.svg
  social: SocialLink[];
  mainNav: NavLink[];
  footer: {
    about: string;
    quickLinks: NavLink[];
    customerServices: NavLink[];
    /** Additive (shell agent): headings + labels of the footer. */
    quickLinksTitle?: string;
    customerServicesTitle?: string;
    contactTitle?: string;
    callLabel?: string; // "Call 24/7"
    newsletterPlaceholder?: string;
    newsletterButtonLabel?: string; // accessible label of the round submit button
    copyrightYear?: number;
  };
  /** Additive (shell agent): the "Need Help ?" phone box + search overlay of the header. */
  header?: {
    helpLabel: string;
    helpPhone: string;
    helpPhoneHref: string;
    searchPlaceholder: string;
  };
}
