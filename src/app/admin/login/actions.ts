
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { getApiKey } from '@/lib/api-keys';

const secretKey = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-for-admin-session';
const key = new TextEncoder().encode(secretKey);

// Supabase credentials for a dedicated admin user in Supabase Auth
// This user is only for server-side actions to have an authenticated context
// It is not the same as the role-based passwords.
const SUPABASE_ADMIN_EMAIL = 'admin@mymart.local';
const SUPABASE_ADMIN_PASSWORD = 'mymartadminpassword';


export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Session expires in 1 hour
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (e) {
    return null;
  }
}

// This function is kept for the dedicated Supabase admin user sign-in,
// which is useful for server actions that need an authenticated context.
export async function ensureSupabaseAdminAuthenticated() {
    const supabase = createServerActionClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    // If there's already a valid session for our admin user, we're good.
    if (session) {
        return;
    }

    // Otherwise, sign in programmatically.
    const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email: SUPABASE_ADMIN_EMAIL,
        password: SUPABASE_ADMIN_PASSWORD,
    });
    
    if (supabaseError) {
        console.error('Supabase admin login failed:', supabaseError);
        // This is a critical internal error.
        throw new Error('Could not authenticate the admin session with the database.');
    }
}


export async function logout() {
  const supabase = createServerActionClient({ cookies });
  
  // Sign out the dedicated Supabase user.
  await supabase.auth.signOut();

  // Redirect to login. Role-based sessions are in sessionStorage and will be cleared by the browser.
  redirect('/admin/login');
}
