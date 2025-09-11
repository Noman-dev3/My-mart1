
import admin, { App } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';
import { Firestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : {
      type: process.env.FIREBASE_type,
      project_id: process.env.FIREBASE_project_id,
      private_key_id: process.env.FIREBASE_private_key_id,
      private_key: process.env.FIREBASE_private_key?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_client_email,
      client_id: process.env.FIREBASE_client_id,
      auth_uri: process.env.FIREBASE_auth_uri,
      token_uri: process.env.FIREBASE_token_uri,
      auth_provider_x509_cert_url: process.env.FIREBASE_auth_provider_x509_cert_url,
      client_x509_cert_url: process.env.FIREBASE_client_x509_cert_url,
    };

function getFirebaseAdminApp(): App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    // Re-throw the error to make it visible and prevent downstream errors
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

export function getAdminAuth(): Auth {
    return getFirebaseAdminApp().auth();
}

export function getAdminDb(): Firestore {
    return getFirebaseAdminApp().firestore();
}

// We keep these exports for any files that might still use them,
// but they now use the robust getter function.
export const auth = getAdminAuth();
export const db = getAdminDb();
