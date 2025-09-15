

'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { getAdminCredentials } from '@/lib/settings-actions';
import { getApiKey } from '@/lib/api-keys';

const secretKey = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-for-admin-session';
const key = new TextEncoder().encode(secretKey);

// Supabase credentials for a dedicated admin user in Supabase Auth
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

  // Step 1: Fetch the current admin credentials from the database
  const adminCreds = await getAdminCredentials();
  
  // Step 2: Validate the custom admin credentials
  if (username !== adminCreds.username || password !== adminCreds.password) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Step 3: Programmatically sign in the dedicated Supabase admin user
  const { error: supabaseError } = await supabase.auth.signInWithPassword({
    email: SUPABASE_ADMIN_EMAIL,
    password: SUPABASE_ADMIN_PASSWORD,
  });

  if (supabaseError) {
    console.error('Supabase admin login failed:', supabaseError);
    return { success: false, error: 'Could not authenticate the admin session with the database. Ensure the admin user exists in Supabase.' };
  }
  
  // The logic for checking the API key is now simplified, as Genkit handles it.
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  const sessionPayload = {
    user: { username },
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    hasGeminiKey: hasGeminiKey,
  };


  // Step 4: Create the custom admin session cookie
  const session = await encrypt(sessionPayload);
  cookies().set('admin_session', session, { expires: sessionPayload.expires, httpOnly: true });
  
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

    
