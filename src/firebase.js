// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Import Firebase Storage

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCMItkyOlPPgRlV2mlIDChTy11fj6Afw4o",
  authDomain: "als-system-f4fd9.firebaseapp.com",
  projectId: "als-system-f4fd9",
  storageBucket: "als-system-f4fd9.appspot.com", // ✅ Make sure this is correct
  messagingSenderId: "247214488500",
  appId: "1:247214488500:web:2bc61bb029968f395490e1"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Initialize Firebase Storage

// ✅ Export all required services
export { auth, db, storage, sendPasswordResetEmail };
