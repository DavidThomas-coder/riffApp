import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just set loading to false without Firebase auth state
    // We'll implement Firebase auth later when the user actually tries to login
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Lazy load Firebase only when needed
      const { getFirebaseAuth } = await import('../config/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { getFirebaseDb } = await import('../config/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      const userInfo = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        username: userData?.username || userCredential.user.email?.split('@')[0],
        totalMedals: userData?.totalMedals || { gold: 0, silver: 0, bronze: 0 },
        createdAt: userData?.createdAt || userCredential.user.metadata.creationTime,
      };
      
      setUser(userInfo);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Login failed';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, username) => {
    try {
      // Lazy load Firebase only when needed
      const { getFirebaseAuth } = await import('../config/firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { getFirebaseDb } = await import('../config/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const userData = {
        username,
        email,
        totalMedals: { gold: 0, silver: 0, bronze: 0 },
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      const userInfo = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        username,
        totalMedals: { gold: 0, silver: 0, bronze: 0 },
        createdAt: userData.createdAt,
      };
      
      setUser(userInfo);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Lazy load Firebase only when needed
      const { getFirebaseAuth } = await import('../config/firebase');
      const { signOut } = await import('firebase/auth');
      
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};