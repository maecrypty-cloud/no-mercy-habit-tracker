import React, { useState, useEffect } from "react";
import { auth, db, googleProvider } from "./firebaseConfig"; // Fixed import
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import Leaderboard from "./Leaderboard";
import Achievements from "./Achievements";

export default function App() {
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

  function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
  }
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));
  const xpRequired = 500 * level;

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
      // Reset only after logout
      setTasks({});
      setXp(0);
      setLevel(1);
      setXpFrozen(false);
      setForgiveLeft(6);
      setMissedOnStrictDay(false);
      setDeathDayLocked1(false);
      setDeathDayLocked2(false);
      setPage("dashboard");
    }
  });
  return () => unsubscribe();
}, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setTasks({});
    setXp(0);
    setLevel(1);
    setXpFrozen(false);
    setForgiveLeft(6);
    setMissedOnStrictDay(false);
    setDeathDayLocked1(false);
    setDeathDayLocked2(false);
    setPage("dashboard");
  };

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setXp(data.xp || 0);
          setLevel(data.level || 1);
        } else {
          setDoc(userRef, { name: user.displayName, email: user.email, xp: 0, level: 1 });
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, { xp, level }).catch(console.error);
    }
  }, [xp, level, user]);

  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  const isDeathDayToday = () => {
    const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return todayDayName === selectedDeathDay || todayDayName === selectedDeathDay2;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentWeek = getWeekNumber(now);

      if (currentDate !== today) {
        setToday(currentDate);
        setXpFrozen(false);
        setMissedOnStrictDay(false);
      }
      if (currentWeek !== weekNumber) {
        setWeekNumber(currentWeek);
        setDeathDayLocked1(false);
        setDeathDayLocked2(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [today, weekNumber]);

  const addTask = (task) => {
    setTasks((prev) => {
      const existing = prev[task.date] || [];
      return { ...prev, [task.date]: [...existing, task] };
    });
  };

  const completeTask = (date, index) => {
    if (xpFrozen || missedOnStrictDay) return;
    const newDateTasks = [...(tasks[date] || [])];
    if (newDateTasks[index].done) return;

    if (newDateTasks[index].name.toLowerCase() === "wake up") {
      const now = new Date();
      const taskTime = new Date(`${newDateTasks[index].date}T${newDateTasks[index].time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("Wake Up task late! XP frozen for today.");
      }
    }

    newDateTasks[index].done = true;
    setTasks((prev) => ({ ...prev, [date]: newDateTasks }));

    if (!xpFrozen && !missedOnStrictDay) setXp((prev) => prev + 10);
  };

  const forgiveTask = (date, index) => {
    if (isDeathDayToday()) {
      alert("Strict mode active today, forgives are not allowed!");
      return;
    }
    if (forgiveLeft <= 0) {
      alert("No forgives left!");
      return;
    }
    const newDateTasks = [...(tasks[date] || [])];
    if (newDateTasks[index].name.toLowerCase() === "wake up") {
      setXpFrozen(true);
      alert("Wake Up task forgiven, XP frozen for today!");
    }
    newDateTasks[index].done = true;
    setTasks((prev) => ({ ...prev, [date]: newDateTasks }));
    setForgiveLeft((prev) => prev - 1);
  };

  useEffect(() => {
    if (isDeathDayToday()) {
      const todayTasks = tasks[today] || [];
      const allDone = todayTasks.length === 0 || todayTasks.every((t) => t.done);
      if (!allDone) setMissedOnStrictDay(true);
    }
  }, [tasks, today]);

  const filteredTasks = tasks[today] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const rawDate = e.target.date.value;
    const normalizedDate = new Date(rawDate).toISOString().split("T")[0];
    const time = e.target.time.value;
    const duration = e.target.duration.value;
    if (!name || !rawDate || !time) return alert("Please fill all fields!");
    const taskObj = { name, date: normalizedDate, time, duration, done: false };
    addTask(taskObj);
    e.target.reset();
  };

  const navbar = (
    <div className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white flex justify-between px-4 py-2 z-50">
      <div className="font-bold text-lg">No Mercy</div>
      <div className="space-x-2 text-sm">
        <button onClick={() => setPage("dashboard")} className="px-3 py-1 bg-red-600 rounded">Dashboard</button>
        <button onClick={() => setPage("reports")} className="px-3 py-1 bg-blue-600 rounded">Reports</button>
        <button onClick={() => setPage("deathmode")} className="px-3 py-1 bg-purple-600 rounded">Death Mode</button>
        <button onClick={() => setPage("leaderboard")} className="px-3 py-1 bg-yellow-600 rounded">Leaderboard</button>
        <button onClick={() => setPage("achievements")} className="px-3 py-1 bg-green-600 rounded">Achievements</button>
        <button onClick={handleLogout} className="px-3 py-1 bg-gray-700 rounded">Logout</button>
      </div>
    </div>
  );

  const strictModeBanner = isDeathDayToday() && (
    <div className="w-full bg-red-700 text-white text-center py-2 font-bold text-lg mt-12">
      ⚠ STRICT MODE ACTIVE TODAY - NO FORGIVES & ALL TASKS MANDATORY ⚠
      {missedOnStrictDay && " (XP Locked - You missed a task!)"}
    </div>
  );

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.alphacoders.com/128/1280491.jpg')` }}>
        <div className="bg-white/20 p-6 rounded text-white text-center">
          <h1 className="text-xl mb-4">Login to No Mercy</h1>
          <button onClick={handleGoogleLogin} className="bg-blue-600 px-4 py-2 rounded w-full">
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('https://images.alphacoders.com/128/1280491.jpg')` }}>
      {navbar}
      {strictModeBanner}
      {page === "dashboard" && (
        <div className="pt-20 p-4 text-white">
          <h1 className="text-2xl mb-2">Welcome, {user?.displayName}</h1>
          <p>Level: {level} | XP: {xp}/{xpRequired} {(xpFrozen || missedOnStrictDay) && "(Frozen)"} | Forgives Left: {forgiveLeft}</p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
            <input type="text" name="name" placeholder="Task name" className="p-2 rounded text-black" required />
            <input type="date" name="date" className="p-2 rounded text-black" required />
            <input type="time" name="time" className="p-2 rounded text-black" required />
            <input type="number" name="duration" min="5" defaultValue={30} className="p-2 rounded text-black" />
            <button type="submit" className="bg-green-600 px-4 py-2 rounded">Add</button>
          </form>
          <h2 className="text-xl mt-4 mb-2">Today's Tasks</h2>
          {filteredTasks.length > 0 ? (
            <ul className="space-y-2">
              {filteredTasks.map((task, idx) => (
                <li key={idx} className="bg-white/20 rounded p-2 flex justify-between">
                  <div>{task.name} - {task.time} ({task.duration} min) {task.name.toLowerCase() === "wake up" && "🌞"}</div>
                  {!task.done ? (
                    <div className="space-x-2">
                      <button onClick={() => completeTask(today, idx)} className="bg-green-500 px-2 py-1 rounded">Done</button>
                      <button onClick={() => forgiveTask(today, idx)} className="bg-yellow-500 px-2 py-1 rounded">Forgive</button>
                    </div>
                  ) : <span className="text-green-400">✔</span>}
                </li>
              ))}
            </ul>
          ) : <p>No tasks for today</p>}
        </div>
      )}
      {page === "reports" && (
        <div className="pt-20 p-4 text-white">
          <h2 className="text-2xl mb-2">Reports</h2>
          <p>Daily tasks done: {(tasks[today] || []).filter((t) => t.done).length}</p>
          <p>Total tasks completed: {Object.values(tasks).flat().filter((t) => t.done).length}</p>
        </div>
      )}
      {page === "deathmode" && (
        <div className="pt-20 p-4 text-white">
          <h2 className="text-2xl mb-4">Death Mode</h2>
          <p className="mb-2">Choose one day each week for strict mode:</p>
          <select
            className="text-black p-2 rounded mb-4"
            value={selectedDeathDay || ""}
            onChange={(e) => { if (!deathDayLocked1) { setSelectedDeathDay(e.target.value); setDeathDayLocked1(true); } }}
          >
            <option value="">Select Day</option>
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          {level >= 7 && (
            <>
              <p className="mb-2">Choose second strict day (Unlocked at level 7):</p>
              <select
                className="text-black p-2 rounded"
                value={selectedDeathDay2 || ""}
                onChange={(e) => { if (!deathDayLocked2) { setSelectedDeathDay2(e.target.value); setDeathDayLocked2(true); } }}
              >
                <option value="">Select Day</option>
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </>
          )}
          {(selectedDeathDay || selectedDeathDay2) && (
            <p className="mt-2">
              Death Mode active on: {selectedDeathDay}{selectedDeathDay2 ? ` & ${selectedDeathDay2}` : ""}
            </p>
          )}
        </div>
      )}
      {page === "leaderboard" && <Leaderboard />}
      {page === "achievements" && <Achievements />}
    </div>
  );
    }
