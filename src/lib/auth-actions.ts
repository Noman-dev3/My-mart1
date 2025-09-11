
'use server';

import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth as adminAuth } from './firebase-admin';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Note: We are using the client-side `auth` object from firebase/auth for these actions.
// This is because we're calling them from client-side forms, and we want Firebase's
// client SDK to handle the auth state persistence automatically.
// The functions themselves run on the server as Server Actions.

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const { name, email, password } = registerSchema.parse(values);
    
    // We create a temporary auth instance on the server to perform the action.
    // The client SDK will pick up the resulting auth state.
    const auth = getAuth();
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
    }

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred.';
    if (error.code) {
        switch (error.code) {
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
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
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
        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.setCustomUserClaims(user.uid, { admin: true });
        return { success: true, message: `Admin claim set for ${email}`};
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
