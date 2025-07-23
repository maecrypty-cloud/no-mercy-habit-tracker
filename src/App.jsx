import React, { useState, useEffect } from "react";

const akatsukiImages = [
  "https://images.alphacoders.com/115/1152231.jpg",
  "https://images.alphacoders.com/122/1223181.jpg",
  "https://images.alphacoders.com/125/1257963.jpg",
  "https://images.alphacoders.com/118/1182972.jpg",
  "https://images.alphacoders.com/128/1280491.jpg", // Itachi
];

const getToday = () => new Date().toISOString().split("T")[0];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [deathModeDay, setDeathModeDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isDeathDay, setIsDeathDay] = useState(false);
  const xpRequired = 500 * level;

  useEffect(() => {
    const saved = localStorage.getItem("habitData");
    if (saved) {
      const d = JSON.parse(saved);
      setTasks(d.tasks || []);
      setXp(d.xp || 0);
      setLevel(d.level || 1);
      setForgiveLeft(d.forgiveLeft ?? 6);
      setDeathModeDay(d.deathModeDay || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "habitData",
      JSON.stringify({ tasks, xp, level, forgiveLeft, deathModeDay })
    );
  }, [tasks, xp, level, forgiveLeft, deathModeDay]);

  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  useEffect(() => {
    if (deathModeDay) {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      setIsDeathDay(today === deathModeDay);
    }
  }, [deathModeDay]);

  const addTask = (task) => setTasks((p) => [...p, task]);

  const completeTask = (idx) => {
    if (xpFrozen) return;
    const newTasks = [...tasks];
    const task = newTasks[idx];

    if (task.name.toLowerCase() === "wake up") {
      const now = new Date();
      const taskTime = new Date(`${task.date}T${task.time}`);
      if ((now - taskTime) / 60000 > 10) {
        setXpFrozen(true);
        alert("Wake Up task late! XP frozen.");
        return;
      }
    }

    newTasks[idx].done = true;
    setTasks(newTasks);
    if (isDeathDay && newTasks.some((t) => !t.done)) {
      setXpFrozen(true);
      alert("Death Day Rule Broken! XP frozen.");
    } else {
      setXp((p) => p + 10);
    }
  };

  const forgiveTask = (idx) => {
    if (xpFrozen) return;
    if (forgiveLeft <= 0) return alert("No forgives left!");
    const task = tasks[idx];
    if (task.name.toLowerCase() === "wake up") {
      setXpFrozen(true);
      alert("Wake Up forgiven -> XP frozen for today!");
      return;
    }
    const newTasks = [...tasks];
    newTasks[idx].done = true;
    setTasks(newTasks);
    setForgiveLeft((p) => p - 1);
  };

  const deleteTask = (idx) => {
    if (tasks[idx].name.toLowerCase() === "wake up") {
      alert("Wake Up task cannot be deleted!");
      return;
    }
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, date, time, duration } = e.target;
    if (!name.value || !date.value || !time.value)
      return alert("Please fill all fields!");
    addTask({ name: name.value, date: date.value, time: time.value, duration: duration.value, done: false });
    e.target.reset();
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
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white"
        style={{
          backgroundImage: `url('https://images.alphacoders.com/128/1280491.jpg')`,
          backgroundSize: "cover"
        }}>
        <h1 className="text-4xl font-bold mb-6">No Mercy Habit Tracker</h1>
        <button
          onClick={() => setLoggedIn(true)}
          className="bg-red-600 px-6 py-2 rounded font-bold"
        >
          Login
        </button>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => t.date === selectedDate);
  const akatsukiImg = akatsukiImages[level % akatsukiImages.length];

  return (
    <div className="min-h-screen text-white"
      style={{
        backgroundImage: `url('https://images.alphacoders.com/128/1280491.jpg')`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed"
      }}>
      {/* Navbar */}
      <nav className="sticky top-0 flex justify-around bg-black bg-opacity-70 p-4">
        <button className="bg-red-600 px-3 py-1 rounded">Dashboard</button>
        <button className="bg-red-600 px-3 py-1 rounded">Reports</button>
        <button className="bg-red-600 px-3 py-1 rounded">Death Mode</button>
        <button onClick={logout} className="bg-gray-600 px-3 py-1 rounded">Logout</button>
      </nav>

      {/* Header */}
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">Level {level} | XP: {xp}/{xpRequired}</h2>
        {xpFrozen && <p className="text-red-400">(XP Frozen)</p>}
        <img src={akatsukiImg} alt="Akatsuki" className="mx-auto rounded-2xl mt-4 w-48 h-48 object-cover"/>
      </div>

      {/* Death Mode */}
      <div className="text-center mb-4">
        <label className="mr-2">Select Death Mode Day:</label>
        <select
          value={deathModeDay || ""}
          onChange={(e) => setDeathModeDay(e.target.value)}
          className="text-black px-2"
        >
          <option value="">None</option>
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
            .map((d) => <option key={d}>{d}</option>)}
        </select>
        {deathModeDay && <p className="mt-2">Active Death Day: {deathModeDay}</p>}
      </div>

      {/* Task Form */}
      <form onSubmit={handleSubmit} className="flex justify-center gap-2 mb-4 flex-wrap">
        <input name="name" placeholder="Task" required className="text-black px-2"/>
        <input name="date" type="date" required className="text-black px-2"/>
        <input name="time" type="time" required className="text-black px-2"/>
        <input name="duration" type="number" defaultValue={30} min={5} className="text-black px-2"/>
        <button type="submit" className="bg-green-600 px-4 py-1 rounded">Add</button>
      </form>

      {/* Tasks */}
      <div className="max-w-2xl mx-auto bg-black bg-opacity-60 p-4 rounded-xl">
        <h3 className="text-xl mb-2 text-center">Tasks for {selectedDate}</h3>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-black mb-4 px-2"/>
        {filteredTasks.length ? filteredTasks.map((task, idx) => (
          <div key={idx} className="bg-gray-800 p-3 mb-2 rounded flex justify-between">
            <span>{task.name} - {task.time} ({task.duration}m)</span>
            {!task.done ? (
              <div className="space-x-1">
                <button onClick={() => completeTask(idx)} className="bg-blue-600 px-2 rounded">Done</button>
                <button onClick={() => forgiveTask(idx)} className="bg-yellow-600 px-2 rounded">Forgive</button>
                <button onClick={() => deleteTask(idx)} className="bg-red-600 px-2 rounded">Delete</button>
              </div>
            ) : <span className="text-green-400 font-bold">✔</span>}
          </div>
        )) : <p className="text-center">No tasks</p>}
      </div>
    </div>
  );
    }
