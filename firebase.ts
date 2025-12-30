import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// INSTRUCTIONS:
// 1. Go to Firebase Console -> Project Settings -> General
// 2. Scroll down to "Your apps"
// 3. Copy the 'firebaseConfig' object keys and paste them below.
// ------------------------------------------------------------------

const firebaseConfig = {
  // PASTE YOUR KEYS HERE (Replace these placeholder strings):
  apiKey: "YOUR_API_KEY_GOES_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services so the app can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();