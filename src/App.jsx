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
  const [selectedDeathDay2, setSelectedDeathDay2] = useState(null);
  const [deathDayLocked1, setDeathDayLocked1] = useState(false);
  const [deathDayLocked2, setDeathDayLocked2] = useState(false);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);
  const [missedOnStrictDay, setMissedOnStrictDay] = useState(false);
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));
  const [editingTask, setEditingTask] = useState(null);

  function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
  }

  const xpRequired = 500 * level;

  // --- LOAD FROM STORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem("noMercyData");
    if (saved) {
      const data = JSON.parse(saved);
      setUser(data.user || null);
      setTasks(data.tasks || []);
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setForgiveLeft(data.forgiveLeft ?? 6);
      setSelectedDeathDay(data.selectedDeathDay || null);
      setSelectedDeathDay2(data.selectedDeathDay2 || null);
      setDeathDayLocked1(!!data.selectedDeathDay);
      setDeathDayLocked2(!!data.selectedDeathDay2);
    }
  }, []);

  // --- SAVE TO STORAGE ---
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "noMercyData",
        JSON.stringify({
          user,
          tasks,
          xp,
          level,
          forgiveLeft,
          selectedDeathDay,
          selectedDeathDay2,
        })
      );
    }
  }, [user, tasks, xp, level, forgiveLeft, selectedDeathDay, selectedDeathDay2]);

  // --- LEVEL UP ---
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  const isDeathDayToday = () => {
    const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return todayDayName === selectedDeathDay || todayDayName === selectedDeathDay2;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentWeek = getWeekNumber(now);
      if (currentDate !== today) {
        setToday(currentDate);
        setXpFrozen(false);
        setMissedOnStrictDay(false);
      }
      if (currentWeek !== weekNumber) {
        setWeekNumber(currentWeek);
        setDeathDayLocked1(false);
        setDeathDayLocked2(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [today, weekNumber]);

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
    setMissedOnStrictDay(false);
    setDeathDayLocked1(false);
    setDeathDayLocked2(false);
    localStorage.removeItem("noMercyData");
  };

  const addTask = (task) => setTasks((prev) => [...prev, task]);

  const deleteTask = (index) => {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const completeTask = (index) => {
    if (xpFrozen || missedOnStrictDay) return;
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
    if (!xpFrozen && !missedOnStrictDay) setXp((prev) => prev + 10);
  };

  const forgiveTask = (index) => {
    if (isDeathDayToday()) {
      alert("Strict mode active today, forgives are not allowed!");
      return;
    }
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

  useEffect(() => {
    if (isDeathDayToday()) {
      const todayTasks = tasks.filter((t) => t.date === today);
      const allDone = todayTasks.length === 0 || todayTasks.every((t) => t.done);
      if (!allDone) setMissedOnStrictDay(true);
    }
  }, [tasks, today]);

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

  const startEditing = (task, index) => {
    setEditingTask({ ...task, index });
  };

  const saveTaskEdit = (e) => {
    e.preventDefault();
    const updated = [...tasks];
    updated[editingTask.index] = {
      name: e.target.name.value,
      date: e.target.date.value,
      time: e.target.time.value,
      duration: e.target.duration.value,
      done: editingTask.done,
    };
    setTasks(updated);
    setEditingTask(null);
  };

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">No Mercy Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="username" placeholder="Enter your name" className="border p-2 w-full" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <nav className="flex justify-between mb-4">
        <div className="font-bold">Welcome {user}</div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1">Logout</button>
      </nav>

      <div className="mb-4">
        <p>Level: {level}</p>
        <p>XP: {xp}/{xpRequired}</p>
        <p>Forgives Left: {forgiveLeft}</p>
        {xpFrozen && <p className="text-red-500">XP Frozen for today</p>}
        {missedOnStrictDay && <p className="text-red-500">Strict Day tasks missed, XP frozen</p>}
      </div>

      {/* Task Form */}
      {!editingTask ? (
        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <input name="name" placeholder="Task Name" className="border p-2 w-full" />
          <input type="date" name="date" className="border p-2 w-full" defaultValue={today} />
          <input type="time" name="time" className="border p-2 w-full" />
          <input type="number" name="duration" placeholder="Duration (min)" className="border p-2 w-full" />
          <button className="bg-green-500 text-white px-4 py-2">Add Task</button>
        </form>
      ) : (
        <form onSubmit={saveTaskEdit} className="space-y-2 mb-4">
          <input name="name" defaultValue={editingTask.name} className="border p-2 w-full" />
          <input type="date" name="date" defaultValue={editingTask.date} className="border p-2 w-full" />
          <input type="time" name="time" defaultValue={editingTask.time} className="border p-2 w-full" />
          <input type="number" name="duration" defaultValue={editingTask.duration} className="border p-2 w-full" />
          <button className="bg-yellow-500 text-white px-4 py-2">Save</button>
        </form>
      )}

      {/* Today's Tasks */}
      <h2 className="text-xl font-bold mb-2">Today's Tasks</h2>
      <ul className="space-y-2">
        {filteredTasks.length === 0 && <p>No tasks for today</p>}
        {filteredTasks.map((task, index) => (
          <li key={index} className="border p-2 flex justify-between">
            <div>
              <p>{task.name}</p>
              <p className="text-sm">{task.time} ({task.duration} min)</p>
            </div>
            <div className="space-x-2">
              {!task.done && <button onClick={() => completeTask(index)} className="bg-blue-500 text-white px-2">Done</button>}
              {!task.done && <button onClick={() => forgiveTask(index)} className="bg-purple-500 text-white px-2">Forgive</button>}
              <button onClick={() => startEditing(task, index)} className="bg-yellow-500 text-white px-2">Edit</button>
              <button onClick={() => deleteTask(index)} className="bg-red-500 text-white px-2">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
            }
