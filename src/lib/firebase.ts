import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "gen-lang-client-0384014843",
  appId: "1:177495368784:web:1aa7d27fd5f91f7e221d55",
  apiKey: "AIzaSyAbkHUBKPAnRZc10r-wIF8WzwVzdPFrvOk",
  authDomain: "gen-lang-client-0384014843.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-portalhdricochac-6791427b-220c-4f00-b61c-3e981ae4e131",
  storageBucket: "gen-lang-client-0384014843.firebasestorage.app",
  messagingSenderId: "177495368784",
  measurementId: "",
  oAuthClientId: "177495368784-h8ju1nu83754vtrd85p2u8bv33spk4q8.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { collection, doc, onSnapshot, addDoc, updateDoc, setDoc, getDocs, deleteDoc };

