import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7BqbCKaETqH-UT1M8He9vMl944aa5XqE",
  authDomain: "dormicor-8e292.firebaseapp.com",
  projectId: "dormicor-8e292",
  storageBucket: "dormicor-8e292.firebasestorage.app",
  messagingSenderId: "106039580379",
  appId: "1:106039580379:web:5f713234655921c6f11efe",
  measurementId: "G-SKC0PT47D5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);