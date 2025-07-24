// firebaseConfig.js (CDN version)
const firebaseConfig = {
  apiKey: "AIzaSyDrqLVyX7d3_fb9CPjcvs3srh8hRA7d1OI",
  authDomain: "no-mercy-2e372.firebaseapp.com",
  projectId: "no-mercy-2e372",
  storageBucket: "no-mercy-2e372.firebasestorage.app",
  messagingSenderId: "363291533348",
  appId: "1:363291533348:web:2deec586a5bc831b9678b1",
  measurementId: "G-XD74PL8KXJ"
};

// Firebase initialize
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();

export { auth, provider, db };
