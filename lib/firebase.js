import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdEUD3B8mfuFEfJOn7Zfe3GVUEDyKQA0o",
  authDomain: "conceptmate-e7798.firebaseapp.com",
  projectId: "conceptmate-e7798",
  storageBucket: "conceptmate-e7798.firebasestorage.app",
  messagingSenderId: "1012287364458",
  appId: "1:1012287364458:web:a730a05ea59e2d0a725913"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
