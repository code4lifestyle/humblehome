import { PolicyBlock, PolicyPage, PolicyRun, PolicySection } from '../models';

/*
 * The five policy pages, extracted from the Elementor markup of the original in document order and kept verbatim
 * (including placeholder text such as "[Currency]" / "[X] days", the "9rd June, 2026" date, and the copy-pasted
 * intro of the Terms and Returns pages). Section ids are the original anchors (`privacy-1` … on every page).
 * Small builders keep the data readable; they produce plain `PolicyBlock`s (see core/models/content.model.ts).
 */

type Part = string | PolicyRun;
type Item = Part | Part[];

/** Highlighted phrase (darker text in the original). */
const hl = (text: string): PolicyRun => ({ text, highlight: true });
/** Link run: 'mailto:' / 'tel:' / absolute app route. */
const link = (text: string, href: string): PolicyRun => ({ text, href });
/** Highlighted link run. */
const hlLink = (text: string, href: string): PolicyRun => ({ text, highlight: true, href });

const toRuns = (parts: Part[]): PolicyRun[] =>
  parts.map((part) => (typeof part === 'string' ? { text: part } : part));
const plain = (runs: PolicyRun[]): string => runs.map((run) => run.text).join('');
const isRich = (runs: PolicyRun[]): boolean => runs.some((run) => run.highlight || run.href);

/** Paragraph from plain text or a mix of plain / highlighted / linked parts. */
const p = (...parts: Part[]): PolicyBlock => {
  const runs = toRuns(parts);
  return isRich(runs)
    ? { type: 'paragraph', text: plain(runs), runs }
    : { type: 'paragraph', text: plain(runs) };
};

/** Sub-heading inside a section ("a. Personal Information"). */
const sub = (text: string): PolicyBlock => ({ type: 'subheading', text });

const listOf = (bullets: boolean, items: Item[]): PolicyBlock => {
  const runs = items.map((item) => toRuns(Array.isArray(item) ? item : [item]));
  return {
    type: 'list',
    items: runs.map(plain),
    ...(bullets ? {} : { bullets: false }),
    ...(runs.some(isRich) ? { itemRuns: runs } : {}),
  };
};

/** Bulleted list (original: icon list with dot markers). */
const bullets = (...items: Item[]): PolicyBlock => listOf(true, items);
/** Plain lines without bullet markers (original: icon list without icons). */
const lines = (...items: Item[]): PolicyBlock => listOf(false, items);

/** Intro paragraphs, with the rich version only when a paragraph has a link. */
const intro = (...paragraphs: Part[][]): Pick<PolicyPage, 'intro' | 'introRuns'> => {
  const runs = paragraphs.map(toRuns);
  return { intro: runs.map(plain), ...(runs.some(isRich) ? { introRuns: runs } : {}) };
};

/**
 * Section; the anchor id is `privacy-<number of the heading>` (as in the original, on every policy page).
 * `tocLabel` only when the table-of-contents entry is worded differently from the heading.
 */
const section = (heading: string, blocks: PolicyBlock[], tocLabel?: string): PolicySection => ({
  id: `privacy-${parseInt(heading, 10)}`,
  heading,
  ...(tocLabel ? { tocLabel } : {}),
  blocks,
});

