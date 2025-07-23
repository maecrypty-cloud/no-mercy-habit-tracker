import React, { useState } from 'react'
import HabitForm from './components/HabitForm'
import HabitList from './components/HabitList'
import LevelSystem from './components/LevelSystem'
import WakeUpTask from './components/WakeUpTask'
import Analytics from './components/Analytics'
import ForgiveCounter from './components/ForgiveCounter'

export default function App() {
  const [habits, setHabits] = useState([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [forgives, setForgives] = useState(6)
  const [wakeUpDone, setWakeUpDone] = useState(false)

  const addHabit = (habit) => {
    setHabits([...habits, habit])
  }

  const completeHabit = (index) => {
    if (!wakeUpDone) return alert("Wake Up Task pehle complete karo!")
    let updated = [...habits]
    updated[index].done = true
    setHabits(updated)
    setXp(xp + 10)
    checkLevelUp(xp + 10)
  }

  const forgive = () => {
    if (forgives > 0) setForgives(forgives - 1)
    else alert("No forgives left for your level!")
  }

  const checkLevelUp = (newXp) => {
    let requiredXp = level * 500
    if (newXp >= requiredXp) {
      setLevel(level + 1)
      setForgives(forgives - 1)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">No Mercy Habit Tracker</h1>
      <WakeUpTask setWakeUpDone={setWakeUpDone}/>
      <LevelSystem level={level} xp={xp}/>
      <ForgiveCounter forgives={forgives} forgive={forgive}/>
      <HabitForm addHabit={addHabit}/>
      <HabitList habits={habits} completeHabit={completeHabit} />
      <Analytics />
    </div>
  )
}
