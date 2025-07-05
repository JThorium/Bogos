import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let app;
let auth;
let db;
let provider;

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();

} catch (e) {
  console.error("Firebase initialization failed. Social features will be unavailable.", e);
}

export { auth, db };

export async function signInWithGoogle() {
  if (auth && provider) {
    await signInWithPopup(auth, provider);
  } else {
    console.warn("Firebase Auth not initialized. Cannot sign in with Google.");
  }
}

export function subscribeAuth(cb) {
  if (auth) {
    return onAuthStateChanged(auth, cb);
  } else {
    console.warn("Firebase Auth not initialized. Cannot subscribe to auth changes.");
    return () => {}; // Return a no-op unsubscribe function
  }
}