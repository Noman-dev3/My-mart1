
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

// This function now returns null if the environment variables are not set,
// preventing the app from crashing.
export const createSupabaseBrowserClient = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      'Supabase URL or Anon Key is missing. Supabase client not created. Please check your .env file.'
    );
    return null;
  }

  return createClientComponentClient({
    supabaseUrl,
    supabaseKey,
  });
};
