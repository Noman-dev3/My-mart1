
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define a function to create a Supabase client for client-side operations
export const createSupabaseBrowserClient = () =>
  createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
