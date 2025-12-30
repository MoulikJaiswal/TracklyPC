import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABuDd5YLHJC3FwJQRtacPtXWEzJ3qk2bk",
  authDomain: "tracklypc.firebaseapp.com",
  projectId: "tracklypc",
  storageBucket: "tracklypc.firebasestorage.app",
  messagingSenderId: "509028484372",
  appId: "1:509028484372:web:999d1d261e487ee25cae01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services so the app can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();