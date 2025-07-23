import React, { useState, useEffect } from "react";

// ---- Preloaded Akatsuki Characters ----
const characters = [
  { name: "Itachi Uchiha", img: "https://i.imgur.com/Ux6sNqV.png" },
  { name: "Pain", img: "https://i.imgur.com/VGic2yF.png" },
  { name: "Kisame Hoshigaki", img: "https://i.imgur.com/EoJd6mj.png" },
  { name: "Deidara", img: "https://i.imgur.com/RPKiL3w.png" },
  { name: "Sasori", img: "https://i.imgur.com/OrjU1Bt.png" },
  { name: "Konan", img: "https://i.imgur.com/HbD5Msz.png" },
  { name: "Hidan", img: "https://i.imgur.com/iycHJxk.png" },
  { name: "Kakuzu", img: "https://i.imgur.com/M5Nncsj.png" },
  { name: "Zetsu", img: "https://i.imgur.com/yrzL4hR.png" },
  { name: "Obito Uchiha", img: "https://i.imgur.com/K7UEVYx.png" }
];

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
  const [xp, setXp] = useState(() => JSON.parse(localStorage.getItem("xp")) || 0);
  const [level, setLevel] = useState(() => JSON.parse(localStorage.getItem("level")) || 1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [character, setCharacter] = useState(() => JSON.parse(localStorage.getItem("character")) || characters[0]);

  const xpRequired = 500 * level;

  // --- Persist Data ---
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("xp", JSON.stringify(xp));
    localStorage.setItem("level", JSON.stringify(level));
    localStorage.setItem("character", JSON.stringify(character));
    localStorage.setItem("user", JSON.stringify(user));
  }, [tasks, xp, level, character, user]);

  // --- Level Up ---
  useEffect(() => {
    if (xp >= xpRequired) {
      setLevel(prev => prev + 1);
      setXp(0);
      const newChar = characters[Math.floor(Math.random() * characters.length)];
      setCharacter(newChar);
      alert(`Level Up! New Character: ${newChar.name}`);
    }
  }, [xp]);

  // --- Add Task ---
  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  // --- Complete Task ---
  const completeTask = (index) => {
    const newTasks = [...tasks];
    if (newTasks[index].done) return;
    newTasks[index].done = true;
    setTasks(newTasks);
    setXp(prev => prev + 10);
  };

  // --- Delete Task ---
  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  // --- Login ---
  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    if (!username) return;
    setUser({ name: username });
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setTasks([]);
    setXp(0);
    setLevel(1);
    setCharacter(characters[0]);
  };

  const filteredTasks = tasks.filter(t => t.date === selectedDate);

  // --- Render ---
  if (!user) {
    return (
      <div style={styles.bg}>
        <div style={styles.loginBox}>
          <h1 style={{ color: "white" }}>Akatsuki Habit Tracker</h1>
          <form onSubmit={handleLogin}>
            <input name="username" placeholder="Enter username" style={styles.input} />
            <button style={styles.button}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h2 style={{ color: "white" }}>Welcome, {user.name}</h2>
            <p style={{ color: "white" }}>Level {level} | XP {xp}/{xpRequired}</p>
          </div>
          <div>
            <img src={character.img} alt={character.name} style={styles.avatar} />
            <p style={{ color: "white", textAlign: "center" }}>{character.name}</p>
            <button style={styles.logout} onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <section style={styles.taskInput}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value;
              const date = e.target.date.value;
              const time = e.target.time.value;
              if (!name || !date || !time) return alert("Fill all fields!");
              addTask({ name, date, time, done: false });
              e.target.reset();
            }}
          >
            <input name="name" placeholder="Task name" style={styles.input} />
            <input name="date" type="date" style={styles.input} defaultValue={selectedDate} />
            <input name="time" type="time" style={styles.input} />
            <button style={styles.button}>Add Task</button>
          </form>
        </section>

        <section>
          <h3 style={{ color: "white" }}>Tasks for {selectedDate}</h3>
          {filteredTasks.length > 0 ? (
            <ul>
              {filteredTasks.map((task, idx) => (
                <li key={idx} style={styles.taskItem}>
                  <span style={{ color: task.done ? "green" : "white" }}>
                    {task.name} - {task.time}
                  </span>
                  {!task.done && <button onClick={() => completeTask(idx)} style={styles.smallBtn}>Done</button>}
                  <button onClick={() => deleteTask(idx)} style={styles.smallBtn}>Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "gray" }}>No tasks</p>
          )}
        </section>

        <section style={{ marginTop: "20px" }}>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.input} />
        </section>
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  bg: {
    background: "url('https://i.imgur.com/q0bM9hh.png') no-repeat center center fixed",
    backgroundSize: "cover",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "cursive",
  },
  container: {
    width: "90%",
    maxWidth: "500px",
    background: "rgba(0,0,0,0.7)",
    padding: "20px",
    borderRadius: "10px"
  },
  loginBox: {
    background: "rgba(0,0,0,0.8)",
    padding: "30px",
    borderRadius: "8px",
    textAlign: "center"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    border: "2px solid red"
  },
  logout: {
    background: "red",
    border: "none",
    padding: "5px 10px",
    marginTop: "5px",
    cursor: "pointer"
  },
  taskInput: {
    marginBottom: "20px"
  },
  input: {
    padding: "8px",
    margin: "5px",
    width: "100%",
    borderRadius: "5px",
    border: "none"
  },
  button: {
    background: "red",
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  smallBtn: {
    marginLeft: "5px",
    background: "red",
    color: "white",
    border: "none",
    padding: "3px 8px",
    borderRadius: "3px"
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  }
};
