
'use server';

import { z } from 'zod';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export async function registerUser(values: z.infer<typeof registerSchema>) {
  const supabase = createServerActionClient({ cookies });
  const { name, email, password } = registerSchema.parse(values);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: '/login',
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Please check your email to verify your account.' };
}


export async function signInUser(values: z.infer<typeof loginSchema>) {
    const supabase = createServerActionClient({ cookies });
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
    const supabase = createServerActionClient({ cookies });
    await supabase.auth.signOut();
    redirect('/');
}
