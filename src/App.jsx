import React, { useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewDate, setViewDate] = useState(new Date().toISOString().split("T")[0]);

  const addTask = () => {
    if (!taskName) return;
    const dateToSave = selectedDate || new Date().toISOString().split("T")[0];
    setTasks([...tasks, { name: taskName, date: dateToSave }]);
    setTaskName("");
    setSelectedDate("");
  };

  const todayTasks = tasks.filter((t) => t.date === viewDate);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Task Manager</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "8px" }}
        />
        <button onClick={addTask} style={{ padding: "8px" }}>
          Add
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>View Date:</label>
        <input
          type="date"
          value={viewDate}
          onChange={(e) => setViewDate(e.target.value)}
          style={{ padding: "8px" }}
        />
      </div>

      <h3>Tasks for {viewDate}</h3>
      {todayTasks.length === 0 ? (
        <p>No tasks for this day.</p>
      ) : (
        <ul>
          {todayTasks.map((task, index) => (
            <li key={index}>{task.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
                  }
