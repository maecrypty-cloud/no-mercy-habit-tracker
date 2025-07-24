// firebaseConfig.js (ES Modules version)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrqLVyX7d3_fb9CPjcvs3srh8hRA7d1OI",
  authDomain: "no-mercy-2e372.firebaseapp.com",
  projectId: "no-mercy-2e372",
  storageBucket: "no-mercy-2e372.firebasestorage.app",
  messagingSenderId: "363291533348",
  appId: "1:363291533348:web:2deec586a5bc831b9678b1",
  measurementId: "G-XD74PL8KXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
