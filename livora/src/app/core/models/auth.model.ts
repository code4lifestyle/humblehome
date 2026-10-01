/**
 * Demo-account contracts (commerce agent). `AuthService` is a MOCK: there is no server, accounts live in the browser's
 * localStorage – see docs/commerce.md.
 */

/** The signed-in customer as the UI sees it (never contains any password data). */
export interface AuthUser {
  id: string;
  email: string;
  /** Lower-cased local part of the email – the "username" of WooCommerce. */
  username: string;
  /** Friendly name for greetings, derived from the username (`jane.doe` → `Jane Doe`). */
  name: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** Field a failed auth call refers to – lets a form put the message next to the right input. */
export type AuthErrorField = 'email' | 'identifier' | 'password';

export type AuthResult =
  { ok: true; user: AuthUser } | { ok: false; error: string; field?: AuthErrorField };
