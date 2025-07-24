import React, { useState, useEffect } from "react"; import { auth, db, provider } from "./firebaseConfig"; import { signInWithPopup, onAuthStateChanged, signOut, } from "firebase/auth"; import { doc, setDoc, getDoc, updateDoc, onSnapshot, } from "firebase/firestore"; import Navbar from "./Navbar"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements"; import Report from "./Report";

const App = () => { const [page, setPage] = useState("dashboard"); const [user, setUser] = useState(null); const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [strictMode, setStrictMode] = useState(false); const [xp, setXp] = useState(0); const [level, setLevel] = useState(1); const [forgiveLeft, setForgiveLeft] = useState(1); const [xpFrozen, setXpFrozen] = useState(false); const [missedOnStrictDay, setMissedOnStrictDay] = useState(false); const [deathDayLocked1, setDeathDayLocked1] = useState(false); const [deathDayLocked2, setDeathDayLocked2] = useState(false);

const today = new Date().toISOString().split("T")[0];

useEffect(() => { onAuthStateChanged(auth, async (currentUser) => { setUser(currentUser); if (currentUser) { const docRef = doc(db, "users", currentUser.uid);

const syncUserData = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTasks(data.tasks || {});
        setXp(data.xp || 0);
        setLevel(data.level || 1);
        setForgiveLeft(data.forgiveLeft ?? 1);
        setXpFrozen(data.xpFrozen ?? false);
        setMissedOnStrictDay(data.missedOnStrictDay ?? false);
        setDeathDayLocked1(data.deathDayLocked1 ?? false);
        setDeathDayLocked2(data.deathDayLocked2 ?? false);
      } else {
        await setDoc(docRef, {
          name: currentUser.displayName,
          email: currentUser.email,
          xp: 0,
          level: 1,
          tasks: {},
          forgiveLeft: 1,
          xpFrozen: false,
          missedOnStrictDay: false,
          deathDayLocked1: false,
          deathDayLocked2: false,
        });
      }

      onSnapshot(docRef, (docSnap) => {
        const data = docSnap.data();
        setTasks(data.tasks || {});
        setXp(data.xp || 0);
        setLevel(data.level || 1);
        setForgiveLeft(data.forgiveLeft ?? 1);
        setXpFrozen(data.xpFrozen ?? false);
        setMissedOnStrictDay(data.missedOnStrictDay ?? false);
        setDeathDayLocked1(data.deathDayLocked1 ?? false);
        setDeathDayLocked2(data.deathDayLocked2 ?? false);
      });
    };

    syncUserData();
  }
});

}, []);

const syncToFirestore = async () => { if (!user) return; const docRef = doc(db, "users", user.uid); await updateDoc(docRef, { xp, level, tasks, forgiveLeft, xpFrozen, missedOnStrictDay, deathDayLocked1, deathDayLocked2, }); };

useEffect(() => { syncToFirestore(); }, [xp, level, tasks, forgiveLeft, xpFrozen, missedOnStrictDay, deathDayLocked1, deathDayLocked2]);

const addTask = () => { const newTasks = { ...tasks, [today]: [...(tasks[today] || []), { text: input, done: false }], }; setTasks(newTasks); setInput(""); };

const toggleTask = (index) => { const newTasks = { ...tasks }; newTasks[today][index].done = !newTasks[today][index].done; setTasks(newTasks); setXp(xp + (newTasks[today][index].done ? 10 : -10)); if (xp >= level * 100) setLevel(level + 1); };

const handleSignIn = () => signInWithPopup(auth, provider); const handleSignOut = () => signOut(auth);

return ( <div className="min-h-screen bg-gray-900 text-white p-4"> <Navbar setPage={setPage} handleSignOut={handleSignOut} user={user} />

{!user ? (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-3xl mb-4">Sign in to continue</h1>
      <button onClick={handleSignIn} className="bg-blue-500 px-6 py-2 rounded">Sign in with Google</button>
    </div>
  ) : (
    <div className="mt-4">
      {page === "dashboard" && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-black px-2 py-1 rounded mr-2"
            />
            <button onClick={addTask} className="bg-green-500 px-4 py-1 rounded">Add</button>
          </div>
          <ul>
            {(tasks[today] || []).map((task, i) => (
              <li
                key={i}
                onClick={() => toggleTask(i)}
                className={`cursor-pointer mb-2 ${task.done ? "line-through text-green-400" : ""}`}
              >
                {task.text}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <h2>XP: {xp} | Level: {level}</h2>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
              <div className="bg-green-400 h-4 rounded-full" style={{ width: `${(xp % 100)}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {page === "report" && (
        <Report
          tasks={tasks}
          xp={xp}
          level={level}
          forgiveLeft={forgiveLeft}
          xpFrozen={xpFrozen}
          missedOnStrictDay={missedOnStrictDay}
          deathDayLocked1={deathDayLocked1}
          deathDayLocked2={deathDayLocked2}
        />
      )}

      {page === "leaderboard" && <Leaderboard />}
      {page === "achievements" && <Achievements />}
    </div>
  )}
</div>

); };

export default App;

        
