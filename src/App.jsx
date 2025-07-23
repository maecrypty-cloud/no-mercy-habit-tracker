import React, { useState, useEffect } from "react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("xp")) || 0);
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem("level")) || 1);
  const [forgiveLeft, setForgiveLeft] = useState(() => parseInt(localStorage.getItem("forgive")) || 6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const xpRequired = 500 * level;

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("xp", xp);
    localStorage.setItem("level", level);
    localStorage.setItem("forgive", forgiveLeft);
  }, [tasks, xp, level, forgiveLeft]);

  // Level up
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((p) => p + 1);
      setXp(0);
      setForgiveLeft((p) => Math.max(1, p - 1));
    }
  }, [xp]);

  // Auto-add WakeUp task daily
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!tasks.some((t) => t.date === today && t.isWakeUp)) {
      const wake = { name: "WakeUp", date: today, time: "06:00", duration: 5, isWakeUp: true, done: false };
      setTasks((prev) => [...prev, wake]);
    }
  }, [tasks]);

  const addTask = (task) => setTasks([...tasks, task]);

  const completeTask = (index) => {
    if (xpFrozen) return alert("XP Frozen today!");
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);

    if (newTasks[index].isWakeUp) {
      const now = new Date();
      const taskTime = new Date(`${newTasks[index].date}T${newTasks[index].time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("WakeUp late → XP frozen today!");
        return;
      }
    }
    setXp((p) => p + 10);
  };

  const forgiveTask = (index) => {
    if (forgiveLeft <= 0) return alert("No forgives left!");
    if (tasks[index].isWakeUp) {
      setXpFrozen(true);
      alert("Forgive used on WakeUp → XP frozen today!");
    }
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft((p) => p - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const task = {
      name: f.name.value,
      date: f.date.value,
      time: f.time.value,
      duration: f.duration.value,
      isWakeUp: f.isWakeUp.checked,
      done: false,
    };
    addTask(task);
    f.reset();
  };

  const filteredTasks = tasks.filter((t) => t.date === selectedDate.toISOString().split("T")[0]);

  // Reports
  const today = new Date().toISOString().split("T")[0];
  const dailyCompleted = tasks.filter((t) => t.date === today && t.done).length;
  const dailyTotal = tasks.filter((t) => t.date === today).length;
  const weekTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff < 7;
  });
  const weeklyCompleted = weekTasks.filter((t) => t.done).length;

  const handleLogin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    setLoggedIn(true);
  };

  const logout = () => {
    localStorage.clear();
    setTasks([]);
    setXp(0);
    setLevel(1);
    setForgiveLeft(6);
    setLoggedIn(false);
  };

  // Background anime wallpaper
  const bgStyle = {
    backgroundImage: "url('https://wallpaperaccess.com/full/6565741.jpg')",
    backgroundSize: "cover",
    minHeight: "100vh",
    padding: "20px",
    color: "white",
    fontFamily: "cursive",
  };

  if (!loggedIn) {
    return (
      <div style={bgStyle}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input name="username" placeholder="Enter name" required />
          <button type="submit">Start</button>
        </form>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setSelectedPage("home")}>Home</button>
        <button onClick={() => setSelectedPage("death")}>Death Mode</button>
        <button onClick={() => setSelectedPage("reports")}>Reports</button>
        <button onClick={() => setSelectedPage("profile")}>Profile</button>
        <button onClick={logout}>Logout</button>
      </nav>

      {selectedPage === "home" && (
        <>
          <h1>No Mercy Habit Tracker</h1>
          <p>Level: {level} | XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgive left: {forgiveLeft}</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input type="text" name="name" placeholder="Task name" required />
            <input type="date" name="date" required />
            <input type="time" name="time" required />
            <input type="number" name="duration" min="5" defaultValue={30} />
            <label><input type="checkbox" name="isWakeUp" /> WakeUp Task</label>
            <button type="submit">Add Task</button>
          </form>

          <h2>Tasks for {selectedDate.toDateString()}</h2>
          <input type="date" value={selectedDate.toISOString().split("T")[0]} onChange={(e) => setSelectedDate(new Date(e.target.value))}/>
          <ul>
            {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
              <li key={idx}>
                {task.name} - {task.time} ({task.duration}min){task.isWakeUp && " 🌞"}
                {!task.done ? (
                  <>
                    <button onClick={() => completeTask(idx)}>Done</button>
                    <button onClick={() => forgiveTask(idx)}>Forgive</button>
                  </>
                ) : <span> ✔</span>}
              </li>
            )) : <p>No tasks for this date</p>}
          </ul>
        </>
      )}

      {selectedPage === "reports" && (
        <>
          <h2>Reports</h2>
          <p>Today: {dailyCompleted}/{dailyTotal} tasks completed</p>
          <p>Last 7 days: {weeklyCompleted}/{weekTasks.length} tasks completed</p>
        </>
      )}

      {selectedPage === "profile" && (
        <>
          <h2>Profile</h2>
          <p>Name: {username}</p>
          <p>Level: {level}</p>
          <p>XP: {xp}</p>
        </>
      )}

      {selectedPage === "death" && (
        <>
          <h2>Death Mode Rules</h2>
          <ul>
            <li>No social media</li>
            <li>10 focused tasks</li>
            <li>No mobile use</li>
            <li>Work 4hr + break 20min + 4hr</li>
          </ul>
        </>
      )}
    </div>
  );
          }
