export default function LevelSystem({ level, xp }) {
  return (
    <div className="mb-4 p-3 bg-yellow-100 rounded">
      <h2 className="text-xl font-bold">Level: {level}</h2>
      <p>XP: {xp}</p>
    </div>
  )
}
