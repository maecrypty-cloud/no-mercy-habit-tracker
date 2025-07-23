import { useState, useEffect } from "react";
import WakeUpTask from "./WakeUpTask";

function App() {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [forgives, setForgives] = useState(6);
  const [xpFrozen, setXpFrozen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");

  // XP Add
  const addXP = (amount) => {
    if (!xpFrozen) {
      const updatedXP = xp + amount;
      setXP(updatedXP);
      levelUpCheck(updatedXP);
    }
  };

  // XP Freeze
  const freezeXPForToday = () => {
    setXpFrozen(true);
    alert("Wake Up Task missed! XP frozen for today.");
  };

  // Level up check
  const levelUpCheck = (xpValue) => {
    if (level === 1 && xpValue >= 500) {
      setLevel(2);
      setForgives(5);
    } else if (level === 2 && xpValue >= 1000) {
      setLevel(3);
      setForgives(4);
    }
    // Add more if needed
  };

  // Add habit
  const addHabit = () => {
    if (newHabit.trim() !== "") {
      setHabits([...habits, { text: newHabit, completed: false }]);
      setNewHabit("");
    }
  };

  // Complete habit
  const completeHabit = (index) => {
    const updated = [...habits];
    updated[index].completed = !updated[index].completed;
    setHabits(updated);
    if (updated[index].completed) addXP(10);
  };

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl font-bold mb-4">No Mercy Habit Tracker</h1>

      {/* Wake Up Task */}
      <WakeUpTask onComplete={addXP} freezeXP={freezeXPForToday} />

      {/* Level and XP */}
      <div className="p-4 bg-yellow-100 rounded mt-4">
        <h2 className="text-lg font-bold">Level: {level}</h2>
        <p>XP: {xp}</p>
      </div>

      {/* Forgives */}
      <div className="p-4 bg-purple-100 rounded mt-4">
        <p>Forgives left: {forgives}</p>
        <button
          className="bg-purple-500 text-white px-3 py-1 rounded mt-2"
          disabled={forgives <= 0}
          onClick={() => setForgives((f) => Math.max(0, f - 1))}
        >
          Use Forgive
        </button>
      </div>

      {/* Add habit */}
      <div className="flex mt-4">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New Habit"
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={addHabit}
          className="bg-blue-500 text-white px-4 py-1 rounded ml-2"
        >
          Add
        </button>
      </div>

      {/* Habit list */}
      <ul className="mt-4">
        {habits.map((habit, i) => (
          <li key={i} className="flex items-center justify-between mb-2">
            <span
              className={habit.completed ? "line-through text-gray-500" : ""}
            >
              {habit.text}
            </span>
            <button
              onClick={() => completeHabit(i)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              {habit.completed ? "Undo" : "Done"}
            </button>
          </li>
        ))}
      </ul>

      {/* Analytics */}
      <div className="mt-6">
        <h2 className="text-xl font-bold">Analytics</h2>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}

export default App;
