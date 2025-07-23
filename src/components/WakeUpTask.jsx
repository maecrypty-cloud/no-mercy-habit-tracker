import { useState, useEffect } from 'react'

export default function WakeUpTask({ setWakeUpDone }) {
  const [timer, setTimer] = useState(600)

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [timer])

  return (
    <div className="mb-4 p-3 bg-red-100 rounded">
      <h2 className="text-xl font-bold">Wake Up Task</h2>
      <p>Complete in: {Math.floor(timer/60)}:{timer%60}</p>
      <button onClick={() => setWakeUpDone(true)} className="bg-red-500 text-white px-4 mt-2 rounded">
        Done
      </button>
    </div>
  )
}
