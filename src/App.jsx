import { useState } from "react";
import WakeUpTask from "./components/WakeUpTask";

export default function App() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [forgives, setForgives] = useState(6);
  const [habits, setHabits] = useState([]);

  const handleWakeUpComplete = () => {
    setXp((prev) => prev + 10);
  };

  const addHabit = (name) => {
    if (!name) return;
    setHabits((prev) => [...prev, { name, done: false }]);
  };

  const completeHabit = (index) => {
    setHabits((prev) =>
      prev.map((h, i) => (i === index ? { ...h, done: true } : h))
    );
    setXp((prev) => prev + 5);
  };

  return (
    <div style={{ fontFamily: "cursive", padding: "1rem" }}>
      <h1>No Mercy Habit Tracker</h1>

      <WakeUpTask onComplete={handleWakeUpComplete} />

      <div style={{ background: "#fff3c4", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
        <h3>Level: {level}</h3>
        <p>XP: {xp}</p>
      </div>

      <div style={{ background: "#f3e8ff", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
        <p>Forgives left: {forgives}</p>
        <button
          onClick={() => setForgives((f) => (f > 0 ? f - 1 : 0))}
          style={{
            background: "#a855f7",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
          }}
        >
          Use Forgive
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="New Habit"
          id="habitInput"
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button
          onClick={() => {
            const input = document.getElementById("habitInput");
            addHabit(input.value);
            input.value = "";
          }}
          style={{
            background: "#3b82f6",
            color: "#fff",
            padding: "0.5rem 1rem",
            border: "none",
            marginLeft: "5px",
          }}
        >
          Add
        </button>
      </div>

      <ul>
        {habits.map((habit, index) => (
          <li key={index} style={{ margin: "5px 0" }}>
            {habit.name}{" "}
            <button
              onClick={() => completeHabit(index)}
              disabled={habit.done}
              style={{
                background: habit.done ? "#ccc" : "#22c55e",
                color: "#fff",
                border: "none",
                padding: "0.2rem 0.5rem",
              }}
            >
              Done
            </button>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: "1rem" }}>Analytics Coming soon...</p>
    </div>
  );
}
