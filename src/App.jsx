import React, { useState, useEffect } from "react";

// ---- Utility Functions ----
const getToday = () => new Date().toISOString().split("T")[0];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [deathModeDay, setDeathModeDay] = useState(null);
  const [isDeathDay, setIsDeathDay] = useState(false);

  const xpRequired = 500 * level;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("habitData");
    if (saved) {
      const data = JSON.parse(saved);
      setTasks(data.tasks || []);
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setForgiveLeft(data.forgiveLeft ?? 6);
      setDeathModeDay(data.deathModeDay || null);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      "habitData",
      JSON.stringify({ tasks, xp, level, forgiveLeft, deathModeDay })
    );
  }, [tasks, xp, level, forgiveLeft, deathModeDay]);

  // Level up
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  // Check if today is death mode day
  useEffect(() => {
    if (deathModeDay) {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      setIsDeathDay(today === deathModeDay);
    }
  }, [deathModeDay]);

  const addTask = (task) => {
    setTasks((prev) => [...prev, task]);
  };

  const completeTask = (index) => {
    if (xpFrozen) return;

    const newTasks = [...tasks];
    const task = newTasks[index];

    // Wake Up strict rule
    if (task.name.toLowerCase() === "wake up") {
      const now = new Date();
      const taskTime = new Date(`${task.date}T${task.time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("Wake Up task late! XP frozen.");
        return;
      }
    }

    newTasks[index].done = true;
    setTasks(newTasks);

    // Death Mode strict rule
    if (isDeathDay) {
      const pending = newTasks.filter((t) => !t.done).length;
      if (pending === 0) {
        setXp((prev) => prev + 10);
      } else {
        setXpFrozen(true);
        alert("Death Day Rule Broken! XP frozen.");
      }
    } else {
      setXp((prev) => prev + 10);
    }
  };

  const forgiveTask = (index) => {
    if (xpFrozen) return;
    if (forgiveLeft <= 0) return alert("No forgives left!");

    const task = tasks[index];
    if (task.name.toLowerCase() === "wake up") {
      setXpFrozen(true);
      alert("Wake Up task forgiven -> XP frozen for today!");
      return;
    }

    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft((prev) => prev - 1);
  };

  const deleteTask = (index) => {
    if (tasks[index].name.toLowerCase() === "wake up") {
      alert("Wake Up task cannot be deleted!");
      return;
    }
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const date = form.date.value;
    const time = form.time.value;
    const duration = form.duration.value;

    if (!name || !date || !time) return alert("Please fill required fields!");

    addTask({ name, date, time, duration, done: false });
    form.reset();
  };

  const logout = () => {
    localStorage.removeItem("habitData");
    setLoggedIn(false);
    setTasks([]);
    setXp(0);
    setLevel(1);
    setForgiveLeft(6);
    setXpFrozen(false);
    setDeathModeDay(null);
  };

  if (!loggedIn) {
    return (
      <div
        style={{
          height: "100vh",
          backgroundImage: "url('https://images.alphacoders.com/128/1280491.jpg')",
          backgroundSize: "cover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "white",
        }}
      >
        <h1 className="text-4xl mb-4 font-bold">No Mercy Habit Tracker</h1>
        <button
          onClick={() => setLoggedIn(true)}
          className="px-6 py-2 bg-red-600 rounded text-white font-bold"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://images.alphacoders.com/128/1280491.jpg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          justifyContent: "space-around",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
        }}
      >
        <button className="bg-red-600 px-4 py-2 rounded">Dashboard</button>
        <button className="bg-red-600 px-4 py-2 rounded">Reports</button>
        <button className="bg-red-600 px-4 py-2 rounded">Death Mode</button>
        <button
          onClick={logout}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: "20px" }}>
        <h2 className="text-2xl font-bold mb-4">
          Level {level} | XP: {xp}/{xpRequired}{" "}
          {xpFrozen && "(Frozen)"} | Forgives: {forgiveLeft}
        </h2>

        {/* Death Mode Day Selection */}
        <div>
          <label>Select Death Mode Day: </label>
          <select
            value={deathModeDay || ""}
            onChange={(e) => setDeathModeDay(e.target.value)}
            className="text-black"
          >
            <option value="">None</option>
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
          {deathModeDay && <p>Active Death Mode: {deathModeDay}</p>}
        </div>

        {/* Add Task */}
        <form onSubmit={handleSubmit} className="mt-4 space-x-2">
          <input type="text" name="name" placeholder="Task name" required className="text-black"/>
          <input type="date" name="date" required className="text-black"/>
          <input type="time" name="time" required className="text-black"/>
          <input type="number" name="duration" defaultValue={30} min={5} className="text-black"/>
          <button type="submit" className="bg-green-600 px-4 py-1 rounded">Add Task</button>
        </form>

        {/* Task List */}
        <h3 className="text-xl mt-6 mb-2">Tasks for {selectedDate}</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-black mb-4"
        />
        <ul>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, idx) => (
              <li key={idx} className="mb-2">
                <span>
                  {task.name} - {task.time} ({task.duration} min)
                </span>
                {!task.done ? (
                  <>
                    <button
                      onClick={() => completeTask(idx)}
                      className="bg-blue-600 px-2 py-1 ml-2 rounded"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => forgiveTask(idx)}
                      className="bg-yellow-600 px-2 py-1 ml-2 rounded"
                    >
                      Forgive
                    </button>
                    <button
                      onClick={() => deleteTask(idx)}
                      className="bg-red-600 px-2 py-1 ml-2 rounded"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span className="ml-2 text-green-400">✔</span>
                )}
              </li>
            ))
          ) : (
            <p>No tasks</p>
          )}
        </ul>
      </div>
    </div>
  );
    }
