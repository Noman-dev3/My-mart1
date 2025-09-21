'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export async function signInUser(values: z.infer<typeof loginSchema>) {
  const supabase = createClientComponentClient();
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
  const supabase = createClientComponentClient();
  await supabase.auth.signOut();
  return { success: true };
}
