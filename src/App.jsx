import React, { useState, useEffect } from "react"; import Navbar from "./Navbar"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements"; import { auth, db } from "./firebase"; import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; import { onAuthStateChanged } from "firebase/auth";

const App = () => { const [page, setPage] = useState("dashboard"); const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [strictMode, setStrictMode] = useState(false); const [user, setUser] = useState(null);

const [xp, setXp] = useState(0); const [level, setLevel] = useState(1); const [forgiveLeft, setForgiveLeft] = useState(6); const [xpFrozen, setXpFrozen] = useState(false); const [missedOnStrictDay, setMissedOnStrictDay] = useState(false); const [deathDayLocked1, setDeathDayLocked1] = useState(false); const [deathDayLocked2, setDeathDayLocked2] = useState(false);

const today = new Date().toISOString().split("T")[0];

useEffect(() => { onAuthStateChanged(auth, async (currentUser) => { if (currentUser) { setUser(currentUser); const userRef = doc(db, "users", currentUser.uid); const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
      const data = userSnap.data();
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setForgiveLeft(data.forgiveLeft ?? 6);
      setXpFrozen(data.xpFrozen || false);
      setMissedOnStrictDay(data.missedOnStrictDay || false);
      setDeathDayLocked1(data.deathDayLocked1 || false);
      setDeathDayLocked2(data.deathDayLocked2 || false);
      setTasks(data.tasks || {});
    } else {
      const initialData = {
        name: currentUser.displayName || "Anonymous",
        email: currentUser.email,
        xp: 0,
        level: 1,
        forgiveLeft: 6,
        xpFrozen: false,
        missedOnStrictDay: false,
        deathDayLocked1: false,
        deathDayLocked2: false,
        tasks: {}
      };
      await setDoc(userRef, initialData);
    }
  }
});

}, []);

const syncToFirestore = async (newData = {}) => { if (user) { await updateDoc(doc(db, "users", user.uid), { xp, level, forgiveLeft, xpFrozen, missedOnStrictDay, deathDayLocked1, deathDayLocked2, tasks, ...newData }); } };

useEffect(() => { syncToFirestore(); }, [xp, level, forgiveLeft, xpFrozen, missedOnStrictDay, deathDayLocked1, deathDayLocked2, tasks]);

const handleAddTask = () => { const updatedTasks = { ...tasks, [today]: { ...(tasks[today] || {}), [Object.keys(tasks[today] || {}).length]: { text: input, completed: false } } }; setTasks(updatedTasks); setInput(""); };

const toggleTaskCompletion = (date, index) => { const updatedTasks = { ...tasks }; updatedTasks[date][index].completed = !updatedTasks[date][index].completed; setTasks(updatedTasks); if (updatedTasks[date][index].completed) { const gainedXp = 10; const newXp = xp + gainedXp; setXp(newXp); if (newXp >= level * 100) { setLevel(level + 1); setXp(newXp - level * 100); } } };

const renderDashboard = () => ( <div className="p-4 space-y-4"> <h1 className="text-xl font-bold">Today's Tasks</h1> <div className="flex gap-2"> <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="border p-2 rounded w-full" placeholder="Add new task" /> <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button> </div> <ul className="space-y-2"> {tasks[today] && Object.entries(tasks[today]).map(([index, task]) => ( <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded"> <span className={task.completed ? "line-through" : ""}>{task.text}</span> <button onClick={() => toggleTaskCompletion(today, index)} className={px-3 py-1 rounded text-white ${task.completed ? "bg-green-600" : "bg-gray-600"}} > {task.completed ? "Done" : "Mark"} </button> </li> ))} </ul> </div> );

const renderReport = () => ( <div className="p-4 space-y-4"> <h2 className="text-xl font-bold mb-2">📊 Report</h2> <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> <div className="bg-white shadow p-4 rounded">XP: {xp}</div> <div className="bg-white shadow p-4 rounded">Level: {level}</div> <div className="bg-white shadow p-4 rounded">Forgive Left: {forgiveLeft}</div> <div className="bg-white shadow p-4 rounded">XP Frozen: {xpFrozen ? "Yes" : "No"}</div> <div className="bg-white shadow p-4 rounded">Missed On Strict Day: {missedOnStrictDay ? "Yes" : "No"}</div> <div className="bg-white shadow p-4 rounded">Death Mode 1: {deathDayLocked1 ? "Locked" : "Open"}</div> <div className="bg-white shadow p-4 rounded">Death Mode 2: {deathDayLocked2 ? "Locked" : "Open"}</div> </div>

<h3 className="text-lg font-semibold mt-4">📅 Task History</h3>
  {Object.entries(tasks).map(([date, dayTasks]) => (
    <div key={date} className="border-b pb-2 mb-2">
      <h4 className="font-bold">{date}</h4>
      <ul className="list-disc ml-6">
        {Object.entries(dayTasks).map(([index, task]) => (
          <li key={index} className={task.completed ? "line-through" : ""}>{task.text}</li>
        ))}
      </ul>
    </div>
  ))}
</div>

);

return ( <div className="min-h-screen bg-gray-50 text-gray-800"> <Navbar setPage={setPage} /> {page === "dashboard" && renderDashboard()} {page === "leaderboard" && <Leaderboard />} {page === "achievements" && <Achievements />} {page === "report" && renderReport()} </div> ); };

export default App;

  
