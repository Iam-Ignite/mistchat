import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyB7PaES25YV3T-3y8X2_fwobhQmzh-R-8w",
  authDomain: "anonymous-message-7b254.firebaseapp.com",
  projectId: "anonymous-message-7b254",
  storageBucket: "anonymous-message-7b254.firebasestorage.app",
  messagingSenderId: "4607805684",
  appId: "1:4607805684:web:ff4f30013df761399ff6a1",
  measurementId: "G-6BXZPZ77SF"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);