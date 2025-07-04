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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export getters that create instances on demand
export const getFirebaseApp = () => app;

export const getFirebaseAuth = () => {
  try {
    return getAuth(app);
  } catch (error) {
    console.error('Error getting Firebase Auth:', error);
    throw error;
  }
};

export const getFirebaseDb = () => {
  try {
    return getFirestore(app);
  } catch (error) {
    console.error('Error getting Firebase Firestore:', error);
    throw error;
  }
};

// For backward compatibility - these are now getter functions
export const auth = getFirebaseAuth;
export const db = getFirebaseDb;
export default app; 