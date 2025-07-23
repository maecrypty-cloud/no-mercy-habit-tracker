import React, { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [selectedDeathDay, setSelectedDeathDay] = useState(null);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  const xpRequired = 500 * level;

  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  const handleLogin = (e) => {
    e.preventDefault();
    const name = e.target.username.value.trim();
    if (name) setUser(name);
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setXp(0);
    setLevel(1);
    setXpFrozen(false);
    setForgiveLeft(6);
  };

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const completeTask = (index) => {
    if (xpFrozen) return;
    const task = tasks[index];
    if (task.done) return;

    if (task.name.toLowerCase() === "wake up") {
      const now = new Date();
      const taskTime = new Date(`${task.date}T${task.time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("Wake Up task late! XP frozen for today.");
      }
    }

    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    if (!xpFrozen) setXp((prev) => prev + 10);
  };

  const forgiveTask = (index) => {
    if (forgiveLeft <= 0) {
      alert("No forgives left!");
      return;
    }
    const task = tasks[index];
    if (task.name.toLowerCase() === "wake up") {
      setXpFrozen(true);
      alert("Wake Up task forgiven, XP frozen for today!");
    }
    const newTasks = [...tasks];
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft((prev) => prev - 1);
  };

  const filteredTasks = tasks.filter((t) => t.date === today);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const date = e.target.date.value;
    const time = e.target.time.value;
    const duration = e.target.duration.value;
    if (!name || !date || !time) return alert("Please fill all fields!");
    addTask({ name, date, time, duration, done: false });
    e.target.reset();
  };

  const navbar = (
    <div className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white flex justify-between px-4 py-2 z-50">
      <div className="font-bold text-lg">No Mercy</div>
      <div className="space-x-2 text-sm">
        <button onClick={() => setPage("dashboard")} className="px-3 py-1 bg-red-600 rounded">Dashboard</button>
        <button onClick={() => setPage("reports")} className="px-3 py-1 bg-blue-600 rounded">Reports</button>
        <button onClick={() => setPage("deathmode")} className="px-3 py-1 bg-purple-600 rounded">Death Mode</button>
        <button onClick={handleLogout} className="px-3 py-1 bg-gray-700 rounded">Logout</button>
      </div>
    </div>
  );

  const dashboard = (
    <div className="pt-16 p-4 text-white">
      <h1 className="text-2xl mb-2">Welcome, {user}</h1>
      <p>Level: {level} | XP: {xp}/{xpRequired} {xpFrozen && "(Frozen)"} | Forgives Left: {forgiveLeft}</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
        <input type="text" name="name" placeholder="Task name" className="p-2 rounded text-black" required />
        <input type="date" name="date" className="p-2 rounded text-black" required />
        <input type="time" name="time" className="p-2 rounded text-black" required />
        <input type="number" name="duration" min="5" defaultValue={30} className="p-2 rounded text-black" />
        <button type="submit" className="bg-green-600 px-4 py-2 rounded">Add</button>
      </form>

      <h2 className="text-xl mt-4 mb-2">Today's Tasks</h2>
      {filteredTasks.length > 0 ? (
        <ul className="space-y-2">
          {filteredTasks.map((task, idx) => (
            <li key={idx} className="bg-white/20 rounded p-2 flex justify-between">
              <div>
                {task.name} - {task.time} ({task.duration} min)
                {task.name.toLowerCase() === "wake up" && " 🌞"}
              </div>
              {!task.done ? (
                <div className="space-x-2">
                  <button onClick={() => completeTask(idx)} className="bg-green-500 px-2 py-1 rounded">Done</button>
                  <button onClick={() => forgiveTask(idx)} className="bg-yellow-500 px-2 py-1 rounded">Forgive</button>
                </div>
              ) : (
                <span className="text-green-400">✔</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks for today</p>
      )}
    </div>
  );

  const reports = (
    <div className="pt-16 p-4 text-white">
      <h2 className="text-2xl mb-2">Reports</h2>
      <p>Daily tasks done: {tasks.filter((t) => t.date === today && t.done).length}</p>
      <p>Total tasks completed: {tasks.filter((t) => t.done).length}</p>
    </div>
  );

  const deathMode = (
    <div className="pt-16 p-4 text-white">
      <h2 className="text-2xl mb-4">Death Mode</h2>
      <p className="mb-2">Choose one day each week for strict mode (no forgives, all tasks must be done):</p>
      <select
        className="text-black p-2 rounded"
        value={selectedDeathDay || ""}
        onChange={(e) => setSelectedDeathDay(e.target.value)}
      >
        <option value="">Select Day</option>
        <option value="Sunday">Sunday</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
      </select>
      {selectedDeathDay && <p className="mt-2">Death Mode active on: {selectedDeathDay}</p>}
    </div>
  );

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('https://i.ibb.co/6XrD7bR/akatsuki-pain.jpg')` }}>
        <form onSubmit={handleLogin} className="bg-white/20 p-6 rounded text-white">
          <h1 className="text-xl mb-4">Login</h1>
          <input type="text" name="username" placeholder="Enter your name" className="p-2 rounded text-black w-full mb-2" required />
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded w-full">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url('https://i.ibb.co/6XrD7bR/akatsuki-pain.jpg')` }}>
      {navbar}
      {page === "dashboard" && dashboard}
      {page === "reports" && reports}
      {page === "deathmode" && deathMode}
    </div>
  );
            }
