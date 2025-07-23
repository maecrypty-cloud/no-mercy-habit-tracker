// src/components/WakeUpTask.jsx
import { useState, useEffect } from "react";

const WakeUpTask = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 min in seconds
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || done) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, done]);

  const handleDone = () => {
    setDone(true);
    onComplete && onComplete();
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" + sec : sec}`;
  };

  return (
    <div style={{ background: "#ffe5e5", padding: "1rem", borderRadius: "8px" }}>
      <h2>Wake Up Task</h2>
      {!done ? <p>Complete in: {formatTime(timeLeft)}</p> : <p>Task Completed!</p>}
      <button
        onClick={handleDone}
        disabled={done}
        style={{
          background: done ? "#ccc" : "#f44336",
          color: "#fff",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          cursor: done ? "not-allowed" : "pointer",
        }}
      >
        Done
      </button>
    </div>
  );
};

export default WakeUpTask;
