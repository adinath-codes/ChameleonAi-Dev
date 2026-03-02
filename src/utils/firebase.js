import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAtSev133f9trVDhmMv8QIME3F0x7Tqlf4",
  authDomain: "chameChameleonai-7f4cd.firebaseapp.com",
  projectId: "chameChameleonai-7f4cd",
  storageBucket: "chameChameleonai-7f4cd.firebasestorage.app",
  messagingSenderId: "758930510244",
  appId: "1:758930510244:web:5ded6ac5b24f5b103cb131",
  measurementId: "G-Y4LMBCNY2Q",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
