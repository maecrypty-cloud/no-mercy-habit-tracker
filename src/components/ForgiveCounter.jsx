export default function ForgiveCounter({ forgives, forgive }) {
  return (
    <div className="mb-4 p-3 bg-purple-100 rounded">
      <h2 className="text-lg">Forgives left: {forgives}</h2>
      <button onClick={forgive} className="bg-purple-500 text-white px-4 rounded mt-2">Use Forgive</button>
    </div>
  )
}
