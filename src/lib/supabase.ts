import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock-safe client that won't crash when env vars are missing
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as SupabaseClient, {
      get: (_target, prop) => {
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: () => Promise.resolve({ error: null }),
            signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Backend not connected' } }),
            signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Backend not connected' } }),
          };
        }
        if (prop === 'from') {
          return () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }),
            insert: () => Promise.resolve({ data: null, error: { message: 'Backend not connected' } }),
            update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Backend not connected' } }) }),
            delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Backend not connected' } }) }),
          });
        }
        return () => {};
      },
    });
