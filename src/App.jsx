import React, { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("xp")) || 0);
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem("level")) || 1);
  const [forgiveLeft, setForgiveLeft] = useState(() => parseInt(localStorage.getItem("forgiveLeft")) || 6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [deathDay, setDeathDay] = useState(() => localStorage.getItem("deathDay") || "");
  const [view, setView] = useState("dashboard");

  const xpRequired = 500 * level;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("xp", xp);
    localStorage.setItem("level", level);
    localStorage.setItem("forgiveLeft", forgiveLeft);
    localStorage.setItem("deathDay", deathDay);
  }, [tasks, xp, level, forgiveLeft, deathDay]);

  // Level Up
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel(level + 1);
      setXp(0);
      setForgiveLeft(Math.max(1, forgiveLeft - 1));
      alert("Level up! You are now level " + (level + 1));
    }
  }, [xp]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const completeTask = (index) => {
    if (xpFrozen) return;

    const newTasks = [...tasks];
    if (newTasks[index].done) return;

    // Wake Up check
    if (newTasks[index].name.toLowerCase() === "wake up") {
      const now = new Date();
      const taskTime = new Date(`${newTasks[index].date}T${newTasks[index].time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("Wake Up late! XP frozen for today.");
        return;
      }
    }

    newTasks[index].done = true;
    setTasks(newTasks);
    setXp(xp + 10);
  };

  const forgiveTask = (index) => {
    if (forgiveLeft <= 0) return alert("No forgives left!");
    if (tasks[index].name.toLowerCase() === "wake up") {
      setXpFrozen(true);
      alert("Forgiving Wake Up freezes XP for today!");
    }
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft(forgiveLeft - 1);
  };

  const deleteTask = (index) => {
    if (tasks[index].name.toLowerCase() === "wake up") {
      alert("Wake Up task cannot be deleted!");
      return;
    }
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const date = form.date.value;
    const time = form.time.value;
    const duration = form.duration.value;

    if (!name || !date || !time) return alert("All fields required!");
    addTask({ name, date, time, duration, done: false });
    form.reset();
  };

  const todayTasks = tasks.filter((t) => t.date === selectedDate);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const doubleDeath = level >= 7;
  const deathDays = doubleDeath ? [deathDay, "Sunday"] : [deathDay];

  useEffect(() => {
    if (deathDays.includes(today)) {
      const allDone = todayTasks.every((t) => t.done);
      if (!allDone && todayTasks.length > 0) {
        setXpFrozen(true);
      }
    }
  }, [todayTasks, today, deathDay, doubleDeath]);

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundImage: "url('https://wallpaperaccess.com/full/1972345.jpg')", backgroundSize: "cover" }}>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 py-2 bg-black/50">
        <h1 className="text-2xl font-bold">Akatsuki Habit</h1>
        <div className="flex gap-4">
          <button onClick={() => setView("dashboard")}>Dashboard</button>
          <button onClick={() => setView("report")}>Reports</button>
          <button onClick={() => setView("deathmode")}>Death Mode</button>
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </div>
      </nav>

      {/* Dashboard */}
      {view === "dashboard" && (
        <div className="p-4">
          <p>Level: {level} | XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgives left: {forgiveLeft}</p>
          <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap my-2">
            <input name="name" placeholder="Task name" className="p-1 text-black" required />
            <input type="date" name="date" className="p-1 text-black" required />
            <input type="time" name="time" className="p-1 text-black" required />
            <input type="number" name="duration" defaultValue={30} className="p-1 text-black" />
            <button type="submit" className="bg-green-600 px-3 py-1 rounded">Add</button>
          </form>
          <ul className="mt-4 space-y-2">
            {todayTasks.length > 0 ? todayTasks.map((task, idx) => (
              <li key={idx} className="bg-black/50 p-2 rounded">
                {task.name} - {task.time} ({task.duration}min)
                {!task.done ? (
                  <>
                    <button onClick={() => completeTask(idx)} className="ml-2 bg-blue-600 px-2">Done</button>
                    <button onClick={() => forgiveTask(idx)} className="ml-2 bg-yellow-500 px-2">Forgive</button>
                    <button onClick={() => deleteTask(idx)} className="ml-2 bg-red-500 px-2">Delete</button>
                  </>
                ) : <span className="ml-2">✔</span>}
              </li>
            )) : <p>No tasks for this day</p>}
          </ul>
        </div>
      )}

      {/* Reports */}
      {view === "report" && (
        <div className="p-4">
          <h2 className="text-xl">Weekly Report</h2>
          <p>Total tasks: {tasks.length}</p>
          <p>Completed: {tasks.filter((t) => t.done).length}</p>
        </div>
      )}

      {/* Death Mode */}
      {view === "deathmode" && (
        <div className="p-4">
          <h2 className="text-xl">Set Your Death Day</h2>
          <select value={deathDay} onChange={(e) => setDeathDay(e.target.value)} className="text-black p-1">
            <option value="">--Select--</option>
            <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option><option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
          <p className="mt-2">Current Death Day: {deathDay || "None"}</p>
          {doubleDeath && <p>Double Death Mode Active: Sunday is fixed!</p>}
        </div>
      )}
    </div>
  );
    }
