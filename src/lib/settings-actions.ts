

'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getApiKey, updateApiKey } from '@/lib/api-keys';

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
    password: 'superadmin123',
};

export async function verifyAdminCredentials(username: string, passwordAttempt: string): Promise<{ success: boolean; error?: string; }> {
    const currentCreds = await getAdminCredentials();

    if (username === currentCreds.username && passwordAttempt === currentCreds.password) {
        return { success: true };
    } else {
        // Simulate delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: false, error: 'Incorrect credentials.' };
    }
}


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

    if (!data || !data.content || !(data.content as any).password) {
        // If creds don't exist, create them with default
        await updateAdminPassword({
            currentPassword: '', // Bypass check
            newPassword: DEFAULT_ADMIN_CREDS.password
        }, true);
        return DEFAULT_ADMIN_CREDS;
    }

    return data.content as { username: string; password: string };
}

export async function updateAdminPassword(values: z.infer<typeof passwordSchema>, isInitialSetup = false) {
    const supabase = createServerActionClient({ cookies });
    const validatedData = passwordSchema.parse(values);
    
    if (!isInitialSetup) {
        const currentCreds = await getAdminCredentials();
        if (validatedData.currentPassword !== currentCreds.password) {
            return { success: false, error: "The current password you entered is incorrect." };
        }
    }

    const newCreds = {
        username: DEFAULT_ADMIN_CREDS.username, // Username is not changeable
        password: validatedData.newPassword,
    };
    
    const { error } = await supabase
        .from('siteContent')
        .upsert({ page: 'adminCredentials', content: newCreds }, { onConflict: 'page' });

    if (error) {
        console.error('Error updating admin password:', error);
        return { success: false, error: "Failed to update password in the database." };
    }

    return { success: true };
}

export { getApiKey, updateApiKey };
    