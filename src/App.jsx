import React, { useEffect, useState } from "react"; import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth"; import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"; import { db } from "./firebaseconfig"; import { motion } from "framer-motion"; import { Sun, Moon } from "lucide-react";

import Navbar from "./Navbar"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements"; import Report from "./Report";

const App = () => { const [user, setUser] = useState(null); const [darkMode, setDarkMode] = useState(false); const [page, setPage] = useState("dashboard");

const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [xp, setXp] = useState(0); const [level, setLevel] = useState(1); const [forgiveLeft, setForgiveLeft] = useState(3); const [xpFrozen, setXpFrozen] = useState(false); const [missedOnStrictDay, setMissedOnStrictDay] = useState(false); const [deathDayLocked1, setDeathDayLocked1] = useState(false); const [deathDayLocked2, setDeathDayLocked2] = useState(false);

const auth = getAuth(); const provider = new GoogleAuthProvider();

const signIn = async () => { try { await signInWithPopup(auth, provider); } catch (err) { alert("Error signing in: " + err.message); } };

const saveData = async (uid, newData) => { try { await setDoc(doc(db, "users", uid), newData, { merge: true }); } catch (err) { console.error("Error saving to Firestore:", err); } };

useEffect(() => { const unsubscribe = onAuthStateChanged(auth, async (u) => { if (u) { setUser(u); const ref = doc(db, "users", u.uid); const snap = await getDoc(ref); if (snap.exists()) { const data = snap.data(); setTasks(data.tasks || {}); setXp(data.xp || 0); setLevel(data.level || 1); setForgiveLeft(data.forgiveLeft ?? 3); setXpFrozen(data.xpFrozen ?? false); setMissedOnStrictDay(data.missedOnStrictDay ?? false); setDeathDayLocked1(data.deathDayLocked1 ?? false); setDeathDayLocked2(data.deathDayLocked2 ?? false); } else { await saveData(u.uid, { tasks: {}, xp: 0, level: 1, forgiveLeft: 3, xpFrozen: false, missedOnStrictDay: false, deathDayLocked1: false, deathDayLocked2: false, }); } onSnapshot(ref, (docSnap) => { const d = docSnap.data(); setTasks(d.tasks); setXp(d.xp); setLevel(d.level); setForgiveLeft(d.forgiveLeft); setXpFrozen(d.xpFrozen); setMissedOnStrictDay(d.missedOnStrictDay); setDeathDayLocked1(d.deathDayLocked1); setDeathDayLocked2(d.deathDayLocked2); }); } else { setUser(null); } }); return () => unsubscribe(); }, []);

const addTask = async () => { if (!input.trim() || !user) return; const newTasks = { ...tasks, [Date.now()]: { name: input, done: false } }; setInput(""); await saveData(user.uid, { tasks: newTasks }); };

const toggleDark = () => setDarkMode((prev) => !prev);

return ( <div className={darkMode ? "dark bg-gray-900 text-white min-h-screen" : "bg-white text-black min-h-screen"}> <Navbar setPage={setPage} darkMode={darkMode} toggleDark={toggleDark} />

{!user ? (
    <div className="flex justify-center items-center h-screen">
      <button onClick={signIn} className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600">Sign in with Google</button>
    </div>
  ) : (
    <motion.div className="p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {page === "dashboard" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Welcome, {user.displayName}</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(xp % 100)}%` }}></div>
            </div>
            <span className="ml-2 text-sm">Level {level}</span>
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add new task"
              className="flex-grow px-4 py-2 border rounded-lg dark:bg-gray-800"
            />
            <button onClick={addTask} className="bg-green-500 text-white px-4 py-2 rounded-lg">Add</button>
          </div>
          <div className="grid gap-2">
            {Object.entries(tasks).map(([key, task]) => (
              <div key={key} className="flex justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
                <span>{task.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "leaderboard" && <Leaderboard />}
      {page === "achievements" && <Achievements />}
      {page === "report" && (
        <Report
          xp={xp} level={level} forgiveLeft={forgiveLeft} xpFrozen={xpFrozen}
          missedOnStrictDay={missedOnStrictDay} deathDayLocked1={deathDayLocked1} deathDayLocked2={deathDayLocked2}
          tasks={tasks}
        />
      )}
    </motion.div>
  )}
</div>

); };

export default App;

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
