import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../supabase.config';

export const supabaseConfigured = /^https:\/\/.+/.test(SUPABASE_CONFIG.url) && !SUPABASE_CONFIG.anonKey.startsWith('YOUR_');

let client: SupabaseClient | null = null;

/** Shared Supabase client; null until `supabase.config.ts` is filled in. */
export function supabase(): SupabaseClient | null {
  if (!supabaseConfigured) {
    return null;
  }
  client ??= createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'hh-admin-auth' },
  });
  return client;
}
