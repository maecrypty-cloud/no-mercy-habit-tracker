import React, { useState, useEffect } from "react";

// LocalStorage Helpers
const loadData = (key, fallback) =>
  JSON.parse(localStorage.getItem(key)) || fallback;
const saveData = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

export default function App() {
  const [tasks, setTasks] = useState(() => loadData("tasks", []));
  const [xp, setXp] = useState(() => loadData("xp", 0));
  const [level, setLevel] = useState(() => loadData("level", 1));
  const [forgiveLeft, setForgiveLeft] = useState(() =>
    loadData("forgiveLeft", 6)
  );
  const [xpFrozen, setXpFrozen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [deathDay, setDeathDay] = useState(() => loadData("deathDay", null));

  const xpRequired = 500 * level;
  const todayDate = new Date().toISOString().split("T")[0];

  // Save state to localStorage
  useEffect(() => {
    saveData("tasks", tasks);
    saveData("xp", xp);
    saveData("level", level);
    saveData("forgiveLeft", forgiveLeft);
    saveData("deathDay", deathDay);
  }, [tasks, xp, level, forgiveLeft, deathDay]);

  // Level up
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  // Wake up mandatory task check
  useEffect(() => {
    const wakeExists = tasks.some(
      (t) => t.isWakeUp && t.date === todayDate
    );
    if (!wakeExists) {
      setTasks((prev) => [
        ...prev,
        {
          name: "Wake Up",
          date: todayDate,
          time: "07:00",
          isWakeUp: true,
          done: false,
        },
      ]);
    }
  }, [todayDate]);

  const addTask = (task) => setTasks([...tasks, task]);

  const completeTask = (index) => {
    if (xpFrozen) return alert("XP Frozen today, complete tasks won't give XP!");
    const updated = [...tasks];
    updated[index].done = true;
    setTasks(updated);

    if (updated[index].isWakeUp) {
      const now = new Date();
      const taskTime = new Date(`${updated[index].date}T${updated[index].time}`);
      const diff = (now - taskTime) / 1000 / 60;
      if (diff > 10) {
        setXpFrozen(true);
        alert("WakeUp task late! XP frozen for today.");
        return;
      }
    }
    setXp((prev) => prev + 10);
  };

  const forgiveTask = (index) => {
    if (tasks[index].isWakeUp) {
      setXpFrozen(true);
      alert("WakeUp task forgiven, XP frozen!");
    }
    if (forgiveLeft <= 0) return alert("No forgives left!");
    const updated = [...tasks];
    updated[index].done = true;
    setTasks(updated);
    setForgiveLeft((prev) => prev - 1);
  };

  const deleteTask = (index) => {
    if (tasks[index].isWakeUp) return alert("Cannot delete WakeUp task!");
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const date = form.date.value;
    const time = form.time.value;
    if (!name || !date || !time) return alert("Please fill required fields!");
    addTask({ name, date, time, isWakeUp: false, done: false });
    form.reset();
  };

  const tasksToday = tasks.filter((t) => t.date === todayDate);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const isDeathDay =
    deathDay &&
    new Date().toLocaleDateString("en-US", { weekday: "long" }) === deathDay;

  // Death mode double after level 7
  const activeDeathMode = isDeathDay || (level >= 7 && deathDay);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage:
          "url('https://wallpapercave.com/wp/wp2634112.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Navbar */}
      <nav className="bg-black/60 backdrop-blur-md flex justify-between p-4 sticky top-0">
        <div className="text-2xl font-bold">No Mercy</div>
        <div className="space-x-4">
          <button onClick={() => setSelectedPage("dashboard")}>Dashboard</button>
          <button onClick={() => setSelectedPage("report")}>Reports</button>
          <button onClick={() => setSelectedPage("settings")}>Settings</button>
          <button onClick={handleLogout} className="text-red-400">
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard */}
      {selectedPage === "dashboard" && (
        <div className="p-4 space-y-4">
          <h1 className="text-3xl">Level {level}</h1>
          <p>
            XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgive left:{" "}
            {forgiveLeft}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
            <input name="name" placeholder="Task name" className="text-black p-2" />
            <input type="date" name="date" className="text-black p-2" />
            <input type="time" name="time" className="text-black p-2" />
            <button type="submit" className="bg-red-500 px-4 py-2 rounded">
              Add Task
            </button>
          </form>

          <h2 className="text-xl">Tasks Today</h2>
          <ul className="space-y-2">
            {tasksToday.map((task, idx) => (
              <li
                key={idx}
                className="bg-black/50 p-3 rounded flex justify-between"
              >
                <span>
                  {task.name} - {task.time} {task.isWakeUp && "🌞"}{" "}
                  {task.done && "✔"}
                </span>
                {!task.done && (
                  <div className="space-x-2">
                    <button
                      className="bg-green-500 px-2"
                      onClick={() => completeTask(idx)}
                    >
                      Done
                    </button>
                    <button
                      className="bg-yellow-500 px-2"
                      onClick={() => forgiveTask(idx)}
                    >
                      Forgive
                    </button>
                    {!task.isWakeUp && (
                      <button
                        className="bg-red-500 px-2"
                        onClick={() => deleteTask(idx)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {activeDeathMode && (
            <div className="bg-red-600 p-4 rounded">
              <h2 className="text-2xl">Death Mode Active!</h2>
              <p>
                All tasks must be completed today. Missing one freezes XP for 24h.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Report Page */}
      {selectedPage === "report" && (
        <div className="p-4">
          <h2 className="text-2xl">Weekly Report</h2>
          <p>Total Tasks: {tasks.length}</p>
          <p>Completed: {tasks.filter((t) => t.done).length}</p>
          <p>Pending: {tasks.filter((t) => !t.done).length}</p>
        </div>
      )}

      {/* Settings */}
      {selectedPage === "settings" && (
        <div className="p-4">
          <h2 className="text-2xl">Settings</h2>
          <label>
            Death Mode Day:
            <select
              value={deathDay || ""}
              onChange={(e) => setDeathDay(e.target.value)}
              className="text-black p-2"
            >
              <option value="">Select</option>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
      }
