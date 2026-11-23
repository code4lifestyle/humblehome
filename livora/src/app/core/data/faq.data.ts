import { FaqGroup, FaqItem } from '../models';

/*
 * FAQ page content - the 8 questions Ina (marketing) circled to keep from the
 * 27-question draft (23 Nov 2026). Each question has its own unique answer;
 * nothing here repeats, and no prices or lead times are invented. Questions 26
 * and 27 state plainly that the terms are confirmed in the quotation, because
 * the business has not published them yet.
 */

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'how-ordering-works',
    title: 'How ordering works',
    items: [
      { question: 'How does ordering from Humble Home work?', answer: 'There are seven steps: consult, measure, design, approve, create, install and enjoy. First you discuss your style, requirements, budget and space; the team then visits to measure, helps you choose the design, materials, fabrics, finishes and colours, and gives you a clear quotation. Once you approve it, your piece is made to your specifications, then delivered, installed and handed over.' },
      { question: 'Is the consultation and home visit free?', answer: 'Yes. You can book a free visit through the Humble Home website, and the team will discuss your project and visit your space to take accurate measurements. There is no charge for the consultation or the measurement visit.' },
    ],
  },
  {
    id: 'custom-furniture-sofas',
    title: 'Custom furniture and custom sofas',
    items: [
      { question: 'Can Humble Home make furniture to fit my exact space?', answer: 'Yes. Furniture is made to your measurements, which the team takes on the site visit, so pieces are built for your room rather than adjusted to fit it. This is useful for awkward walls, alcoves and rooms where standard sizes do not work.' },
      { question: 'Can I order a custom sofa in any size or shape?', answer: 'Yes. Sofas are made to your measurements and your choice of fabric and finish, so the size is built around your room and how you will use it. L-shaped and sectional layouts are available - please confirm the exact shapes and configurations with the team during your consultation.' },
    ],
  },
  {
    id: 'marble',
    title: 'Marble',
    items: [
      { question: 'How does ordering a marble countertop or floor work?', answer: 'It follows the same process as furniture and curtains: consultation, site visit and measurement, design and material selection, then a clear quotation for your approval. Once approved, the marble is prepared to your specifications and then delivered and installed by the team. The timeline for your piece is confirmed in your quotation.' },
    ],
  },
  {
    id: 'delivery-payment-aftercare',
    title: 'Delivery, installation, who we serve, payment and aftercare',
    items: [
      { question: 'Who does Humble Home work for - homeowners, developers and hotels?', answer: 'Humble Home works for homeowners furnishing a single room, a villa or an apartment, and for complete interior projects. Developers and hotels ordering furniture, curtains or marble for whole buildings should contact the team directly to discuss the project, quantities and quotation.' },
      { question: 'What is your returns and warranty policy?', answer: 'This has not been published in detail. The current FAQ page only says eligible products may be returned within "the specified return period", without stating the period, and it does not state a warranty length or what a warranty covers. Because custom pieces are made to your approved design, please ask the team to confirm the returns and warranty terms in writing in your quotation before you approve it.' },
      { question: 'How do I pay for my order?', answer: 'Payment terms are set out in your quotation, and no payment methods or deposit terms are published on the website. Please confirm the accepted payment methods, any deposit required before production, and when the balance is due with the team before you approve your order.' },
    ],
  },
];

/** The accordion on About / Testimonials is identical to the first group. */
export const FAQ_PREVIEW: FaqItem[] = FAQ_GROUPS[0].items;
