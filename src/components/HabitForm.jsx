import React, { useState } from 'react'

export default function HabitForm({ addHabit }) {
  const [title, setTitle] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    addHabit({ title, done: false })
    setTitle('')
  }
  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="New Habit" className="border p-2 flex-1 rounded"/>
      <button className="bg-blue-500 text-white px-4 rounded">Add</button>
    </form>
  )
}
