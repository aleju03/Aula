// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAAle7CIc3ds64c2lSLptl-4juxkyLM4Jg",
  authDomain: "cuadernodigital-a5a10.firebaseapp.com",
  projectId: "cuadernodigital-a5a10",
  storageBucket: "cuadernodigital-a5a10.appspot.com",
  messagingSenderId: "466543308544",
  appId: "1:466543308544:web:6e9fc2108473cfc68c8de5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };