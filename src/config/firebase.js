import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Lazy initialization
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

const initializeFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  if (!firebaseDb) {
    firebaseDb = getFirestore(firebaseApp);
  }
  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
};

// Export getters that initialize on first use
export const getFirebaseApp = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
};

export const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth;
};

export const getFirebaseDb = () => {
  if (!firebaseDb) {
    initializeFirebase();
  }
  return firebaseDb;
};

// For backward compatibility - these will initialize when first accessed
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export default getFirebaseApp(); 