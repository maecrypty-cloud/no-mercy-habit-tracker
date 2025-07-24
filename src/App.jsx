import React, { useState, useEffect } from "react"; import Navbar from "./Navbar"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements";

const App = () => { const [page, setPage] = useState("dashboard"); const [tasks, setTasks] = useState({}); const [input, setInput] = useState(""); const [strictMode, setStrictMode] = useState(false);

const today = new Date().toISOString().slice(0, 10);

useEffect(() => { if (!tasks[today]) { setTasks((prevTasks) => ({ ...prevTasks, [today]: [] })); } }, [today, tasks]);

const addTask = () => { if (!input.trim()) return; if (strictMode && tasks[today].length >= 3) return; const newTask = { name: input.trim(), done: false }; setTasks((prev) => ({ ...prev, [today]: [...prev[today], newTask], })); setInput(""); };

const toggleDone = (index) => { const updated = [...tasks[today]]; updated[index].done = !updated[index].done; setTasks((prev) => ({ ...prev, [today]: updated })); };

const deleteTask = (index) => { const updated = [...tasks[today]]; updated.splice(index, 1); setTasks((prev) => ({ ...prev, [today]: updated })); };

const filteredTasks = tasks[today] || [];

return ( <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: url("https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1350&q=80") }} > <Navbar currentPage={page} setPage={setPage} />

{page === "dashboard" && (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Today's Tasks ({today})</h1>

      <div className="flex mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded text-black"
          placeholder="New task"
        />
        <button
          onClick={addTask}
          className="ml-2 px-4 py-2 bg-green-600 rounded"
        >
          Add
        </button>
      </div>

      <ul>
        {filteredTasks.map((task, index) => (
          <li key={index} className="flex justify-between mb-2">
            <span
              className={`flex-1 ${task.done ? "line-through text-gray-300" : ""}`}
            >
              {task.name}
            </span>
            <button
              onClick={() => toggleDone(index)}
              className="px-2 bg-yellow-500 rounded mr-2"
            >
              {task.done ? "Undo" : "Done"}
            </button>
            <button
              onClick={() => deleteTask(index)}
              className="px-2 bg-red-600 rounded"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  )}

  {page === "reports" && (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">Reports Page (Coming Soon)</h1>
    </div>
  )}

  {page === "deathmode" && (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Death Mode</h1>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={strictMode}
          onChange={() => setStrictMode(!strictMode)}
        />
        <span>Enable Strict Mode (Max 3 tasks)</span>
      </label>
    </div>
  )}

  {page === "leaderboard" && <Leaderboard />}
  {page === "achievements" && <Achievements />}
</div>

); };

export default App;

          
