import React, { useState, useEffect } from "react";

// ---------- Constants ----------
const PAIN_BG = "https://wallpaperaccess.com/full/211255.jpg"; // Akatsuki Pain
const getToday = () => new Date().toISOString().split("T")[0];
const weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ---------- Main ----------
export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("xp")) || 0);
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem("level")) || 1);
  const [forgiveLeft, setForgiveLeft] = useState(() => parseInt(localStorage.getItem("forgive")) || 6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [view, setView] = useState("dashboard");
  const [deathDays, setDeathDays] = useState(() => JSON.parse(localStorage.getItem("deathDays")) || []);
  
  // ---------- Effects ----------
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("xp", xp);
    localStorage.setItem("level", level);
    localStorage.setItem("forgive", forgiveLeft);
    localStorage.setItem("deathDays", JSON.stringify(deathDays));
  }, [tasks, user, xp, level, forgiveLeft, deathDays]);

  const xpRequired = 500 * level;
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  // ---------- Auth ----------
  const login = (name) => {
    if (!name) return;
    setUser({ name });
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setTasks([]);
    setXp(0);
    setLevel(1);
    setForgiveLeft(6);
    setDeathDays([]);
  };

  // ---------- Task Ops ----------
  const addTask = (task) => setTasks([...tasks, { ...task, done: false }]);

  const completeTask = (index) => {
    if (xpFrozen) return alert("XP is frozen today!");
    const task = tasks[index];
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);

    // wake-up mandatory check
    if (task.isWakeUp) {
      const now = new Date();
      const taskTime = new Date(`${task.date}T${task.time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("Wake-Up late! XP frozen for today.");
        return;
      }
    }

    // Death mode day check
    const todayName = weekDays[new Date().getDay()];
    if (deathDays.includes(todayName)) {
      const allToday = tasks.filter(t => t.date === getToday());
      if (!allToday.every(t => t.done)) {
        setXpFrozen(true);
        alert("Death mode failed → XP frozen!");
      }
    }

    setXp((prev) => prev + 10);
  };

  const forgiveTask = (index) => {
    if (forgiveLeft <= 0) return alert("No forgives left!");
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft((prev) => prev - 1);
  };

  const deleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  // ---------- Filter ----------
  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  // ---------- Death Mode ----------
  const toggleDeathDay = (day) => {
    const maxDays = level >= 7 ? 2 : 1;
    if (deathDays.includes(day)) {
      setDeathDays(deathDays.filter((d) => d !== day));
    } else {
      if (deathDays.length >= maxDays) {
        alert(`Max ${maxDays} day(s) allowed for Death Mode.`);
        return;
      }
      setDeathDays([...deathDays, day]);
    }
  };

  // ---------- Render ----------
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center" style={{ background: `url(${PAIN_BG}) center/cover` }}>
        <h1 className="text-white text-4xl font-bold mb-4">No Mercy Tracker</h1>
        <input id="username" placeholder="Enter username" className="p-2 rounded text-black mb-4" />
        <button onClick={() => login(document.getElementById("username").value)} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `url(${PAIN_BG}) center/cover` }}>
      {/* Navbar */}
      <nav className="bg-black bg-opacity-60 p-4 fixed w-full z-50 top-0 flex flex-wrap justify-between text-white">
        <h2 className="text-xl font-bold">Akatsuki Habit</h2>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => setView("dashboard")}>Dashboard</button>
          <button onClick={() => setView("reports")}>Reports</button>
          <button onClick={() => setView("profile")}>Profile</button>
          <button onClick={() => setView("deathmode")}>Death Mode</button>
          <button onClick={logout} className="text-red-400">Logout</button>
        </div>
      </nav>

      <div className="pt-20 p-4 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
        <p className="mb-4">Level: {level} | XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgive left: {forgiveLeft}</p>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                addTask({
                  name: form.name.value,
                  date: form.date.value,
                  time: form.time.value,
                  isWakeUp: form.isWakeUp.checked,
                });
                form.reset();
              }}
              className="bg-white bg-opacity-20 p-4 rounded flex flex-wrap gap-2"
            >
              <input type="text" name="name" placeholder="Task name" required className="p-2 text-black rounded" />
              <input type="date" name="date" required className="p-2 text-black rounded" />
              <input type="time" name="time" required className="p-2 text-black rounded" />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isWakeUp" /> Wake-Up
              </label>
              <button type="submit" className="bg-green-500 px-4 py-2 rounded">Add Task</button>
            </form>

            <h2 className="text-2xl font-bold mt-4">Tasks for {selectedDate}</h2>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 text-black rounded mb-4" />
            <div className="grid gap-2">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <div key={idx} className="bg-black bg-opacity-50 p-4 rounded flex justify-between items-center">
                    <div>
                      <h3 className="text-xl">{task.name}{task.isWakeUp && " 🌞"}</h3>
                      <p>{task.time}</p>
                    </div>
                    <div className="flex gap-2">
                      {!task.done ? (
                        <>
                          <button onClick={() => completeTask(tasks.indexOf(task))} className="bg-green-600 px-3 py-1 rounded">Done</button>
                          <button onClick={() => forgiveTask(tasks.indexOf(task))} className="bg-yellow-600 px-3 py-1 rounded">Forgive</button>
                          <button onClick={() => deleteTask(tasks.indexOf(task))} className="bg-red-600 px-3 py-1 rounded">Delete</button>
                        </>
                      ) : <span className="text-green-400">✔</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p>No tasks for this date</p>
              )}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {view === "reports" && <p>Weekly and daily reports will come here (TODO).</p>}

        {/* PROFILE */}
        {view === "profile" && <p>User Profile with stats (TODO).</p>}

        {/* DEATH MODE */}
        {view === "deathmode" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Death Mode Day Selection</h2>
            <p>Select {level >= 7 ? "TWO" : "ONE"} day(s) for Death Mode this week:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {weekDays.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDeathDay(day)}
                  className={`p-2 rounded ${deathDays.includes(day) ? "bg-red-600" : "bg-gray-600"}`}
                >
                  {day}
                </button>
              ))}
            </div>
            <h3 className="mt-4 font-bold">Selected Days: {deathDays.join(", ") || "None"}</h3>
            <h2 className="text-xl mt-4 font-bold">Rules:</h2>
            <ul className="list-disc pl-6">
              <li>No social media</li>
              <li>10 focused tasks</li>
              <li>No mobile use except work</li>
              <li>4h work + 20min break + 4h work</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
    }