/** Ordered like the footer's "Customer Services" list of the original. */
export const POLICIES: PolicyPage[] = [
  {
    slug: 'delivery-policy',
    title: 'Shipping & Delivery Policy',
    breadcrumb: 'Delivery Policy',
    footerLabel: 'Shipping Information',
    effectiveDate: '9rd June, 2026',
    ...intro([
      'Welcome to ',
      link('Humble Home', '/'),
      ' we ensure safe and timely delivery of your orders.',
    ]),
    sections: [
      section(
        '1. Shipping coverage',
        [p('We currently ship across:'), bullets([hl('[India / Worldwide - specify]')])],
        '1. Shipping Coverage',
      ),
      section(
        '2. Processing time',
        [
          bullets(
            'Orders are processed within 1-3 business days',
            'Orders are not processed on weekends or holidays',
          ),
        ],
        '2. Processing Time',
      ),
      section(
        '3. Delivery time',
        [
          bullets(
            'Standard delivery: 3-7 business days',
            'Delivery timelines may vary based on location',
          ),
        ],
        '3. Delivery Time',
      ),
      section(
        '4. Shipping charges',
        [
          p(
            'Late delivery refers to canceling a booking, appointment, or service after the allowed deadline, often resulting in a penalty or fee.',
          ),
          bullets(
            'Shipping charges will be calculated at checkout',
            'Free shipping may be available on eligible orders',
          ),
        ],
        '4. Shipping Charges',
      ),
      section(
        '5. Order tracking',
        [
          bullets(
            'Once shipped, tracking details will be shared via email/SMS',
            'You can track your order using provided tracking link',
          ),
        ],
        '5. Order Tracking',
      ),
      section('6. Delays', [
        p('We are not responsible for delays caused by:'),
        bullets('Courier partners', 'Weather conditions', 'Natural disasters or unforeseen events'),
      ]),
      section(
        '7. Incorrect address',
        [
          bullets(
            'Customers must provide accurate shipping details',
            'We are not responsible for delivery failures due to incorrect address',
          ),
        ],
        '7. Incorrect Address',
      ),
      section(
        '8. Damaged delivery',
        [
          p('If your order arrives damaged:'),
          bullets('Contact us within 48 hours with proof', 'We will arrange replacement or refund'),
          lines('For shipping queries, contact us:', [
            hl('E-mail:'),
            ' ',
            link('info@example.com', 'mailto:info@example.com'),
          ]),
        ],
        '8. Damaged Delivery',
      ),
    ],
  },
  {
    slug: 'refunds-returns-policy',
    title: 'Refunds & Returns Policy',
    breadcrumb: 'Refunds Returns Policy',
    footerLabel: 'Return Policy',
    effectiveDate: '9rd June, 2026',
    ...intro([
      'Welcome to ',
      link('Humble Home', '/'),
      ' Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website.',
    ]),
    sections: [
      section(
        '1. Return eligibility',
        [
          lines(
            'You may request a return if:',
            ['The product is ', hl('unused, unworn,'), ' and in original condition'],
            ['The product is returned with ', hl('original packaging, tags, and invoice')],
          ),
          bullets(['The return request is made within ', hl('[7/10/15] days'), ' of delivery']),
        ],
        '1. Return Eligibility',
      ),
      section(
        '2. Non-returnable items',
        [
          lines(
            'We do not accept returns for:',
            'Used or damaged products (not due to our error)',
            'Products without original packaging',
          ),
          bullets(['Items marked as ', hl('Final Sale / Non-returnable')]),
        ],
        '2. Non Returnable Items',
      ),
      section(
        '3. Damaged or incorrect products',
        [
          lines('If you receive:', ['A ', hl('damaged product')]),
          bullets('A wrong item'),
          p(
            'Please contact us within ',
            hl('48 hours'),
            ' of delivery with photos/videos. We will arrange a replacement or refund.',
          ),
        ],
        '3. Damaged Products',
      ),
      section('4. Return Process', [
        lines(
          '1. Email us at info@example.com with order details',
          '2. Our team will approve and provide return instructions',
          '3. Our team will approve and provide return instructions',
        ),
      ]),
      section('5. Refund Policy', [
        lines(
          ['Refunds are processed after ', hl('inspection of returned item')],
          ['Refund will be issued to the ', hl('original payment method')],
        ),
        bullets(['Processing time: ', hl('5-10 business days')]),
      ]),
      section('6. Return Shipping', [
        bullets(
          'Customers may need to bear return shipping charges (unless product is defective or wrong)',
        ),
      ]),
      section('7. Exchange Policy', [
        bullets(
          'Exchanges are allowed based on product availability',
          'Only for unused items within return window',
        ),
        p('For any queries, contact us at:'),
        lines([hl('E-mail:'), ' ', link('info@example.com', 'mailto:info@example.com')]),
      ]),
    ],
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    footerLabel: 'Cancellation Policy',
    effectiveDate: '9rd June, 2026',
    ...intro([
      'Welcome to ',
      link('Humble Home', '/'),
      ' we understand that sometimes orders need to be cancelled. Please read our policy below.',
    ]),
    sections: [
      section('1. Order Cancellation', [
        bullets(
          'Orders can be cancelled before shipment only',
          'Once the order is shipped, cancellation is not possible',
        ),
      ]),
      section(
        '2. How to cancel',
        [
          lines('To cancel your order:', [
            'Contact us at ',
            hlLink('info@example.com', 'mailto:info@example.com'),
          ]),
          bullets('Provide your Order ID and details'),
        ],
        '2. How To Cancel',
      ),
      section(
        '3. Refund for cancelled orders',
        [
          p('If cancelled successfully, full refund will be issued'),
          bullets('Refund will be processed to original payment method within 5-7 business days'),
        ],
        '3. Refund For Cancelled Orders',
      ),
      section('4. Late Cancellation', [
        p(
          'Late cancellation refers to canceling a booking, appointment, or service after the allowed deadline, often resulting in a penalty or fee.',
        ),
        bullets(
          'Canceling a booking after the permitted time window has passed.',
          'Usually leads to a fee, charge, or loss of deposit.',
        ),
      ]),
      section('5. Store Initiated Cancellation', [
        p('We reserve the right to cancel orders due to:'),
        bullets(
          'Stock unavailability',
          'Payment issues',
          'Pricing errors',
          'Suspected fraudulent activity',
        ),
        p('If cancelled by us, a ', hl('full refund'), ' will be issued.'),
        lines('For assistance, contact us at:', [
          hl('E-mail:'),
          ' ',
          link('info@example.com', 'mailto:info@example.com'),
        ]),
      ]),
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    footerLabel: 'Privacy Policy',
    effectiveDate: '9rd June, 2026',
    ...intro([
      'Welcome to ',
      link('Humble Home', '/'),
      ' Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website.',
    ]),
    sections: [
      section(
        '1. Information we collect',
        [
          p('We may collect the following types of information:'),
          sub('a. Personal Information'),
          bullets('Name', 'Email address', 'Phone number', 'Billing and shipping address'),
          sub('b. Payment Information'),
          p(
            'We do not store your payment details. All transactions are processed securely through trusted payment gateways.',
          ),
          sub('c. Non Personal Information'),
          bullets('Browser type', 'IP address', 'Device information', 'Website usage data'),
        ],
        '1. Information we Collect',
      ),
      section(
        '2. How we use your information',
        [
          p('We use your information to:'),
          bullets(
            'Process and deliver your orders',
            'Communicate with you regarding purchases',
            'Improve our website and services',
            'Send promotional emails (only if you opt-in)',
            'Prevent fraud and enhance security',
          ),
        ],
        '2. How we use Information',
      ),
      section(
        '3. Cookies and tracking technologies',
        [
          p('We use cookies to:'),
          bullets(
            'Enhance user experience',
            'Remember your preferences',
            'Analyze website traffic',
          ),
          p('You can choose to disable cookies through your browser settings.'),
        ],
        '3. Cookies and Tracking',
      ),
      section(
        '4. Sharing your information',
        [
          p('We do not sell or rent your personal data. We may share your information with:'),
          bullets(
            'Payment gateways',
            'Shipping partners',
            'Service providers assisting in operations',
          ),
          p('You can choose to disable cookies through your browser settings.'),
        ],
        '4. Sharing Your Information',
      ),
      section(
        '5. Data security',
        [
          p(
            'We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.',
          ),
        ],
        '5. Data Security',
      ),
      section(
        '6. Your rights',
        [
          p('You have the right to:'),
          bullets(
            'Access your personal data',
            'Request correction or deletion',
            'Opt-out of marketing communications',
          ),
        ],
        '6. Your Rights',
      ),
      section(
        '7. Third-party links',
        [
          p(
            'Our website may contain links to third-party websites. We are not responsible for their privacy practices.',
          ),
        ],
        '7. Third Party Links',
      ),
      section(
        '8. Changes to this policy',
        [
          p(
            'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.',
          ),
        ],
        '8. Changes To Policy',
      ),
      section(
        '9. Contact us',
        [
          p('If you have any questions about this Privacy Policy, please contact us:'),
          lines(
            [hl('Phone:'), ' ', link('(+123) 456 789', 'tel:+123456789')],
            [hl('E-mail:'), ' ', link('info@example.com', 'mailto:info@example.com')],
            [hl('Address:'), ' 123 Lorem Street, Ipsum Nagar, Dolor City, 360001'],
          ),
        ],
        '9. Contact Us',
      ),
    ],
  },
  {
    slug: 'terms-conditions',
    title: 'Term & Condition',
    breadcrumb: 'Terms & Conditions',
    footerLabel: 'Terms & Conditions',
    effectiveDate: '9rd June, 2026',
    ...intro([
      'Welcome to ',
      link('Humble Home', '/'),
      ' Your privacy is important to us, and we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website.',
    ]),
    sections: [
      section('1. General', [
        p(
          'These Terms & Conditions govern your use of our website and services. By accessing our site, you agree to these terms. If you do not agree, please do not use our website.',
        ),
      ]),
      section(
        '2. Products & services',
        [
          p(
            'We specialize in offering a wide range of watches including men’s, women’s, kids’, couple, and smartwatches.',
          ),
          bullets(
            'All product descriptions and images are for reference purposes.',
            'Communicate with you regarding purchases',
            'We strive to display accurate colors and details, but slight variations may occur.',
            'Product availability is subject to change without notice.',
          ),
        ],
        '2. Products & Services',
      ),
      section(
        '3. Pricing & payments',
        [
          bullets(
            'All prices listed are in [Currency].',
            'We reserve the right to change prices at any time without prior notice.',
            'Payments are processed securely through trusted payment gateways.',
            'Orders will only be confirmed after successful payment.',
          ),
        ],
        '3. Pricing & Payments',
      ),
      section(
        '4. Orders & cancellation',
        [
          bullets(
            'Once an order is placed, it cannot be modified after processing.',
            'We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud.',
            'Payments are processed securely through trusted payment gateways.',
            'Customers may request cancellation before the order is shipped.',
          ),
        ],
        '4. Orders & Cancellation',
      ),
      section(
        '5. Shipping & delivery',
        [
          bullets(
            'Delivery timelines are estimates and may vary based on location.',
            'We are not responsible for delays caused by courier services or unforeseen circumstances.',
            'Customers must provide accurate shipping details.',
          ),
        ],
        '5. Shipping & Delivery',
      ),
      section(
        '6. Returns & refunds',
        [
          bullets(
            'Returns are accepted within [X] days of delivery (as per our Return Policy).',
            'Products must be unused and in original packaging.',
            'Refunds will be processed after inspection of returned items.',
          ),
        ],
        '6. Returns & Refunds',
      ),
      section('7. Warranty', [
        bullets(
          'Certain products may come with manufacturer warranty.',
          'Warranty terms vary depending on the product and brand.',
          'Warranty does not cover physical damage or misuse.',
        ),
      ]),
      section(
        '8. User responsibilities',
        [
          p('By using our website, you agree:'),
          bullets(
            'Not to misuse or attempt unauthorized access',
            'Not to engage in fraudulent activities',
            'To provide accurate and complete information',
          ),
        ],
        '8. User Responsibilities',
      ),
      section(
        '9. Intellectual property',
        [
          p(
            'All content on this website including images, logos, and text is the property of Humble Home and protected by copyright laws. Unauthorized use is strictly prohibited.',
          ),
        ],
        '9. Intellectual Property',
      ),
      section(
        '10. Limitation of liability',
        [
          p('We are not liable for:'),
          bullets(
            'Any indirect or incidental damages',
            'Loss of data or profits',
            'Issues arising from misuse of products',
          ),
        ],
        '10. Limitation Of Liability',
      ),
      section(
        '11. Third-party links',
        [
          p(
            'Our website may include links to third-party websites. We are not responsible for their content or policies.',
          ),
        ],
        '11. Third-Party Links',
      ),
      section(
        '12. Changes to terms',
        [
          p(
            'We reserve the right to update these Terms & Conditions at any time. Changes will be posted on this page.',
          ),
        ],
        '12. Changes To Terms',
      ),
      section(
        '13. Governing law',
        [p('These Terms shall be governed by the laws of [Your Country/State].')],
        '13. Governing Law',
      ),
      section(
        '14. Contact us',
        [
          p('If you have any questions regarding these Terms & Conditions, please contact us:'),
          lines(
            [hl('Phone:'), ' ', link('(+123) 456 789', 'tel:+123456789')],
            [hl('E-mail:'), ' ', link('info@example.com', 'mailto:info@example.com')],
            [hl('Address:'), ' 123 Lorem Street, Ipsum Nagar, Dolor City, 360001'],
          ),
          p('By using our website, you agree to these Terms & Conditions.'),
        ],
        '14. Contact Us',
      ),
    ],
  },
];
