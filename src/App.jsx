import React, { useState, useEffect } from "react";

const animeBackgrounds = [
  "https://wallpaperaccess.com/full/2123655.jpg",
  "https://wallpaperaccess.com/full/2123646.jpg",
  "https://wallpaperaccess.com/full/3234047.jpg",
  "https://wallpaperaccess.com/full/3893529.jpg",
  "https://wallpaperaccess.com/full/7313408.jpg"
];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nm_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("nm_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [xp, setXp] = useState(() => Number(localStorage.getItem("nm_xp") || 0));
  const [level, setLevel] = useState(() => Number(localStorage.getItem("nm_level") || 1));
  const [forgiveLeft, setForgiveLeft] = useState(() =>
    Number(localStorage.getItem("nm_forgive") || 6)
  );
  const [xpFrozen, setXpFrozen] = useState(false);
  const [deathDay, setDeathDay] = useState(localStorage.getItem("nm_deathDay") || "");

  const [bg, setBg] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const xpRequired = 500 * level;

  useEffect(() => {
    setBg(animeBackgrounds[Math.floor(Math.random() * animeBackgrounds.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem("nm_tasks", JSON.stringify(tasks));
    localStorage.setItem("nm_xp", xp);
    localStorage.setItem("nm_level", level);
    localStorage.setItem("nm_forgive", forgiveLeft);
    localStorage.setItem("nm_deathDay", deathDay);
  }, [tasks, xp, level, forgiveLeft, deathDay]);

  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  const addTask = (task) => setTasks((prev) => [...prev, task]);

  const completeTask = (index) => {
    if (xpFrozen) return;
    const newTasks = [...tasks];
    if (newTasks[index].done) return;

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
    const { name, date, time, duration } = e.target;
    if (!name.value || !date.value || !time.value) return alert("Fill required fields");
    addTask({
      name: name.value,
      date: date.value,
      time: time.value,
      duration: duration.value,
      done: false
    });
    e.target.reset();
  };

  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setTasks([]);
    setXp(0);
    setLevel(1);
    setForgiveLeft(6);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="p-8 rounded-lg bg-black/50 shadow-lg w-80">
          <h1 className="text-2xl font-bold mb-4 text-center">No Mercy Login</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const username = e.target.username.value;
              if (!username) return;
              setUser({ username });
              localStorage.setItem("nm_user", JSON.stringify({ username }));
            }}
          >
            <input
              name="username"
              placeholder="Enter username"
              className="p-2 mb-4 w-full rounded text-black"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-800 w-full p-2 rounded"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Responsive Navbar */}
      <nav className="flex justify-between items-center p-4 bg-black/60 relative">
        <h1 className="text-xl font-bold">No Mercy</h1>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <div
  className={`md:flex gap-4 ${
    menuOpen
      ? "absolute top-14 left-0 w-full bg-black/80 p-4 z-50"
      : "hidden md:flex"
  }`}
>
          {["home", "tasks", "reports", "death", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMenuOpen(false);
              }}
              className={`px-3 py-1 rounded block ${
                activeTab === tab ? "bg-red-600" : "bg-gray-700 hover:bg-gray-500"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-800 hover:bg-red-600 rounded block"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="p-4 backdrop-blur-sm bg-black/40 min-h-screen">
        <p className="mb-4">
          Welcome, {user.username}! | Level: {level} | XP: {xp}/{xpRequired}{" "}
          {xpFrozen && "(Frozen)"} | Forgive left: {forgiveLeft}
        </p>

        {activeTab === "home" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Today</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-black p-1 mb-4 rounded"
            />
            <ul className="space-y-2">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="p-2 bg-black/60 rounded flex justify-between"
                  >
                    <div>
                      <span className="font-bold">{task.name}</span> - {task.time}
                    </div>
                    {!task.done ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => completeTask(tasks.indexOf(task))}
                          className="bg-green-600 px-2 rounded hover:bg-green-800"
                        >
                          Done
                        </button>
                        <button
                          onClick={() => forgiveTask(tasks.indexOf(task))}
                          className="bg-yellow-600 px-2 rounded hover:bg-yellow-800"
                        >
                          Forgive
                        </button>
                      </div>
                    ) : (
                      <span>✔</span>
                    )}
                  </li>
                ))
              ) : (
                <p>No tasks today</p>
              )}
            </ul>
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add Task</h2>
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap gap-2 mb-4 bg-black/50 p-4 rounded"
            >
              <input
                type="text"
                name="name"
                placeholder="Task name"
                className="p-2 rounded text-black"
              />
              <input type="date" name="date" className="p-2 rounded text-black" />
              <input type="time" name="time" className="p-2 rounded text-black" />
              <input
                type="number"
                name="duration"
                min="5"
                defaultValue="30"
                className="p-2 rounded text-black"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-800 px-4 rounded"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p>Daily: {filteredTasks.filter((t) => t.done).length} done</p>
            <p>Weekly: {tasks.filter((t) => t.done).length} done</p>
          </div>
        )}

        {activeTab === "death" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Death Mode</h2>
            <p>
              Pick a day of week for Death Mode: No forgives, all tasks mandatory
              that day.
            </p>
            <select
              value={deathDay}
              onChange={(e) => setDeathDay(e.target.value)}
              className="text-black p-2 rounded mt-2"
            >
              <option value="">None</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
            {deathDay && (
              <p className="mt-2 text-red-300 font-bold">
                Current Death Mode: {deathDay}
              </p>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p>Name: {user.username}</p>
            <p>Level: {level}</p>
            <p>XP: {xp}/{xpRequired}</p>
            <p>Forgive left: {forgiveLeft}</p>
          </div>
        )}
      </div>
    </div>
  );
      }
