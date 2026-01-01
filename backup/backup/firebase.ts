// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmV1UAivK9_-kVXTOg3Eu51K1EY_mAkk8",
  authDomain: "werkaholic-ai.firebaseapp.com",
  projectId: "werkaholic-ai",
  storageBucket: "werkaholic-ai.firebasestorage.app",
  messagingSenderId: "906845471256",
  appId: "1:906845471256:web:ef947e1f640e0a0456796d",
  measurementId: "G-G454GXK1Z6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Only initialize analytics in browser environment, not in headless/test environments
let analytics;
try {
  if (typeof window !== 'undefined' && !window.navigator.webdriver) {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics initialization failed:', error);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;