import React from "react"; import { useEffect, useState } from "react"; import { auth, db, googleProvider } from "./firebaseConfig"; import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"; import { doc, getDoc, setDoc } from "firebase/firestore"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements";

export default function App() { const [user, setUser] = useState(null); const [xp, setXp] = useState(0); const [level, setLevel] = useState(1); const [forgiveLeft, setForgiveLeft] = useState(6); const [tasks, setTasks] = useState({}); const [loading, setLoading] = useState(true);

const today = new Date().toISOString().split("T")[0];

useEffect(() => { const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { console.log("Auth state changed:", currentUser); if (currentUser) { try { setUser(currentUser); const userRef = doc(db, "users", currentUser.uid); const docSnap = await getDoc(userRef); if (docSnap.exists()) { const data = docSnap.data(); setXp(data.xp || 0); setLevel(data.level || 1); setForgiveLeft(data.forgiveLeft ?? 6); setTasks(data.tasks || {}); } else { await setDoc(userRef, { xp: 0, level: 1, forgiveLeft: 6, tasks: {} }); } } catch (error) { console.error("Data fetch error:", error); } } else { setUser(null); setXp(0); setLevel(1); setForgiveLeft(6); setTasks({}); } setLoading(false); }); return () => unsubscribe(); }, []);

const handleSignIn = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Sign-in error:", error); } };

const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Sign-out error:", error); } };

if (loading) { return ( <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"> Loading... </div> ); }

if (!user) { return ( <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white"> <button onClick={handleSignIn} className="bg-blue-500 px-4 py-2 rounded"> Sign in with Google </button> </div> ); }

const filteredTasks = tasks[today] || [];

return ( <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503264116251-35a269479413')" }}> <div className="p-4 bg-black bg-opacity-60 min-h-screen text-white"> <h1 className="text-3xl font-bold mb-4">Welcome, {user.displayName}</h1> <p>Level: {level} | XP: {xp} | Forgive Left: {forgiveLeft}</p>

<h2 className="mt-6 text-xl font-semibold">Today's Tasks</h2>
    <ul className="mt-2 space-y-2">
      {filteredTasks.map((task, index) => (
        <li key={index} className="bg-gray-700 p-2 rounded">
          {task.done ? <strike>{task.name}</strike> : task.name}
        </li>
      ))}
    </ul>

    <div className="mt-6">
      <Achievements level={level} xp={xp} />
      <Leaderboard />
    </div>

    <button
      onClick={handleSignOut}
      className="mt-6 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  </div>
</div>

); }

