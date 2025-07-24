import React, { useState, useEffect } from "react";

// Firebase CDN Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB3GgAgQvcuWElNsrZ0FaZSSYoPY0tnSTw",
  authDomain: "no-mercy-28e0a.firebaseapp.com",
  projectId: "no-mercy-28e0a",
  storageBucket: "no-mercy-28e0a.firebasestorage.app",
  messagingSenderId: "353208485106",
  appId: "1:353208485106:web:bc33f4d201cbfd95f8fc6b",
  measurementId: "G-DT0SXRFFGR"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Leaderboard Component
function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => list.push(doc.data()));
      setUsers(list);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="pt-20 p-4 text-white">
      <h2 className="text-2xl mb-4">Leaderboard</h2>
      <ol className="space-y-2">
        {users.map((u, idx) => (
          <li key={idx} className="bg-white/20 p-2 rounded">
            #{idx + 1} {u.name} - {u.xp} XP
          </li>
        ))}
      </ol>
    </div>
  );
}

// Achievements Component
function Achievements() {
  const achievements = [
    { title: "First Step", desc: "Completed your first task" },
    { title: "Early Bird", desc: "Completed a Wake Up task on time" },
    { title: "Streak Master", desc: "7 days without missing" },
    { title: "Death Survived", desc: "Completed all tasks on Death Mode day" }
  ];

  return (
    <div className="pt-20 p-4 text-white">
      <h2 className="text-2xl mb-4">Achievements</h2>
      <ul className="space-y-2">
        {achievements.map((a, idx) => (
          <li key={idx} className="bg-white/20 p-3 rounded">
            <strong>{a.title}</strong>
            <p className="text-sm">{a.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  // ==== AAPKE PURANE STATE & FUNCTIONS WAHI RAKHE ====
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState({});
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [selectedDeathDay, setSelectedDeathDay] = useState(null);
  const [selectedDeathDay2, setSelectedDeathDay2] = useState(null);
  const [deathDayLocked1, setDeathDayLocked1] = useState(false);
  const [deathDayLocked2, setDeathDayLocked2] = useState(false);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);
  const [missedOnStrictDay, setMissedOnStrictDay] = useState(false);
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));

  function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
  }

  const xpRequired = 500 * level;

  // ---- Firebase User Create / Load ----
  const handleGoogleLogin = async () => {
    // Yeh placeholder hai (aap already window.auth use kar rahe ho)
    alert("Google Login implementation aapke purane code me hai");
  };

  const handleLogout = async () => {
    setUser(null);
    setTasks({});
    setXp(0);
    setLevel(1);
    setXpFrozen(false);
    setForgiveLeft(6);
    setMissedOnStrictDay(false);
    setDeathDayLocked1(false);
    setDeathDayLocked2(false);
  };

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, { xp, level }).catch(() => {
        setDoc(userRef, {
          name: user.displayName || "Guest",
          xp,
          level
        });
      });
    }
  }, [xp, level, user]);

  // ==== AAPKE PURANE UI KA NAVBAR & PAGE HANDLING SAME ====
  const navbar = (
    <div className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white flex justify-between px-4 py-2 z-50">
      <div className="font-bold text-lg">No Mercy</div>
      <div className="space-x-2 text-sm">
        <button onClick={() => setPage("dashboard")} className="px-3 py-1 bg-red-600 rounded">Dashboard</button>
        <button onClick={() => setPage("leaderboard")} className="px-3 py-1 bg-yellow-600 rounded">Leaderboard</button>
        <button onClick={() => setPage("achievements")} className="px-3 py-1 bg-green-600 rounded">Achievements</button>
        <button onClick={handleLogout} className="px-3 py-1 bg-gray-700 rounded">Logout</button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="bg-white/20 p-6 rounded text-center">
          <h1 className="text-xl mb-4">Login to No Mercy</h1>
          <button onClick={handleGoogleLogin} className="bg-blue-600 px-4 py-2 rounded w-full">Login with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {navbar}
      {page === "dashboard" && (
        <div className="pt-20 p-4">
          <h1 className="text-2xl mb-2">Welcome, {user?.displayName}</h1>
          <p>Level: {level} | XP: {xp}/{xpRequired}</p>
        </div>
      )}
      {page === "leaderboard" && <Leaderboard />}
      {page === "achievements" && <Achievements />}
    </div>
  );
}
