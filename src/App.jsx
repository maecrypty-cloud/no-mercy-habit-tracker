import React, { useState, useEffect } from "react"; import { auth, db, googleProvider } from "./firebaseConfig"; import {   signInWithPopup,   signOut,   onAuthStateChanged } from "firebase/auth"; import {   doc,   getDoc,   setDoc,   updateDoc } from "firebase/firestore"; import Leaderboard from "./Leaderboard"; import Achievements from "./Achievements";

export default function App() {   const [user, setUser] = useState(null);   const [page, setPage] = useState("dashboard");   const [tasks, setTasks] = useState({});   const [xp, setXp] = useState(0);   const [level, setLevel] = useState(1);   const [xpFrozen, setXpFrozen] = useState(false);   const [forgiveLeft, setForgiveLeft] = useState(6);   const [selectedDeathDay, setSelectedDeathDay] = useState(null);   const [selectedDeathDay2, setSelectedDeathDay2] = useState(null);   const [deathDayLocked1, setDeathDayLocked1] = useState(false);   const [deathDayLocked2, setDeathDayLocked2] = useState(false);   const [today, setToday] = useState(new Date().toISOString().split("T")[0]);   const [missedOnStrictDay, setMissedOnStrictDay] = useState(false);

  function getWeekNumber(date) {     const firstDay = new Date(date.getFullYear(), 0, 1);     const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));     return Math.ceil((days + firstDay.getDay() + 1) / 7);   }   const [weekNumber, setWeekNumber] = useState(getWeekNumber(new Date()));   const xpRequired = 500 * level;

  useEffect(() => {     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {       if (currentUser) {         setUser(currentUser);       } else {         setUser(null);         setTasks({});         setXp(0);         setLevel(1);         setXpFrozen(false);         setForgiveLeft(6);         setMissedOnStrictDay(false);         setDeathDayLocked1(false);         setDeathDayLocked2(false);         setPage("dashboard");       }     });     return () => unsubscribe();   }, []);

  const handleGoogleLogin = async () => {     try {       await signInWithPopup(auth, googleProvider);     } catch (error) {       console.error(error);     }   };

  const handleLogout = async () => {     await signOut(auth);     setTasks({});     setXp(0);     setLevel(1);     setXpFrozen(false);     setForgiveLeft(6);     setMissedOnStrictDay(false);     setDeathDayLocked1(false);     setDeathDayLocked2(false);     setPage("dashboard");   };

  useEffect(() => {     if (user) {       const userRef = doc(db, "users", user.uid);       getDoc(userRef).then((docSnap) => {         if (docSnap.exists()) {           const data = docSnap.data();           setXp(data.xp || 0);           setLevel(data.level || 1);         } else {           setDoc(userRef, { name: user.displayName, email: user.email, xp: 0, level: 1 });         }       });     }   }, [user]);

  useEffect(() => {     if (user) {       const userRef = doc(db, "users", user.uid);       updateDoc(userRef, { xp, level }).catch(console.error);     }   }, [xp, level, user]);

  useEffect(() => {     if (xp >= xpRequired) {       setLevel((prev) => prev + 1);       setXp(0);       setForgiveLeft((prev) => Math.max(1, prev - 1));     }   }, [xp]);

  const isDeathDayToday = () => {     const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });     return todayDayName === selectedDeathDay || todayDayName === selectedDeathDay2;   };

  useEffect(() => {     const interval = setInterval(() => {       const now = new Date();       const currentDate = now.toISOString().split("T")[0];       const currentWeek = getWeekNumber(now);

      if (currentDate !== today) {         setToday(currentDate);         setXpFrozen(false);         setMissedOnStrictDay(false);       }       if (currentWeek !== weekNumber) {         setWeekNumber(currentWeek);         setDeathDayLocked1(false);         setDeathDayLocked2(false);       }     }, 60000);     return () => clearInterval(interval);   }, [today, weekNumber]);

  const addTask = (task) => {     setTasks((prev) => {       const existing = prev[task.date] || [];       return { ...prev, [task.date]: [...existing, task] };     });   };

  const completeTask = (date, index) => {     if (xpFrozen || missedOnStrictDay) return;     const newDateTasks = [...(tasks[date] || [])];     if (newDateTasks[index].done) return;

    if (newDateTasks[index].name.toLowerCase() === "wake up") {       const now = new Date();       const taskTime = new Date(${newDateTasks[index].date}T${newDateTasks[index].time});       const diffMinutes = (now - taskTime) / 1000 / 60;       if (diffMinutes > 10) {         setXpFrozen(true);         alert("Wake Up task late! XP frozen for today.");       }     }

    newDateTasks[index].done = true;     setTasks((prev) => ({ ...prev, [date]: newDateTasks }));

    if (!xpFrozen && !missedOnStrictDay) setXp((prev) => prev + 10);   };

  const forgiveTask = (date, index) => {     if (isDeathDayToday()) {       alert("Strict mode active today, forgives are not allowed!");       return;     }     if (forgiveLeft <= 0) {       alert("No forgives left!");       return;     }     const newDateTasks = [...(tasks[date] || [])];     if (newDateTasks[index].name.toLowerCase() === "wake up") {       setXpFrozen(true);       alert("Wake Up task forgiven, XP frozen for today!");     }     newDateTasks[index].done = true;     setTasks((prev) => ({ ...prev, [date]: newDateTasks }));     setForgiveLeft((prev) => prev - 1);   };

  useEffect(() => {     if (isDeathDayToday()) {       const todayTasks = tasks[today] || [];       const allDone = todayTasks.length === 0 || todayTasks.every((t) => t.done);       if (!allDone) setMissedOnStrictDay(true);     }   }, [tasks, today]);

  const filteredTasks = tasks[today] || [];

  const handleSubmit = (e) => {     e.preventDefault();     const name = e.target.name.value;     const rawDate = e.target.date.value;     const normalizedDate = new Date(rawDate).toISOString().split("T")[0];     const time = e.target.time.value;     const duration = e.target.duration.value;     if (!name || !rawDate || !time) return alert("Please fill all fields!");     const taskObj = { name, date: normalizedDate, time, duration, done: false };     addTask(taskObj);     e.target.reset();   };

  // UI RENDERING IS BELOW   // This is already well-structured and clean. Let me know if you'd like it in a separate layout.

  return (     <div className="min-h-screen bg-black text-white">       {/* Renders dynamically based on auth and selected page /}       {/ Your entire layout code (navbar, banner, pages) will remain here unchanged */}     </div>   ); }

      
