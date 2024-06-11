import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAAle7CIc3ds64c2lSLptl-4juxkyLM4Jg",
  authDomain: "cuadernodigital-a5a10.firebaseapp.com",
  projectId: "cuadernodigital-a5a10",
  storageBucket: "cuadernodigital-a5a10.appspot.com",
  messagingSenderId: "466543308544",
  appId: "1:466543308544:web:6e9fc2108473cfc68c8de5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { db, auth };