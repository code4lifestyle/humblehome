import { FAQ_GROUPS } from '@core/data/faq.data';

/**
 * Knowledge for the Humble Home website chatbot.
 *
 * RULES (do not break these when editing answers):
 * - Only verified facts: custom furniture, curtains, marble and wardrobes.
 *   Wardrobes ARE offered as a service (built-in wardrobes and cupboards,
 *   made to your size and finish) — see /wardrobe.
 * - No invented prices, delivery times, discounts or services. Prices are by
 *   quotation after a free consultation; anything unpublished is handed over
 *   to WhatsApp instead of guessed.
 * - The 8 live FAQ answers are the bot's core knowledge: they are imported
 *   from faq.data.ts (the same source as the /faqs page), so the bot and the
 *   FAQ page can never disagree.
 * - When the bot cannot answer, it says so and offers WhatsApp
 *   (lead number +971 52 230 7573) instead of guessing.
 */

export interface ChatAction {
  label: string;
  href: string;
}

export interface BotReply {
  text: string;
  action?: ChatAction;
}

/** Lead WhatsApp number. Do not change: this is the Humble Home lead number, not the website phone. */
export const WHATSAPP_URL = 'https://wa.me/971522307573';
export const WHATSAPP_ACTION: ChatAction = { label: 'Chat on WhatsApp', href: WHATSAPP_URL };

export const GREETING =
  'Welcome to Humble Home. We make custom furniture, curtains, marble and wardrobes in Dubai. Visit our showrooms at Dragon Mart 2, or book a free consultation. How may I help you?';

/** Find one of the 8 live FAQ answers by the start of its question. */
function faqAnswer(questionStartsWith: string): string {
  for (const group of FAQ_GROUPS) {
    const item = group.items.find((entry) => entry.question.startsWith(questionStartsWith));
    if (item) {
      return item.answer;
    }
  }
  return '';
}

const SHOWROOMS_ANSWER =
  'You can visit us at Dragon Mart 2, International City, Dubai. Our showrooms are: GD-01 DOOBIZ HOME, GD-34 TANVEER KHAN, GD-45 TANVEER KHAN, and GC-47 FAMILY FRIENDS.';

const HOURS_ANSWER =
  'We are open 7 days a week: Sunday to Thursday 10:00 AM - 10:00 PM, and Friday to Saturday 10:00 AM - 11:00 PM.';

const CURTAINS_ANSWER =
  'We make made-to-measure curtains in Dubai, tailored to your windows and your choice of fabric and finish. The consultation and home visit are free, and prices are by quotation after the consultation. Would you like to book a free visit, or talk to the team on WhatsApp?';

const SERVICES_ANSWER =
  'Humble Home makes custom furniture, made-to-measure curtains, marble pieces and custom wardrobes in Dubai - all made to your measurements and your choice of materials, fabrics and finishes. Prices are by quotation after a free consultation. What would you like to know more about - furniture, curtains, marble or wardrobes?';

const PRICES_ANSWER =
  'Prices are by quotation. Book a free consultation and home visit, and the team will measure your space and give you a clear quotation for your approval. There is no charge for the consultation or the measurement visit.';

const DELIVERY_ANSWER =
  'Delivery and installation are part of the process. Once you approve your quotation, your piece is made to your specifications, then delivered and installed by the team.';

const WARDROBE_ACTION: ChatAction = { label: 'See custom wardrobes', href: '/wardrobe' };

const WARDROBE_ANSWER =
  'Yes - Humble Home makes custom wardrobes in Dubai: built-in wardrobes and cupboards, made to your size and finish. Prices are by quotation after a free consultation. You can see them on our wardrobes page, or message the team on WhatsApp +971 52 230 7573 and they will help.';

const CONTACT_ANSWER =
  'You can reach the team on WhatsApp +971 52 230 7573, by phone on +971 55 485 0711, or by email at enquiry@humblehomefurniture.com.';

const FALLBACK_ANSWER =
  'I can help with custom furniture, curtains, marble and wardrobes, showrooms and opening hours, the free consultation, payment and returns. For anything else, the team will be happy to help you on WhatsApp.';

interface Rule {
  patterns: RegExp[];
  reply: () => BotReply;
}

// Patterns are prefix-tolerant on purpose (e.g. "ordering", "returns",
// "consultation" must all match). Specific topics are checked before the
// generic ordering rule, so "Can I order a custom sofa?" gets the sofa
// answer, not the ordering-process answer.
const RULES: Rule[] = [
  {
    // Wardrobes are a service: offer them and link to /wardrobe.
    patterns: [/\bwardrobe/],
    reply: () => ({ text: WARDROBE_ANSWER, action: WARDROBE_ACTION }),
  },
  {
    patterns: [/\bprice/, /\bcost\b/, /\bhow much\b/, /\bquot/],
    reply: () => ({ text: PRICES_ANSWER }),
  },
  {
    patterns: [/\bpay/, /\bdeposit/, /\binstallment/, /\bcash\b/, /\bcard\b/],
    reply: () => ({ text: faqAnswer('How do I pay for my order?') }),
  },
  {
    patterns: [/\breturn/, /\bwarranty/, /\bguarantee/, /\brefund/],
    reply: () => ({ text: faqAnswer('What is your returns and warranty policy?') }),
  },
  {
    patterns: [/\bsofas?\b/, /\bcouch/, /\bsectional\b/, /\bl[- ]?shaped?\b/],
    reply: () => ({ text: faqAnswer('Can I order a custom sofa in any size or shape?') }),
  },
  {
    patterns: [/\bmarble\b/, /\bcountertop/, /\bstone\b/],
    reply: () => ({ text: faqAnswer('How does ordering a marble countertop or floor work?') }),
  },
  {
    patterns: [/\bcurtain/],
    reply: () => ({ text: CURTAINS_ANSWER }),
  },
  {
    patterns: [/\bconsult/, /\bfree\b/, /\bbook/, /\bappointment/, /\bvisit\b/, /\bmeasur/],
    reply: () => ({ text: faqAnswer('Is the consultation and home visit free?') }),
  },
  {
    patterns: [
      /\bfit\b/,
      /\bexact space\b/,
      /\bmy space\b/,
      /\bawkward\b/,
      /\balcove\b/,
      /\bcustom furniture\b/,
      /\bmade to (measure|order)\b/,
    ],
    reply: () => ({ text: faqAnswer('Can Humble Home make furniture to fit my exact space?') }),
  },
  {
    patterns: [/\bshowroom/, /\blocation\b/, /\bwhere are you\b/, /\bdragon mart\b/, /\baddress\b/, /\bfind you\b/, /\bshop\b/],
    reply: () => ({ text: SHOWROOMS_ANSWER }),
  },
  {
    patterns: [/\bhours?\b/, /\bopen\b/, /\bopening\b/, /\btiming/, /\bwhen (are|do) you (open|close)\b/, /\bclose\b/],
    reply: () => ({ text: HOURS_ANSWER }),
  },
  {
    patterns: [/\bdeliver/, /\binstall/],
    reply: () => ({ text: DELIVERY_ANSWER }),
  },
  {
    patterns: [/\bwho\b/, /\bdeveloper/, /\bhotel\b/, /\bvilla\b/, /\bbusiness\b/, /\bproject\b/, /\bcompany\b/],
    reply: () => ({ text: faqAnswer('Who does Humble Home work for') }),
  },
  {
    patterns: [/\bcontact/, /\bphone\b/, /\bcall\b/, /\bemail\b/, /\bwhatsapp\b/, /\bhuman\b/, /\bagent\b/, /\bperson\b/, /\bsomeone\b/, /\btalk to\b/],
    reply: () => ({ text: CONTACT_ANSWER, action: WHATSAPP_ACTION }),
  },
  {
    patterns: [/\bservice/, /\bwhat do you (do|offer|sell|make)\b/, /\boffer\b/],
    reply: () => ({ text: SERVICES_ANSWER }),
  },
  {
    patterns: [/\bfurniture\b/],
    reply: () => ({ text: SERVICES_ANSWER }),
  },
  {
    patterns: [/\border/, /\bprocess\b/, /\bsteps?\b/, /\bhow (do|can|to) (i|we|you)\b/, /\bbuy\b/],
    reply: () => ({ text: faqAnswer('How does ordering from Humble Home work?') }),
  },
];

/** Quick-reply chips shown in the chat panel. Each sends its text as the visitor's message. */
export const QUICK_REPLIES: { label: string; value: string }[] = [
  { label: 'How does ordering work?', value: 'How does ordering work?' },
  { label: 'Is the consultation free?', value: 'Is the consultation free?' },
  { label: 'Furniture for my exact space', value: 'Can you make furniture to fit my exact space?' },
  { label: 'Custom wardrobes', value: 'Tell me about wardrobes' },
  { label: 'Custom sofas', value: 'Can I order a custom sofa?' },
  { label: 'Marble', value: 'Tell me about marble' },
  { label: 'Curtains', value: 'Tell me about curtains' },
  { label: 'Showrooms & hours', value: 'Where are your showrooms and what are your hours?' },
  { label: 'Who do you work for?', value: 'Who does Humble Home work for?' },
  { label: 'Payment', value: 'How do I pay for my order?' },
  { label: 'Returns & warranty', value: 'What is your returns and warranty policy?' },
];

/** Match a visitor message to a reply. No match means: say so and hand over to WhatsApp. */
export function findAnswer(input: string): BotReply {
  const text = input.toLowerCase().trim();
  // A greeting on its own gets the greeting; a greeting plus a question
  // (e.g. "Hi, what are your hours?") falls through to the real topic.
  if (/^(hi|hello|hey|salam|aoa|good morning|good afternoon|good evening)[!.,\s]*$/.test(text)) {
    return { text: GREETING };
  }
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.reply();
    }
  }
  return { text: FALLBACK_ANSWER, action: WHATSAPP_ACTION };
}
