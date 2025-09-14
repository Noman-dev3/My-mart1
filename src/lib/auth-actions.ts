
'use server';

import { z } from 'zod';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

const profileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
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
      // Corrected: Use the public site URL for the email redirect.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
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

    revalidatePath('/', 'layout');
    return { success: true };
}


export async function signOutUser() {
    const supabase = createServerActionClient({ cookies });
    await supabase.auth.signOut();
    redirect('/');
}

export async function signInWithGoogle() {
  const supabase = createServerActionClient({ cookies });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    redirect('/login?error=Could not authenticate with Google');
  }

  redirect(data.url);
}

export async function updateUserProfile(values: z.infer<typeof profileSchema>) {
    const supabase = createServerActionClient({ cookies });
    const { fullName } = profileSchema.parse(values);

    const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
    });

    if (error) {
        return { success: false, error: error.message };
    }
    
    // Revalidate the account path to show updated info
    revalidatePath('/account');
    return { success: true };
}
