import React, { useState, useEffect } from "react";

// ----- Utility -----
const todayISO = () => new Date().toISOString().split("T")[0];
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [forgiveLeft, setForgiveLeft] = useState(6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [deathDay, setDeathDay] = useState("");
  const [view, setView] = useState("dashboard"); // dashboard | calendar | reports
  const [bg, setBg] = useState(
    "https://images.alphacoders.com/128/1280491.jpg"
  );

  // XP required per level
  const xpRequired = 500 * level;

  // ---- Level up check ----
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel((prev) => prev + 1);
      setXp(0);
      setForgiveLeft((prev) => Math.max(1, prev - 1));
    }
  }, [xp]);

  // ---- Add Task ----
  const addTask = (task) => {
    // Prevent duplicate wake up tasks
    if (task.name.toLowerCase() === "wake up") {
      if (tasks.some((t) => t.date === task.date && t.name.toLowerCase() === "wake up")) {
        alert("Wake Up task already exists for this day!");
        return;
      }
    }
    setTasks([...tasks, task]);
  };

  // ---- Complete Task ----
  const completeTask = (index) => {
    if (xpFrozen) return;

    const newTasks = [...tasks];
    const task = newTasks[index];

    // Wake Up rule check
    if (task.name.toLowerCase() === "wake up") {
      const now = new Date();
      const taskTime = new Date(`${task.date}T${task.time}`);
      const diffMinutes = (now - taskTime) / 1000 / 60;
      if (diffMinutes > 10) {
        setXpFrozen(true);
        alert("Wake Up task late! XP frozen for today.");
        return;
      }
    }

    newTasks[index].done = true;
    setTasks(newTasks);
    setXp((prev) => prev + 10);
  };

  // ---- Forgive ----
  const forgiveTask = (index) => {
    if (forgiveLeft <= 0) return alert("No forgives left!");
    const newTasks = [...tasks];
    if (newTasks[index].name.toLowerCase() === "wake up") {
      setXpFrozen(true);
      alert("Wake Up forgiven → XP frozen today!");
    }
    newTasks[index].done = true;
    setTasks(newTasks);
    setForgiveLeft((prev) => prev - 1);
  };

  // ---- Delete Task ----
  const deleteTask = (index) => {
    if (tasks[index].name.toLowerCase() === "wake up") {
      alert("Cannot delete Wake Up task!");
      return;
    }
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  // ---- Filter tasks by selectedDate ----
  const filteredTasks = tasks.filter((t) => t.date === selectedDate);

  // ---- Handle Add Task Form ----
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const date = form.date.value;
    const time = form.time.value;

    if (!name || !date || !time) return alert("Fill required fields!");
    addTask({ name, date, time, duration: form.duration.value, done: false });
    form.reset();
  };

  // ---- Death Mode active days ----
  const isDeathDay =
    new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }) ===
    deathDay;

  const deathModeActive =
    (level >= 7 && ["double", "death"].includes("double")) || isDeathDay;

  // ---- Simple Reports ----
  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `url(${bg}) center/cover no-repeat fixed`,
        backdropFilter: "blur(4px)",
      }}
    >
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-black bg-opacity-70 flex justify-between px-4 py-3 shadow-lg">
        <h1 className="text-2xl font-bold tracking-widest text-red-500">
          Akatsuki Habit
        </h1>
        <div className="flex gap-4">
          {["dashboard", "calendar", "reports"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setView(item);
                scrollToTop();
              }}
              className={`px-4 py-2 rounded-md transition ${
                view === item
                  ? "bg-red-500 text-white scale-105"
                  : "bg-gray-800 hover:bg-red-500"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="p-6">
        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <p className="mb-4 text-lg">
              Level: {level} | XP: {xp}/{xpRequired}{" "}
              {xpFrozen && "(Frozen)"} | Forgives: {forgiveLeft}
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap gap-2 bg-black bg-opacity-60 p-4 rounded-lg"
            >
              <input
                type="text"
                name="name"
                placeholder="Task name"
                className="px-2 py-1 rounded text-black"
                required
              />
              <input
                type="date"
                name="date"
                className="px-2 py-1 rounded text-black"
                defaultValue={todayISO()}
                required
              />
              <input
                type="time"
                name="time"
                className="px-2 py-1 rounded text-black"
                required
              />
              <input
                type="number"
                name="duration"
                defaultValue={30}
                min="5"
                className="px-2 py-1 rounded text-black"
              />
              <button className="bg-red-500 px-4 py-1 rounded hover:bg-red-700">
                Add Task
              </button>
            </form>

            <div className="mt-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 text-black rounded"
              />
              {deathModeActive && (
                <p className="mt-2 text-red-400 font-bold">
                  Death Mode Active! No Forgives.
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className={`p-4 bg-black bg-opacity-70 rounded-lg shadow-lg transition transform hover:scale-105 ${
                      task.done ? "border-green-400 border" : ""
                    }`}
                  >
                    <h3 className="text-xl font-bold">{task.name}</h3>
                    <p>
                      {task.time} - {task.duration} min
                    </p>
                    {!task.done ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => completeTask(tasks.indexOf(task))}
                          className="bg-green-500 px-3 py-1 rounded hover:bg-green-700"
                        >
                          Done
                        </button>
                        {!deathModeActive && (
                          <button
                            onClick={() => forgiveTask(tasks.indexOf(task))}
                            className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-700"
                          >
                            Forgive
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(tasks.indexOf(task))}
                          className="bg-red-500 px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-green-400 font-bold">✔ Done</span>
                    )}
                  </div>
                ))
              ) : (
                <p>No tasks for this day</p>
              )}
            </div>
          </div>
        )}

        {/* CALENDAR (simple) */}
        {view === "calendar" && (
          <div className="bg-black bg-opacity-60 p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Calendar View</h2>
            {tasks.map((t, i) => (
              <p key={i}>
                {t.date} - {t.name} {t.done && "✔"}
              </p>
            ))}
            <div className="mt-4">
              <label>Select Death Mode Day: </label>
              <select
                value={deathDay}
                onChange={(e) => setDeathDay(e.target.value)}
                className="text-black px-2 py-1 rounded"
              >
                <option value="">None</option>
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {view === "reports" && (
          <div className="bg-black bg-opacity-60 p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Reports</h2>
            <p>Total Tasks: {totalTasks}</p>
            <p>Completed: {completedTasks}</p>
            <p>Completion Rate: {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}%</p>
          </div>
        )}
      </div>
    </div>
  );
    }
