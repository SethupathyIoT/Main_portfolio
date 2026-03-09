import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkiH7_yAyoCu-r8xSLFMb7S1i1f6itVqk",
  authDomain: "portfolio-315f0.firebaseapp.com",
  projectId: "portfolio-315f0",
  storageBucket: "portfolio-315f0.firebasestorage.app",
  messagingSenderId: "334064031361",
  appId: "1:334064031361:web:77d157f77a1c1962695f80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
