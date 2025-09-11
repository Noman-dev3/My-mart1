
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// This file is now primarily for server-side helpers that might need Supabase access.
// The main client is defined in supabase-client.ts

export const createSupabaseServerClient = () => {
    return createServerComponentClient({
        cookies,
    });
};
