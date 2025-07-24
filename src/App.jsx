// Full-featured App.jsx import React, { useState, useEffect } from "react"; import { motion } from "https://cdn.skypack.dev/framer-motion";

// Firebase CDN setup import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js"; import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js"; import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";

const firebaseConfig = { apiKey: "AIzaSyB3GgAgQvcuWElNsrZ0FaZSSYoPY0tnSTw", authDomain: "no-mercy-28e0a.firebaseapp.com", projectId: "no-mercy-28e0a", storageBucket: "no-mercy-28e0a.appspot.com", messagingSenderId: "353208485106", appId: "1:353208485106:web:bc33f4d201cbfd95f8fc6b", measurementId: "G-DT0SXRFFGR" };

const app = initializeApp(firebaseConfig); const db = getFirestore(); const auth = getAuth(); const provider = new GoogleAuthProvider();

const App = () => { const [user, setUser] = useState(null); const [darkMode, setDarkMode] = useState(false); const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [taskTime, setTaskTime] = useState(""); const [taskDuration, setTaskDuration] = useState(""); const [xp, setXp] = useState(0); const [level, setLevel] = useState(1); const [strictMode, setStrictMode] = useState(false); const [wakeUpTime, setWakeUpTime] = useState("06:00"); const today = new Date().toISOString().split('T')[0];

useEffect(() => { onAuthStateChanged(auth, async (u) => { if (u) { setUser(u); const ref = doc(db, "users", u.uid); const snap = await getDoc(ref); if (snap.exists()) { const data = snap.data(); setTasks(data.tasks || {}); setXp(data.xp || 0); setLevel(data.level || 1); setStrictMode(data.strictMode || false); setWakeUpTime(data.wakeUpTime || "06:00"); } else { await setDoc(ref, { tasks: {}, xp: 0, level: 1, strictMode: false, wakeUpTime: "06:00" }); } } else { setUser(null); } }); }, []);

useEffect(() => { if (user) { updateDoc(doc(db, "users", user.uid), { tasks, xp, level, strictMode, wakeUpTime }); } }, [tasks, xp, level, strictMode, wakeUpTime]);

const handleAddTask = () => { if (!input || !taskTime || !taskDuration) return; const newTask = { text: input, done: false, time: taskTime, duration: taskDuration }; setTasks(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), newTask] })); setInput(""); setTaskTime(""); setTaskDuration(""); };

const toggleTask = (index) => { const dayTasks = tasks[today] || []; const newDayTasks = dayTasks.map((task, i) => i === index ? { ...task, done: !task.done } : task ); setTasks(prev => ({ ...prev, [today]: newDayTasks })); if (!dayTasks[index].done) addXp(10); };

const addXp = (amount) => { const newXp = xp + amount; if (newXp >= level * 100) { setLevel(level + 1); setXp(newXp - level * 100); } else { setXp(newXp); } };

const checkDeathMode = () => { const now = new Date(); const [h, m] = wakeUpTime.split(":").map(Number); const wakeTime = new Date(); wakeTime.setHours(h, m, 0, 0); const missed = (now > wakeTime && (tasks[today] || []).some(t => !t.done)); if (strictMode && missed) { alert("You missed a task. XP reset!"); setXp(0); setLevel(1); } };

useEffect(() => { const id = setInterval(checkDeathMode, 60000); return () => clearInterval(id); }, [tasks, strictMode, wakeUpTime]);

const signIn = () => signInWithPopup(auth, provider); const logOut = () => signOut(auth);

if (!user) return <div className="p-4 text-center"><button className="bg-blue-500 text-white px-4 py-2" onClick={signIn}>Sign in with Google</button></div>;

return ( <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-white text-black min-h-screen"}> <nav className="flex justify-between p-4 shadow"> <span>No Mercy</span> <div> <button onClick={() => setDarkMode(!darkMode)}>Toggle Theme</button> <button className="ml-2 text-sm underline" onClick={logOut}>Logout</button> </div> </nav>

<div className="p-4 space-y-4">
    <h1 className="text-xl">Welcome, {user.displayName}</h1>

    <div className="space-y-2">
      <label>Custom Wake-up Time:</label>
      <input type="time" className="border p-1" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)} />

      <label>Date:</label>
      <input type="date" className="border p-1" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />

      <div className="flex gap-2">
        <input placeholder="Task" className="border p-1" value={input} onChange={(e) => setInput(e.target.value)} />
        <input type="time" className="border p-1" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} />
        <input placeholder="Duration" className="border p-1" value={taskDuration} onChange={(e) => setTaskDuration(e.target.value)} />
        <button onClick={handleAddTask} className="bg-green-500 text-white px-2">Add</button>
      </div>
    </div>

    <h2 className="text-lg">Today's Tasks ({today})</h2>
    {(tasks[today] || []).map((task, index) => (
      <div key={index} className="flex justify-between p-2 border rounded">
        <div>
          <strong>{task.text}</strong><br />
          <small>{task.time} | {task.duration}</small>
        </div>
        <input type="checkbox" checked={task.done} onChange={() => toggleTask(index)} />
      </div>
    ))}

    <div className="mt-4">
      <label>Strict Mode:</label>
      <input type="checkbox" className="ml-2" checked={strictMode} onChange={(e) => setStrictMode(e.target.checked)} />
    </div>

    <div className="mt-4">
      <p>XP: {xp} / {level * 100}</p>
      <motion.div className="bg-gray-300 h-4 rounded overflow-hidden">
        <motion.div className="bg-blue-600 h-4" initial={{ width: 0 }} animate={{ width: `${(xp / (level * 100)) * 100}%` }} />
      </motion.div>
      <p>Level: {level}</p>
    </div>

    <div className="mt-4">
      <h2 className="text-lg">Report</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto">
        {JSON.stringify({ xp, level, tasks: tasks[today] }, null, 2)}
      </pre>
    </div>
  </div>
</div>

); };

export default App;

    
