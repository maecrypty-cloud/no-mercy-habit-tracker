import React, { useEffect, useState } from "react"; import { auth, db, provider } from "./firebase"; import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth"; import { doc, setDoc, getDoc, updateDoc, onSnapshot, } from "firebase/firestore"; import Navbar from "./Navbar"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements";

const App = () => { const [user, setUser] = useState(null); const [page, setPage] = useState("dashboard"); const [xp, setXp] = useState(0); const [level, setLevel] = useState(1); const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [forgiveLeft, setForgiveLeft] = useState(6); const [xpFrozen, setXpFrozen] = useState(false); const [missedOnStrictDay, setMissedOnStrictDay] = useState(false); const [deathDayLocked1, setDeathDayLocked1] = useState(false); const [deathDayLocked2, setDeathDayLocked2] = useState(false);

const today = new Date().toISOString().slice(0, 10);

// Load user data from Firestore const loadUserData = async (uid) => { const docRef = doc(db, "users", uid); const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const data = docSnap.data();
  setXp(data.xp || 0);
  setLevel(data.level || 1);
  setTasks(data.tasks || {});
  setForgiveLeft(data.forgiveLeft ?? 6);
  setXpFrozen(data.xpFrozen ?? false);
  setMissedOnStrictDay(data.missedOnStrictDay ?? false);
  setDeathDayLocked1(data.deathDayLocked1 ?? false);
  setDeathDayLocked2(data.deathDayLocked2 ?? false);
} else {
  await setDoc(docRef, {
    name: user.displayName,
    email: user.email,
    xp: 0,
    level: 1,
    tasks: {},
    forgiveLeft: 6,
    xpFrozen: false,
    missedOnStrictDay: false,
    deathDayLocked1: false,
    deathDayLocked2: false,
  });
}

};

// Sync data to Firestore const syncUserData = async () => { if (!user) return; await updateDoc(doc(db, "users", user.uid), { xp, level, tasks, forgiveLeft, xpFrozen, missedOnStrictDay, deathDayLocked1, deathDayLocked2, }); };

useEffect(() => { onAuthStateChanged(auth, async (currentUser) => { if (currentUser) { setUser(currentUser); await loadUserData(currentUser.uid); } else { setUser(null); } }); }, []);

useEffect(() => { if (user) syncUserData(); }, [xp, level, tasks, forgiveLeft, xpFrozen, missedOnStrictDay, deathDayLocked1, deathDayLocked2]);

const handleGoogleSignIn = () => { signInWithPopup(auth, provider); };

const handleSignOut = () => { signOut(auth); };

const addTask = () => { if (!input.trim()) return; const updatedTasks = { ...tasks }; if (!updatedTasks[today]) updatedTasks[today] = {}; const id = Object.keys(updatedTasks[today]).length; updatedTasks[today][id] = { text: input, completed: false }; setTasks(updatedTasks); setInput(""); };

const toggleTask = (taskId) => { const updatedTasks = { ...tasks }; updatedTasks[today][taskId].completed = !updatedTasks[today][taskId].completed; setTasks(updatedTasks); setXp((prevXp) => prevXp + (updatedTasks[today][taskId].completed ? 10 : -10)); };

useEffect(() => { const newLevel = Math.floor(xp / 100) + 1; setLevel(newLevel); }, [xp]);

const renderDashboard = () => ( <div className="p-4"> <h2 className="text-xl font-bold mb-2">Today's Tasks</h2> <div className="flex items-center mb-4"> <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a task" className="border rounded p-2 flex-grow" /> <button
onClick={addTask}
className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
> Add </button> </div> <div className="space-y-2"> {tasks[today] && Object.keys(tasks[today]).map((id) => ( <div key={id} onClick={() => toggleTask(id)} className={p-2 rounded cursor-pointer border flex justify-between ${ tasks[today][id].completed ? "bg-green-200" : "bg-red-100" }} > <span>{tasks[today][id].text}</span> <span> {tasks[today][id].completed ? "✅" : "⬜"} </span> </div> ))} </div>

{/* Progress Bar */}
  <div className="mt-6">
    <p className="mb-1">Level {level}</p>
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-blue-500 h-4 rounded-full"
        style={{ width: `${(xp % 100)}%` }}
      ></div>
    </div>
    <p className="text-sm mt-1">XP: {xp} / {(level * 100)}</p>
  </div>
</div>

);

const renderReport = () => ( <div className="p-4"> <h2 className="text-xl font-bold mb-4">User Report</h2> <ul className="space-y-1"> <li><strong>Name:</strong> {user.displayName}</li> <li><strong>Email:</strong> {user.email}</li> <li><strong>XP:</strong> {xp}</li> <li><strong>Level:</strong> {level}</li> <li><strong>Forgive Left:</strong> {forgiveLeft}</li> <li><strong>XP Frozen:</strong> {xpFrozen ? "Yes" : "No"}</li> <li><strong>Missed Strict Day:</strong> {missedOnStrictDay ? "Yes" : "No"}</li> <li><strong>Death Mode 1:</strong> {deathDayLocked1 ? "Locked" : "Open"}</li> <li><strong>Death Mode 2:</strong> {deathDayLocked2 ? "Locked" : "Open"}</li> </ul> </div> );

if (!user) return ( <div className="h-screen flex flex-col items-center justify-center"> <h1 className="text-2xl mb-4 font-bold">Welcome to No Mercy</h1> <button
onClick={handleGoogleSignIn}
className="px-6 py-2 bg-blue-600 text-white rounded shadow"
> Sign in with Google </button> </div> );

return ( <div className="min-h-screen bg-gray-50"> <Navbar setPage={setPage} handleSignOut={handleSignOut} /> {page === "dashboard" && renderDashboard()} {page === "leaderboard" && <Leaderboard />} {page === "achievements" && <Achievements />} {page === "report" && renderReport()} </div> ); };

export default App;

      
