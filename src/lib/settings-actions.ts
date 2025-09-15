
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
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

  // This will trigger a re-fetch of data on pages that use the settings
  revalidatePath('/', 'layout');

  return { success: true };
}
