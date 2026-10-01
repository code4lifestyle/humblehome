import { Injectable, computed, signal } from '@angular/core';
import { AuthResult, AuthUser } from '../models';
import { readStorage, writeStorage } from './storage.util';

/**
 * ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │  DEMO / MOCK AUTHENTICATION – NOT A SECURITY FEATURE                                                       │
 * │  There is no server. Accounts are stored in this browser's localStorage, so anybody with access to the    │
 * │  browser (or devtools) can read, edit or delete them. Passwords are never stored in clear text – only a    │
 * │  salted SHA-256 digest – but that is still nowhere near good enough for a real shop. Replace this service  │
 * │  with a real backend (and PBKDF2/Argon2 + sessions/JWT there) before using the site for real customers.   │
 * └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Storage keys
 *   livora.auth.accounts.v1   StoredAccount[]                    (localStorage)
 *   livora.auth.session.v1    { userId }  – "Remember me" ticked → localStorage, otherwise sessionStorage
 */
const ACCOUNTS_KEY = 'livora.auth.accounts.v1';
const SESSION_KEY = 'livora.auth.session.v1';
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface StoredAccount {
  id: string;
  email: string;
  username: string;
  name: string;
  /** Random per-account salt (hex). */
  salt: string;
  /** SHA-256(salt + password) as hex – never the password itself. */
  hash: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------------------------------------------------
// hashing: crypto.subtle (secure contexts: https + localhost) with a small pure-JS SHA-256 for plain-http LAN testing
// ---------------------------------------------------------------------------------------------------------------------
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotr = (x: number, n: number): number => (x >>> n) | (x << (32 - n));

/** Plain SHA-256 (FIPS 180-4) – only used when `crypto.subtle` is not available. */
function sha256Bytes(data: Uint8Array): Uint8Array {
  const padded = new Uint8Array(((data.length + 9 + 63) >> 6) << 6);
  padded.set(data);
  padded[data.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor((data.length * 8) / 2 ** 32));
  view.setUint32(padded.length - 4, (data.length * 8) >>> 0);

  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const w = new Uint32Array(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 =
        (hh +
          (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) +
          ((e & f) ^ (~e & g)) +
          SHA256_K[i] +
          w[i]) |
        0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
    h[4] += e;
    h[5] += f;
    h[6] += g;
    h[7] += hh;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  h.forEach((word, i) => outView.setUint32(i * 4, word));
  return out;
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    return toHex(new Uint8Array(await subtle.digest('SHA-256', data)));
  }
  return toHex(sha256Bytes(data));
}

const randomHex = (bytes: number): string => {
  const buffer = new Uint8Array(bytes);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(buffer);
  } else {
    buffer.forEach((_, i) => (buffer[i] = Math.floor(Math.random() * 256)));
  }
  return toHex(buffer);
};

// ---------------------------------------------------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------------------------------------------------
/** `jane.doe` → `Jane Doe` (used for "Hello Jane Doe"). */
const friendlyName = (username: string): string => {
  const words = username.split(/[._\-+\s]+/).filter(Boolean);
  const name = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return name || username;
};

const toUser = (a: StoredAccount): AuthUser => ({
  id: a.id,
  email: a.email,
  username: a.username,
  name: a.name,
  createdAt: a.createdAt,
});

const isAccount = (value: unknown): value is StoredAccount => {
  const a = value as Partial<StoredAccount> | null;
  return (
    !!a &&
    typeof a === 'object' &&
    typeof a.id === 'string' &&
    typeof a.email === 'string' &&
    typeof a.username === 'string' &&
    typeof a.name === 'string' &&
    typeof a.salt === 'string' &&
    typeof a.hash === 'string'
  );
};

const loadAccounts = (): StoredAccount[] => {
  const stored = readStorage<unknown>(ACCOUNTS_KEY, []);
  return Array.isArray(stored) ? stored.filter(isAccount) : [];
};

