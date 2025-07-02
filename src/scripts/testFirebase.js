import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from the database
    const testRef = collection(db, 'test');
    const snapshot = await getDocs(testRef);
    console.log('✅ Firebase connection successful!');
    console.log('Found', snapshot.size, 'test documents');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}; 