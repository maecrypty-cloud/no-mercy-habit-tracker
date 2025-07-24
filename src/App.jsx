// App.jsx import React, { useState, useEffect } from "react"; import { initializeApp } from "firebase/app"; import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth"; import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase Config const firebaseConfig = { apiKey: "AIzaSyB3GgAgQvcuWElNsrZ0FaZSSYoPY0tnSTw", authDomain: "no-mercy-28e0a.firebaseapp.com", projectId: "no-mercy-28e0a", storageBucket: "no-mercy-28e0a.firebasestorage.app", messagingSenderId: "353208485106", appId: "1:353208485106:web:bc33f4d201cbfd95f8fc6b", measurementId: "G-DT0SXRFFGR" }; const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);

const App = () => { const [user, setUser] = useState(null); const [dark, setDark] = useState(false); const [xp, setXP] = useState(0); const [level, setLevel] = useState(1); const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [wakeUpTime, setWakeUpTime] = useState("06:00"); const [strictMode, setStrictMode] = useState(false); const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

useEffect(() => { onAuthStateChanged(auth, async (u) => { if (u) { setUser(u); const docRef = doc(db, "users", u.uid); const snap = await getDoc(docRef); if (snap.exists()) { const data = snap.data(); setXP(data.xp || 0); setLevel(data.level || 1); setTasks(data.tasks || {}); setWakeUpTime(data.wakeUpTime || "06:00"); setStrictMode(data.strictMode || false); } } }); }, []);

useEffect(() => { if (user) { const data = { xp, level, tasks, wakeUpTime, strictMode }; setDoc(doc(db, "users", user.uid), data); } }, [xp, level, tasks, wakeUpTime, strictMode]);

const handleAddTask = () => { if (!input.trim()) return; const id = Date.now(); const today = selectedDate; const newTask = { id, title: input, time: new Date().toLocaleTimeString([], { hour12: false }), duration: "30", done: false }; setTasks((prev) => { const updated = { ...prev, [today]: [...(prev[today] || []), newTask] }; return updated; }); setInput(""); };

const handleTaskToggle = (id) => { const today = selectedDate; const updated = tasks[today].map((t) => t.id === id ? { ...t, done: !t.done } : t ); setTasks({ ...tasks, [today]: updated }); if (!tasks[today].find((t) => t.id === id).done) setXP((prev) => prev + 10); };

const handleDeathMode = () => { const today = new Date().toISOString().slice(0, 10); const now = new Date(); const [wakeH, wakeM] = wakeUpTime.split(":").map(Number); const deadline = new Date(now); deadline.setHours(wakeH, wakeM, 0, 0); if (now > deadline && strictMode) { setXP(0); setLevel(1); } };

useEffect(() => { const interval = setInterval(handleDeathMode, 60000); return () => clearInterval(interval); }, [wakeUpTime, strictMode]);

const levelCap = 100; const progress = (xp % levelCap); const progressPercent = (progress / levelCap) * 100;

return ( <div className={dark ? "bg-gray-900 text-white min-h-screen" : "bg-white text-black min-h-screen p-4"}> <div className="flex justify-between items-center mb-4"> <h1 className="text-2xl font-bold">No Mercy</h1> <div> <button onClick={() => setDark(!dark)} className="mr-2">{dark ? "☀️" : "🌙"}</button> {user ? ( <button onClick={() => signOut(auth)}>Logout</button> ) : ( <button onClick={async () => { const provider = new GoogleAuthProvider(); const result = await signInWithPopup(auth, provider); setUser(result.user); }} >Login with Google</button> )} </div> </div>

{user && (
    <div>
      <div className="mb-2">
        <label>Wake-Up Time:</label>
        <input type="time" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)} className="ml-2" />
        <label className="ml-4">
          <input type="checkbox" checked={strictMode} onChange={(e) => setStrictMode(e.target.checked)} /> Strict Mode
        </label>
      </div>

      <div className="mb-2">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="ml-2"
        />
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Add task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-1"
        />
        <button onClick={handleAddTask} className="ml-2 bg-blue-500 text-white px-2 py-1 rounded">Add</button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Tasks for {selectedDate}:</h2>
        {(tasks[selectedDate] || []).map((task) => (
          <div key={task.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 my-1 rounded">
            <span>{task.title}</span>
            <div className="flex items-center">
              <span className="text-sm mr-2">{task.time} ({task.duration} min)</span>
              <input type="checkbox" checked={task.done} onChange={() => handleTaskToggle(task.id)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p>XP: {xp} | Level: {level}</p>
        <div className="h-4 w-full bg-gray-300 rounded overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-700 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">📊 Your Report</h2>
        <p>Total XP: {xp}</p>
        <p>Level: {level}</p>
        <p>Wake Time: {wakeUpTime}</p>
        <p>Strict Mode: {strictMode ? "ON" : "OFF"}</p>
        <p>Total Tasks: {Object.values(tasks).flat().length}</p>
      </div>
    </div>
  )}
</div>

); };

export default App;

                                                                                                