/** sessionStorage / localStorage access that never throws (private mode, blocked storage). */
const session = {
  read(): string | null {
    for (const store of ['localStorage', 'sessionStorage'] as const) {
      try {
        const raw = globalThis[store]?.getItem(SESSION_KEY);
        const id = raw ? (JSON.parse(raw) as { userId?: unknown }).userId : null;
        if (typeof id === 'string') {
          return id;
        }
      } catch {
        /* unreadable → not signed in */
      }
    }
    return null;
  },
  write(userId: string, remember: boolean): void {
    this.clear();
    try {
      globalThis[remember ? 'localStorage' : 'sessionStorage']?.setItem(
        SESSION_KEY,
        JSON.stringify({ userId }),
      );
    } catch {
      /* the session then simply lasts until the page is closed */
    }
  },
  clear(): void {
    for (const store of ['localStorage', 'sessionStorage'] as const) {
      try {
        globalThis[store]?.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
    }
  },
};

/**
 * Demo account service – see the banner at the top of this file: it is a MOCK that keeps everything in the browser.
 *
 *   const auth = inject(AuthService);
 *   const res = await auth.register({ email: 'jane@example.com', password: 'secret1' });   // signs the user in as well
 *   await auth.login({ identifier: 'jane@example.com', password: 'secret1', remember: true });   // or identifier 'jane'
 *   auth.user()        // AuthUser | null   (signal)
 *   auth.isLoggedIn()  // boolean           (signal)
 *   auth.logout();
 *
 * Error messages follow the WooCommerce wording of the original My-account page.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accounts = signal<StoredAccount[]>(loadAccounts());
  private readonly userId = signal<string | null>(session.read());

  /** The signed-in customer, `null` when signed out (also `null` if the stored session points to a deleted account). */
  readonly user = computed<AuthUser | null>(() => {
    const id = this.userId();
    const account = id ? this.accounts().find((a) => a.id === id) : undefined;
    return account ? toUser(account) : null;
  });
  readonly isLoggedIn = computed(() => this.user() !== null);

  /** Creates the account and signs it in (session only – tick "Remember me" on the next login to keep it). */
  async register(input: { email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim();
    const password = input.password;
    if (!EMAIL_PATTERN.test(email)) {
      return { ok: false, field: 'email', error: 'Please provide a valid email address.' };
    }
    if (!password) {
      return { ok: false, field: 'password', error: 'Please enter an account password.' };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        field: 'password',
        error: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      };
    }
    if (this.findByEmail(email)) {
      return {
        ok: false,
        field: 'email',
        error: 'An account is already registered with your email address. Please log in.',
      };
    }

    const salt = randomHex(16);
    const username = email.split('@')[0].toLowerCase();
    const account: StoredAccount = {
      id: `u_${randomHex(6)}`,
      email,
      username,
      name: friendlyName(username),
      salt,
      hash: await sha256Hex(salt + password),
      createdAt: new Date().toISOString(),
    };
    const next = [...this.accounts(), account];
    this.accounts.set(next);
    writeStorage(ACCOUNTS_KEY, next);
    session.write(account.id, false);
    this.userId.set(account.id);
    return { ok: true, user: toUser(account) };
  }

  /** `identifier` = email address or username (the part of the email before the `@`). */
  async login(input: {
    identifier: string;
    password: string;
    remember?: boolean;
  }): Promise<AuthResult> {
    const identifier = input.identifier.trim();
    if (!identifier) {
      return { ok: false, field: 'identifier', error: 'Username is required.' };
    }
    if (!input.password) {
      return { ok: false, field: 'password', error: 'The password field is empty.' };
    }
    const account =
      this.findByEmail(identifier) ??
      this.accounts().find((a) => a.username === identifier.toLowerCase());
    if (!account) {
      return {
        ok: false,
        field: 'identifier',
        error: 'Unknown username or email address. Check again or try your email address.',
      };
    }
    if ((await sha256Hex(account.salt + input.password)) !== account.hash) {
      return {
        ok: false,
        field: 'password',
        error: `The password you entered for ${identifier} is incorrect.`,
      };
    }
    session.write(account.id, !!input.remember);
    this.userId.set(account.id);
    return { ok: true, user: toUser(account) };
  }

  logout(): void {
    session.clear();
    this.userId.set(null);
  }

  private findByEmail(email: string): StoredAccount | undefined {
    const wanted = email.trim().toLowerCase();
    return this.accounts().find((a) => a.email.toLowerCase() === wanted);
  }
}
