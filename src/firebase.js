import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPnvwFrCPBaWWBYpF_MhVEmEk7xHuoHg4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "al-noor-quran-d6096.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "al-noor-quran-d6096",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "al-noor-quran-d6096.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "83251364481",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:83251364481:web:f230846995a0794d2ac380",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
