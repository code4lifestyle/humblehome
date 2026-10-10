import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase, supabaseConfigured } from '@core/services/supabase.client';

/** Dashboard sign-in through Supabase Auth (email + password users created in the Supabase dashboard). */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly _email = signal<string | null>(null);
  readonly email = this._email.asReadonly();
  readonly configured = supabaseConfigured;

  /** Resolves once the saved session (if any) has been restored. */
  readonly ready: Promise<void>;

  constructor() {
    const client = supabase();
    if (!client) {
      this.ready = Promise.resolve();
      return;
    }
    client.auth.onAuthStateChange((_event, session) => this._email.set(session?.user.email ?? null));
    this.ready = client.auth.getSession().then(({ data }) => {
      this._email.set(data.session?.user.email ?? null);
    });
  }

  /** Returns an error message, or null on success. */
  async signIn(email: string, password: string): Promise<string | null> {
    const client = supabase();
    if (!client) {
      return 'Supabase is not configured yet (src/app/core/supabase.config.ts).';
    }
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      return error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message;
    }
    this._email.set(data.user?.email ?? null);
    return null;
  }

  async signOut(): Promise<void> {
    await supabase()?.auth.signOut();
    this._email.set(null);
  }
}

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  await auth.ready;
  return auth.email() ? true : router.createUrlTree(['/admin/login']);
};

export const adminGuestGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  await auth.ready;
  return auth.email() ? router.createUrlTree(['/admin']) : true;
};
