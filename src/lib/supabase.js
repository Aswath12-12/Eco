import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseUrl.startsWith('https://') &&
  !supabaseAnonKey.includes('placeholder')
);

// Fallback dummy URL to prevent createClient from throwing fatal runtime error if not configured
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to test connection to Supabase database
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase URL or Anon Key is missing or using placeholder in .env' };
  }
  try {
    const { data, error } = await supabase.from('houses').select('id, name, code').limit(1);
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, message: err.message || 'Network error connecting to Supabase' };
  }
}
