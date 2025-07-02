import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const initialPrompts = [
  "What's the most ridiculous solution to climate change you can think of?",
  "If you could add one completely useless feature to smartphones, what would it be?",
  "What's the worst possible name for a luxury hotel?",
  "How would you explain the internet to someone from the 1800s?",
  "What's the most awkward superpower you could have?",
  "If animals could leave Yelp reviews for humans, what would they say?",
  "What would be the worst product to add 'smart' technology to?"
];

export const initializePrompts = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have a prompt for today
    const promptsRef = collection(db, 'prompts');
    const promptQuery = query(promptsRef, where('date', '==', today));
    const promptSnapshot = await getDocs(promptQuery);
    
    if (promptSnapshot.empty) {
      // Get the day of year to select a prompt
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const promptIndex = dayOfYear % initialPrompts.length;
      
      // Add today's prompt
      await addDoc(promptsRef, {
        text: initialPrompts[promptIndex],
        date: today,
        createdAt: new Date().toISOString()
      });
      
      console.log('Successfully initialized prompt for today');
    } else {
      console.log('Prompt for today already exists');
    }
  } catch (error) {
    console.error('Error initializing prompts:', error);
  }
}; 