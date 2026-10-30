import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
export const supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim() : '';

const isValidHttpUrl = (stringToCheck: string): boolean => {
  try {
    const url = new URL(stringToCheck);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  isValidHttpUrl(supabaseUrl) &&
  !supabaseUrl.includes('PASTE_YOUR_SUPABASE_URL_HERE')
);

// Fallback to prevent client bundle crash if environment variables are not yet replaced in .env
const resolvedUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-dental-clinic.supabase.co';
const resolvedKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
