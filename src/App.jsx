import React, { useState, useEffect } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [deathMode, setDeathMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const xpRequired = 500 * level;

  // Level Up Check
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  const addTask = (task) => setTasks([...tasks, task]);

  const completeTask = (index) => {
    if (xpFrozen) return;
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);

    if (newTasks[index].isWakeUp) {
      const now = new Date();
      const taskTime = new Date(`${newTasks[index].date}T${newTasks[index].time}`);
      const diffMinutes = (now - taskTime) / 60000;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        setDeathMode(true);
        alert("WakeUp late! Death Mode activated, XP frozen.");
        return;
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

  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const date = form.date.value;
    const time = form.time.value;
    const duration = form.duration.value;
    const isWakeUp = form.isWakeUp.checked;

    if (!name || !date || !time) return alert("Please fill required fields!");

    addTask({ name, date, time, duration, isWakeUp, done: false });
    form.reset();
  };

  const themeStyles = darkMode
    ? { background: "#121212", color: "#f5f5f5" }
    : { background: "#f5f5f5", color: "#121212" };

  return (
    <div style={{ ...styles.container, ...themeStyles, ...(deathMode ? styles.deathMode : {}) }}>
      <div style={styles.header}>
        <h1>No Mercy Habit Tracker</h1>
        <button onClick={() => setDarkMode(!darkMode)} style={styles.themeBtn}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* XP & Level */}
      <div style={styles.levelBox}>
        <p>
          Level: {level} | XP: {xp}/{xpRequired}{" "}
          {xpFrozen && <span style={{ color: "red" }}>(Frozen)</span>}
        </p>
        <p>Forgive left: {forgiveLeft}</p>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(xp / xpRequired) * 100}%` }}></div>
        </div>
      </div>

      {/* Task Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} type="text" name="name" placeholder="Task name" required />
        <input style={styles.input} type="date" name="date" required />
        <input style={styles.input} type="time" name="time" required />
        <input style={styles.input} type="number" name="duration" min="5" defaultValue={30} />
        <label style={styles.checkbox}>
          <input type="checkbox" name="isWakeUp" /> WakeUp Task
        </label>
        <button type="submit" style={styles.button}>Add Task</button>
      </form>

      {/* Date Picker */}
      <div style={styles.datePicker}>
        <label>Select Day:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Tasks List */}
      <h2 style={styles.subheading}>Tasks for {selectedDate}</h2>
      <div style={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, idx) => (
            <div key={idx} style={{ ...styles.taskCard, animation: "fadeIn 0.5s ease" }}>
              <div>
                <b>{task.name}</b> - {task.time} ({task.duration} min)
                {task.isWakeUp && " 🌞"}
              </div>
              {!task.done ? (
                <div style={styles.taskButtons}>
                  <button onClick={() => completeTask(idx)} style={styles.doneBtn}>Done</button>
                  <button onClick={() => forgiveTask(idx)} style={styles.forgiveBtn}>Forgive</button>
                </div>
              ) : (
                <span style={{ color: "green" }}>✔ Completed</span>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: "#666" }}>No tasks for this date</p>
        )}
      </div>

      {/* CSS Keyframes for Fade-in */}
      <style>
        {`
          @keyframes fadeIn {
            from {opacity: 0; transform: translateY(10px);}
            to {opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: { maxWidth: "500px", margin: "auto", padding: "20px", minHeight: "100vh" },
  deathMode: { background: "#300", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  themeBtn: { padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" },
  levelBox: { marginBottom: "20px", textAlign: "center" },
  progressBar: {
    width: "100%", height: "12px", background: "#eee", borderRadius: "6px",
    overflow: "hidden", marginTop: "5px"
  },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #4caf50, #81c784)" },
  form: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" },
  input: { padding: "8px", borderRadius: "5px", border: "1px solid #ccc" },
  checkbox: { fontSize: "14px" },
  button: { padding: "10px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px" },
  datePicker: { display: "flex", flexDirection: "column", gap: "5px", marginBottom: "20px" },
  subheading: { marginBottom: "10px" },
  taskList: { display: "flex", flexDirection: "column", gap: "10px" },
  taskCard: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    background: "#f9f9f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  taskButtons: { display: "flex", gap: "5px" },
  doneBtn: { padding: "5px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "3px" },
  forgiveBtn: { padding: "5px 10px", background: "#ffc107", color: "#000", border: "none", borderRadius: "3px" },
};
