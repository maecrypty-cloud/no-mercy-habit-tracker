// src/firebaseConfig.js

// Firebase CDN se load ho chuka hai isliye window.firebase use karenge
const firebaseConfig = {
  apiKey: "AIzaSyDrqLVyX7d3_fb9CPjcvs3srh8hRA7d1OI",
  authDomain: "no-mercy-2e372.firebaseapp.com",
  projectId: "no-mercy-2e372",
  storageBucket: "no-mercy-2e372.appspot.com",
  messagingSenderId: "363291533348",
  appId: "1:363291533348:web:2deec586a5bc831b9678b1",
  measurementId: "G-XD74PL8KXJ"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
