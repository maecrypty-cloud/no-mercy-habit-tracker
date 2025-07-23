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

  // XP required per level
  const xpRequired = 500 * level;

  // Level up check
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1)); // Forgive reduce
    }
  }, [xp]);

  const addTask = (task) => setTasks([...tasks, task]);

  const completeTask = (index) => {
    if (xpFrozen) return;
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);

    // WakeUp special check
    if (newTasks[index].isWakeUp) {
      const now = new Date();
      const taskTime = new Date(`${newTasks[index].date}T${newTasks[index].time}`);
      const diffMinutes = (now - taskTime) / 60000;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("WakeUp task late! XP frozen for today.");
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

  return (
    <div style={{ padding: "20px", fontFamily: "cursive" }}>
      <h1>No Mercy Habit Tracker</h1>
      <p>
        Level: {level} | XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgive
        left: {forgiveLeft}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input type="text" name="name" placeholder="Task name" required />
        <input type="date" name="date" required />
        <input type="time" name="time" required />
        <input type="number" name="duration" min="5" defaultValue={30} />
        <label>
          <input type="checkbox" name="isWakeUp" /> WakeUp Task
        </label>
        <button type="submit">Add Task</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <label>
          Select Day:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      <h2>Tasks for {selectedDate}</h2>
      <ul>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, idx) => (
            <li key={idx}>
              {task.name} - {task.time} ({task.duration} min)
              {task.isWakeUp && " 🌞"}
              {!task.done ? (
                <>
                  <button onClick={() => completeTask(idx)}>Done</button>
                  <button onClick={() => forgiveTask(idx)}>Forgive</button>
                </>
              ) : (
                <span> ✔</span>
              )}
            </li>
          ))
        ) : (
          <p>No tasks for this date</p>
        )}
      </ul>
    </div>
  );
        }
