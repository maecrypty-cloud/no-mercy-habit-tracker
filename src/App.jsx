import React, { useState, useEffect } from "react";

const ANIME_BACKGROUNDS = [
  "https://wallpapercave.com/wp/wp9114789.jpg",
  "https://wallpapercave.com/wp/wp7418470.jpg",
  "https://wallpapercave.com/wp/wp5739442.jpg",
  "https://wallpapercave.com/wp/wp7992352.jpg",
  "https://wallpapercave.com/wp/wp1810734.jpg",
];
const ANIME_CHARACTERS = [
  "Itachi Uchiha",
  "Madara Uchiha",
  "Pain",
  "Obito Uchiha",
  "Kisame Hoshigaki",
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [deathDay, setDeathDay] = useState(null);
  const [page, setPage] = useState("home");
  const [bg, setBg] = useState(ANIME_BACKGROUNDS[0]);
  const [currentCharacter, setCurrentCharacter] = useState(ANIME_CHARACTERS[0]);

  const xpRequired = 500 * level;

  // ---- Load Saved Data ----
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("no_mercy_data"));
    if (saved) {
      setLoggedIn(saved.loggedIn || false);
      setUsername(saved.username || "");
      setTasks(saved.tasks || []);
      setSelectedDate(saved.selectedDate || new Date().toISOString().split("T")[0]);
      setXp(saved.xp || 0);
      setLevel(saved.level || 1);
      setForgiveLeft(saved.forgiveLeft ?? 6);
      setXpFrozen(saved.xpFrozen || false);
      setDeathDay(saved.deathDay || null);
      setBg(saved.bg || ANIME_BACKGROUNDS[0]);
      setCurrentCharacter(saved.currentCharacter || ANIME_CHARACTERS[0]);
    }
  }, []);

  // ---- Save Data ----
  useEffect(() => {
    localStorage.setItem(
      "no_mercy_data",
      JSON.stringify({
        loggedIn,
        username,
        tasks,
        selectedDate,
        xp,
        level,
        forgiveLeft,
        xpFrozen,
        deathDay,
        bg,
        currentCharacter,
      })
    );
  }, [loggedIn, username, tasks, selectedDate, xp, level, forgiveLeft, xpFrozen, deathDay, bg, currentCharacter]);

  // ---- Level Up ----
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
      const randomBg = ANIME_BACKGROUNDS[Math.floor(Math.random() * ANIME_BACKGROUNDS.length)];
      const randomChar = ANIME_CHARACTERS[Math.floor(Math.random() * ANIME_CHARACTERS.length)];
      setBg(randomBg);
      setCurrentCharacter(randomChar);
      alert(`Level Up! You unlocked ${randomChar}`);
    }
  }, [xp]);

  const addTask = (task) => setTasks([...tasks, task]);

  const completeTask = (index) => {
    if (xpFrozen) return;
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setXp((prev) => prev + 10);
  };

  const forgiveTask = (index) => {
    if (forgiveLeft <= 0) return alert("No forgives left!");
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const time = form.time.value;
    const duration = form.duration.value;
    const isWakeUp = form.isWakeUp.checked;
    if (!name || !time) return alert("Fill all fields");
    addTask({ name, date: selectedDate, time, duration, isWakeUp, done: false });
    form.reset();
  };

  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  const logout = () => {
    localStorage.removeItem("no_mercy_data");
    setLoggedIn(false);
    setUsername("");
    setTasks([]);
    setXp(0);
    setLevel(1);
    setForgiveLeft(6);
    setXpFrozen(false);
    setDeathDay(null);
    setPage("home");
  };

  // ---- Login Screen ----
  if (!loggedIn) {
    return (
      <div style={{
        height: "100vh", display: "flex", justifyContent: "center",
        alignItems: "center", background: `url(${bg}) center/cover`, color: "white"
      }}>
        <form onSubmit={(e) => { e.preventDefault(); setUsername(e.target.username.value); setLoggedIn(true); }}
          style={{
            background: "rgba(0,0,0,0.7)", padding: 20, borderRadius: 10,
            display: "flex", flexDirection: "column", gap: 10, width: 300
          }}>
          <h1 style={{ textAlign: "center" }}>No Mercy Login</h1>
          <input name="username" placeholder="Username" required style={{ padding: 10 }} />
          <button type="submit" style={{ padding: 10, background: "#e50914", color: "white", border: "none", cursor: "pointer" }}>
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `url(${bg}) center/cover`,
      color: "white", fontFamily: "cursive", padding: 20
    }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontWeight: "bold", fontSize: 20 }}>No Mercy ({username})</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setPage("home")} style={navBtn}>Home</button>
          <button onClick={() => setPage("death")} style={navBtn}>Death Mode</button>
          <button onClick={() => setPage("profile")} style={navBtn}>Profile</button>
          <button onClick={logout} style={navBtn}>Logout</button>
        </div>
      </nav>

      {page === "home" && (
        <>
          <h1>{currentCharacter} | Level {level}</h1>
          <p>XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgive: {forgiveLeft}</p>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            <input type="text" name="name" placeholder="Task name" required />
            <input type="time" name="time" required />
            <input type="number" name="duration" defaultValue={30} />
            <label><input type="checkbox" name="isWakeUp" /> WakeUp</label>
            <button type="submit" style={addBtn}>Add</button>
          </form>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <ul style={{ marginTop: 10 }}>
            {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
              <li key={idx} style={taskItem}>
                {task.name} - {task.time} {task.isWakeUp && "🌞"}
                {!task.done ? (
                  <>
                    <button onClick={() => completeTask(idx)} style={taskBtn}>Done</button>
                    <button onClick={() => forgiveTask(idx)} style={taskBtn}>Forgive</button>
                  </>
                ) : <span>✔</span>}
              </li>
            )) : <p>No tasks</p>}
          </ul>
        </>
      )}

      {page === "death" && (
        <div style={card}>
          <h2>Death Mode Rules</h2>
          <p>Select one day each week. On that day all tasks must be done (no forgive allowed).</p>
          <select value={deathDay || ""} onChange={(e) => setDeathDay(e.target.value)}>
            <option value="">Select Day</option>
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {deathDay && <p>Death Mode Active on: {deathDay}</p>}
        </div>
      )}

      {page === "profile" && (
        <div style={card}>
          <h2>Profile</h2>
          <p>User: {username}</p>
          <p>Level: {level}</p>
          <p>XP: {xp}/{xpRequired}</p>
          <p>Forgive Left: {forgiveLeft}</p>
          <p>Death Day: {deathDay || "None"}</p>
        </div>
      )}
    </div>
  );
}

// ---- Styles ----
const navBtn = { padding: "8px 12px", background: "#e50914", border: "none", color: "white", cursor: "pointer" };
const addBtn = { padding: "5px 10px", background: "#1db954", border: "none", color: "white", cursor: "pointer" };
const taskBtn = { marginLeft: 5, padding: "2px 6px", background: "#007bff", color: "white", border: "none" };
const taskItem = { marginBottom: 5, background: "rgba(0,0,0,0.5)", padding: 5, borderRadius: 5 };
const card = { background: "rgba(0,0,0,0.7)", padding: 20, borderRadius: 10, maxWidth: 400 };
