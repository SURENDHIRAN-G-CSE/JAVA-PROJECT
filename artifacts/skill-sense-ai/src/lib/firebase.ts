import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export function observeAuth(callback: (user: User | null) => void) {
  if (!firebaseAuth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signInWithGoogle() {
  if (!firebaseAuth) throw new Error('Firebase is not configured yet.');
  return signInWithPopup(firebaseAuth, new GoogleAuthProvider());
}

export async function signInWithEmail(email: string, password: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured yet.');
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (!firebaseAuth) throw new Error('Firebase is not configured yet.');
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

export async function logOut() {
  if (firebaseAuth) await signOut(firebaseAuth);
}