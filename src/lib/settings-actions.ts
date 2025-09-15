

'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required."),
  contactEmail: z.string().email("Invalid email address."),
  contactPhone: z.string().min(1, "Phone number is required."),
  address: z.string().min(1, "Address is required."),
  theme: z.object({
    primaryColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Invalid HSL format"),
  }),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

const createServiceSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL or Service Role Key is not configured.');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};


export async function getSettings(): Promise<SiteSettings | null> {
  const supabase = createServerActionClient({ cookies });

  const { data, error } = await supabase
    .from('siteContent')
    .select('content')
    .eq('page', 'settings')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching settings:', error);
    return null;
  }
  
  if (!data) {
    return null;
  }

  return data.content as SiteSettings;
}

export async function updateSettings(settings: SiteSettings) {
  const supabase = createServerActionClient({ cookies });

  const validatedSettings = settingsSchema.parse(settings);

  const { error } = await supabase
    .from('siteContent')
    .upsert({ page: 'settings', content: validatedSettings }, { onConflict: 'page' });

  if (error) {
    console.error('Error updating settings:', error);
    throw new Error('Could not update settings.');
  }

  revalidatePath('/', 'layout');

  return { success: true };
}

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(4, "New password must be at least 4 characters."),
});

// Default credentials, used only if nothing is in the database.
const DEFAULT_ADMIN_CREDS = {
    username: 'admin',
    password: '1234',
};

export async function getAdminCredentials() {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('siteContent')
        .select('content')
        .eq('page', 'adminCredentials')
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching admin credentials:', error);
        return DEFAULT_ADMIN_CREDS;
    }

    if (!data || !data.content) {
        return DEFAULT_ADMIN_CREDS;
    }

    return data.content as { username: string; password: string };
}

export async function updateAdminPassword(values: z.infer<typeof passwordSchema>) {
    const supabase = createServerActionClient({ cookies });
    const validatedData = passwordSchema.parse(values);
    
    // 1. Get current credentials
    const currentCreds = await getAdminCredentials();

    // 2. Verify current password
    if (validatedData.currentPassword !== currentCreds.password) {
        return { success: false, error: "The current password you entered is incorrect." };
    }

    // 3. Prepare new credentials
    const newCreds = {
        username: currentCreds.username, // Username is not changeable for now
        password: validatedData.newPassword,
    };
    
    // 4. Update in database
    const { error } = await supabase
        .from('siteContent')
        .upsert({ page: 'adminCredentials', content: newCreds }, { onConflict: 'page' });

    if (error) {
        console.error('Error updating admin password:', error);
        return { success: false, error: "Failed to update password in the database." };
    }

    return { success: true };
}


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

    if (error || !data) {
        return null;
    }
    const keys = data.content as Record<string, string>;
    return keys[keyName] || null;
}

    