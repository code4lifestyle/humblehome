/**
 * Supabase project (Dashboard → Project Settings → API). The anon / publishable key is meant for the browser;
 * never put the service_role / secret key here.
 */
export const SUPABASE_CONFIG = {
  url: 'https://qfvkfjgipvtcicwasjuu.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdmtmamdpcHZ0Y2ljd2FzanV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NTYyNDUsImV4cCI6MjEwNzIzMjI0NX0.QI0DsESEFvxxosAGX2sCa9Phwc2nVYFSqtEZZCh-xhQ',
} as const;
