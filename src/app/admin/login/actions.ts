
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

const secretKey = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-for-admin-session';
const key = new TextEncoder().encode(secretKey);

// Hardcoded credentials for the application's internal admin user
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';
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

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const supabase = createServerActionClient({ cookies });

  // Step 1: Validate the custom admin credentials
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Step 2: Programmatically sign in the dedicated Supabase admin user
  const { error: supabaseError } = await supabase.auth.signInWithPassword({
    email: SUPABASE_ADMIN_EMAIL,
    password: SUPABASE_ADMIN_PASSWORD,
  });

  if (supabaseError) {
    console.error('Supabase admin login failed:', supabaseError);
    return { success: false, error: 'Could not authenticate the admin session with the database. Ensure the admin user exists in Supabase.' };
  }

  // Step 3: Create the custom admin session cookie
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const session = await encrypt({ user: { username }, expires });
  cookies().set('admin_session', session, { expires, httpOnly: true });
  
  return { success: true };
}

export async function logout() {
  const supabase = createServerActionClient({ cookies });
  
  // Destroy both sessions
  await supabase.auth.signOut();
  cookies().set('admin_session', '', { expires: new Date(0) });

  redirect('/admin/login');
}

export async function getAdminSession() {
  const sessionCookie = cookies().get('admin_session')?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}
