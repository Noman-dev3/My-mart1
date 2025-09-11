
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// Define a function to create a Supabase client for client-side operations
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
