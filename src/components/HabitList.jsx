export default function HabitList({ habits, completeHabit }) {
  return (
    <div>
      {habits.map((h, i) => (
        <div key={i} className="flex justify-between items-center bg-white rounded p-2 mb-2 shadow">
          <span className={h.done ? "line-through" : ""}>{h.title}</span>
          <button onClick={() => completeHabit(i)} className="bg-green-500 text-white px-3 rounded">
            Done
          </button>
        </div>
      ))}
    </div>
  )
}
