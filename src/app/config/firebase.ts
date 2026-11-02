import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


//  ES LA CONFIGURACION E INICIALIZACION DE LA CONEXION A FIREBASE

const firebaseConfig = {
  apiKey: "",
  authDomain: "dormicor-1f2e3.firebaseapp.com",
  projectId: "dormicor-1f2e3",
  storageBucket: "dormicor-1f2e3.firebasestorage.app",
  messagingSenderId: "20480389789",
  appId: "1:20480389789:web:1da493f2b28098d3705a74",
  measurementId: "G-DM8NZM59BR"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);