
'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export async function signInUser(values: z.infer<typeof loginSchema>) {
  const supabase = createSupabaseBrowserClient();
  const { email, password } = loginSchema.parse(values);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: 'Invalid login credentials.' };
  }

  return { success: true };
}

export async function signOutUser() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
  return { success: true };
}
