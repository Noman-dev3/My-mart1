
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define a function to create a Supabase client for client-side operations
export const createSupabaseBrowserClient = () =>
  createClientComponentClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
