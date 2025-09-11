
'use server';

import { z } from 'zod';
import { getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getAdminAuth } from './firebase-admin';
import { auth } from './firebase';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// We switch back to client-side SDK for registration and sign-in to ensure
// the client's auth state is automatically managed by the Firebase SDK.
// This is the intended pattern for Server Actions that manipulate client-side auth.

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const { name, email, password } = registerSchema.parse(values);
    
    // We create a temporary auth instance on the server to perform the action.
    // The client SDK will pick up the resulting auth state.
    const userCredential = await getAdminAuth().createUser({ email, password, displayName: name });
    
    // We can also update the client-side auth state if needed, but creating the user is enough for login
    // await updateProfile(userCredential.user, { displayName: name });

    return { success: true, uid: userCredential.uid };
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-exists':
            case 'auth/email-already-in-use':
              errorMessage = 'This email is already in use.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'The email address is not valid.';
              break;
            case 'auth/weak-password':
              errorMessage = 'The password is too weak.';
              break;
            default:
              errorMessage = error.message;
        }
    } else if (error instanceof z.ZodError) {
        errorMessage = error.errors.map(e => e.message).join(', ');
    }
    return { success: false, error: errorMessage };
  }
}

export async function signInUser(values: z.infer<typeof loginSchema>) {
  try {
    const { email, password } = loginSchema.parse(values);
    // For sign-in, we MUST use the client SDK to get the session cookie set correctly.
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred.';
     if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage = 'Invalid email or password.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'The email address is not valid.';
              break;
            default:
              errorMessage = 'Invalid email or password.';
        }
    } else if (error instanceof z.ZodError) {
        errorMessage = error.errors.map(e => e.message).join(', ');
    }
    return { success: false, error: errorMessage };
  }
}

export async function setAdminClaim(email: string) {
    try {
        const adminAuth = getAdminAuth();
        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.setCustomUserClaims(user.uid, { admin: true });
        return { success: true, message: `Admin claim set for ${email}`};
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
