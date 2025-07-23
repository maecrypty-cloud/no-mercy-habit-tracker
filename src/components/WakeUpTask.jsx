import { useState, useEffect } from "react";

function WakeUpTask({ onComplete, freezeXP }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 min = 600 sec
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !completed) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, completed]);

  const handleDone = () => {
    if (timeLeft > 0) {
      setCompleted(true);
      onComplete(10); // XP +10
    } else {
      freezeXP(); // XP freeze if time expired
    }
  };

  return (
    <div className="p-4 rounded bg-red-100">
      <h2 className="text-xl font-bold">Wake Up Task</h2>
      {!completed ? (
        <>
          <p className="text-sm">
            Complete in: {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </p>
          <button
            onClick={handleDone}
            className="bg-red-500 text-white px-3 py-1 rounded mt-2"
          >
            Done
          </button>
        </>
      ) : (
        <p className="text-green-600 font-semibold">Completed!</p>
      )}
    </div>
  );
}

export default WakeUpTask;
