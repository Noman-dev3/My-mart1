
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

const secretKey = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-for-admin-session';
const key = new TextEncoder().encode(secretKey);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';

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

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Create the session
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const session = await encrypt({ user: { username }, expires });

  // Save the session in a cookie
  cookies().set('admin_session', session, { expires, httpOnly: true });
  
  return { success: true };
}

export async function logout() {
  // Destroy the session
  cookies().set('admin_session', '', { expires: new Date(0) });
  redirect('/admin/login');
}

export async function getAdminSession() {
  const sessionCookie = cookies().get('admin_session')?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}
