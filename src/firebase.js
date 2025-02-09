import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHHWZx8ppiiuQhl38c7SGDDJdtr80lRg8",
  authDomain: "zoevestica.firebaseapp.com",
  projectId: "zoevestica",
  storageBucket: "zoevestica.firebasestorage.app",
  messagingSenderId: "336294693046",
  appId: "1:336294693046:web:03787f9bfd1cc000123e17",
  measurementId: "G-TGNJFPH37C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)

export { app, auth, db };
