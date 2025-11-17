
'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// This function creates a Supabase client with the service_role key,
// allowing it to bypass RLS for administrative tasks.
// It should only be used in server-side code.
const createServiceSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is not configured in environment variables.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

const apiKeySchema = z.object({
    keyName: z.string(),
    keyValue: z.string(),
});

export async function updateApiKey(data: z.infer<typeof apiKeySchema>) {
    const supabase = createServiceSupabaseClient();
    
    const { data: existingKeys, error: fetchError } = await supabase
        .from('siteContent')
        .select('content')
        .eq('page', 'apiKeys')
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Could not fetch existing API keys.');
    }

    const currentKeys = (existingKeys?.content as Record<string, string>) || {};
    currentKeys[data.keyName] = data.keyValue;

    const { error: updateError } = await supabase
        .from('siteContent')
        .upsert({ page: 'apiKeys', content: currentKeys }, { onConflict: 'page' });

    if (updateError) {
        throw new Error('Failed to update API key.');
    }

    return { success: true };
}

export async function getApiKey(keyName: string): Promise<string | null> {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
        .from('siteContent')
        .select('content')
        .eq('page', 'apiKeys')
        .single();

    if (error && error.code !== 'PGRST116') { // 'PGRST116' is the code for no rows found
        console.error(`Error fetching API key for ${keyName}:`, error);
        return null;
    }

    if (!data) {
        return null;
    }
    
    const keys = data.content as Record<string, string>;
    return keys[keyName] || null;
}
