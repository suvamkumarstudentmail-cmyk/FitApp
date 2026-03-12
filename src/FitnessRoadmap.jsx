import React, { useState, useEffect, useCallback, useRef } from "react";
import "./styles.css";
import { haptic, PHASES, WORKOUT_A, WORKOUT_B, CARDIO, WEEKLY_SCHEDULE, DAILY_QUESTS_BASE, BIOMARKERS, ACHIEVEMENTS, load, C } from "./data";

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────
const Bar = ({ v, max, color, h = 4 }) => (
  <div className="bar-track" style={{ height: h }}>
    <div className="bar-fill" style={{ width: `${Math.min(100, (v / max) * 100)}%`, background: color }} />
  </div>
);

const Pill = ({ label, value, color }) => (
  <div className="pill">
    <div className="pill-val" style={{ color }}>{value}</div>
    <div className="pill-label">{label}</div>
  </div>
);

const Chip = ({ label, color }) => (
  <div className="chip" style={{ background: `${color}15`, color }}>{label}</div>
);

const Chk = ({ checked, color }) => (
  <div className={`chk ${checked ? "" : "chk-empty"}`} style={checked ? { background: color } : {}}>
    {checked && <svg width="12" height="9" viewBox="0 0 12 9"><path d="M1 4.5L4.5 8L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
  </div>
);

const ACard = ({ icon, name, desc, xp, status, progress, progressMax, onClick }) => {
  const ok = status === "unlocked", eli = status === "eligible";
  return (
    <div onClick={() => { if (eli) { haptic("celebrate"); onClick?.(); } else if (!ok) haptic("blocked"); }}
      className={`acard ${eli ? "acard-eligible" : ""}`}
      style={{ border: eli ? `1px solid ${C.green}50` : "none", cursor: eli ? "pointer" : "default", opacity: ok || eli ? 1 : 0.35 }}>
      {eli && <div className="acard-shim" />}
      <div className="acard-icon" style={{ filter: (!ok && !eli) ? "grayscale(1)" : "none" }}>{ok || eli ? icon : "🔒"}</div>
      <div className="acard-name" style={{ color: eli ? C.green : ok ? C.yellow : C.t3 }}>{name}</div>
      <div className="acard-desc">{desc}</div>
      {!ok && progressMax > 0 && <div style={{ marginBottom: 8 }}><Bar v={progress} max={progressMax} color={eli ? C.green : C.s3} h={3} /><div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{progress}/{progressMax}</div></div>}
      <div className="acard-xp" style={{ color: eli ? C.green : ok ? C.yellow : C.t3 }}>{eli ? "Tap to claim" : `+${xp} XP`}</div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────
export default function FitnessRoadmap() {
  const [tab, setTab] = useState("today");
  const [xp, setXp] = useState(() => load("fit_xp", 0));
  const [completedQuests, setCompletedQuests] = useState(() => load("fit_completedQuests", {}));
  const [achievements, setAchievements] = useState(() => load("fit_achievements", ACHIEVEMENTS));
  const [streak, setStreak] = useState(() => load("fit_streak", 0));
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showXpPop, setShowXpPop] = useState(null);
  const [workoutDone, setWorkoutDone] = useState(() => load("fit_workoutDone", {}));
  const [currentPhase, setCurrentPhase] = useState(() => load("fit_currentPhase", 0));
  const [expandedEx, setExpandedEx] = useState(null);
  const [streakFreezes, setStreakFreezes] = useState(() => load("fit_streakFreezes", 0));
  const [consecPerfect, setConsecPerfect] = useState(() => load("fit_consecPerfect", 0));
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [dayEnded, setDayEnded] = useState(() => load("fit_dayEnded", false));
  const [usedFreezeToday, setUsedFreezeToday] = useState(false);
  const [xpBeforeReset, setXpBeforeReset] = useState(0);
  const [workoutACount, setWorkoutACount] = useState(() => load("fit_workoutACount", 0));
  const [workoutBCount, setWorkoutBCount] = useState(() => load("fit_workoutBCount", 0));
  const [hiitCount, setHiitCount] = useState(() => load("fit_hiitCount", 0));
  const [proteinDays, setProteinDays] = useState(() => load("fit_proteinDays", 0));
  const [riceDays, setRiceDays] = useState(() => load("fit_riceDays", 0));
  const [sweetSwaps, setSweetSwaps] = useState(() => load("fit_sweetSwaps", 0));
  const [sleepDays, setSleepDays] = useState(() => load("fit_sleepDays", 0));
  const [eligibleNotif, setEligibleNotif] = useState(null);
  const [prevElig, setPrevElig] = useState({});
  const [secsLeft, setSecsLeft] = useState(() => { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); return Math.floor((m - n) / 1000); });

  const endDayRef = useRef(null);
  const midFiredRef = useRef(false);
  const prevUrgency = useRef("ok");

  useEffect(() => {
    try {
      const pairs = [["fit_xp",xp],["fit_streak",streak],["fit_currentPhase",currentPhase],["fit_achievements",achievements],["fit_completedQuests",completedQuests],["fit_workoutDone",workoutDone],["fit_streakFreezes",streakFreezes],["fit_consecPerfect",consecPerfect],["fit_dayEnded",dayEnded],["fit_workoutACount",workoutACount],["fit_workoutBCount",workoutBCount],["fit_hiitCount",hiitCount],["fit_proteinDays",proteinDays],["fit_riceDays",riceDays],["fit_sweetSwaps",sweetSwaps],["fit_sleepDays",sleepDays]];
      pairs.forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
    } catch {}
  }, [xp, streak, currentPhase, achievements, completedQuests, workoutDone, streakFreezes, consecPerfect, dayEnded, workoutACount, workoutBCount, hiitCount, proteinDays, riceDays, sweetSwaps, sleepDays]);

  const phase = PHASES[currentPhase] || PHASES[3];
  const phaseXpStart = currentPhase > 0 ? PHASES.slice(0, currentPhase).reduce((a, p) => a + p.xpNeeded, 0) : 0;
  const phaseXp = xp - phaseXpStart;
  const phasePct = Math.min(100, (phaseXp / phase.xpNeeded) * 100);
  const dayData = WEEKLY_SCHEDULE[selectedDay === 0 ? 6 : selectedDay - 1];
  const allTick = Object.keys(completedQuests).length === DAILY_QUESTS_BASE.length;

  const computeElig = useCallback(({ xpV, strV, phI, wA, wB, hiit, prot, rice, sweet, sleep }) => ({
    a1: { eligible: (wA + wB) >= 1, progress: Math.min(1, wA + wB), max: 1 },
    a2: { eligible: prot >= 3, progress: Math.min(3, prot), max: 3 },
    a3: { eligible: rice >= 7, progress: Math.min(7, rice), max: 7 },
    a4: { eligible: sweet >= 5, progress: Math.min(5, sweet), max: 5 },
    a5: { eligible: strV >= 7, progress: Math.min(7, strV), max: 7 },
    a6: { eligible: sleep >= 7, progress: Math.min(7, sleep), max: 7 },
    a7: { eligible: wA >= 10, progress: Math.min(10, wA), max: 10 },
    a8: { eligible: wB >= 10, progress: Math.min(10, wB), max: 10 },
    a9: { eligible: hiit >= 8, progress: Math.min(8, hiit), max: 8 },
    a10: { eligible: xpV >= 500, progress: Math.min(500, xpV), max: 500 },
    a11: { eligible: false, progress: 0, max: 1 },
    a12: { eligible: phI >= 3, progress: Math.min(3, phI), max: 3 },
  }), []);

  useEffect(() => {
    const e = computeElig({ xpV: xp, strV: streak, phI: currentPhase, wA: workoutACount, wB: workoutBCount, hiit: hiitCount, prot: proteinDays, rice: riceDays, sweet: sweetSwaps, sleep: sleepDays });
    const newE = [];
    achievements.forEach(a => { if (!a.unlocked && e[a.id]?.eligible && !prevElig[a.id]) newE.push(a); });
    if (newE.length) { setEligibleNotif(newE[0]); haptic("xp"); setTimeout(() => haptic("pop"), 200); setTimeout(() => setEligibleNotif(null), 4500); }
    const nP = {}; achievements.forEach(a => { nP[a.id] = e[a.id]?.eligible && !a.unlocked; }); setPrevElig(nP);
  }, [xp, streak, currentPhase, workoutACount, workoutBCount, hiitCount, proteinDays, riceDays, sweetSwaps, sleepDays]);

  useEffect(() => { endDayRef.current = endDay; });
  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0);
      const s = Math.floor((m - n) / 1000); setSecsLeft(s <= 0 ? 0 : s);
      const urg = s < 3600 ? "crit" : s < 10800 ? "warn" : "ok";
      if (urg !== prevUrgency.current) {
        if (urg === "warn") haptic("warning");
        if (urg === "crit") { haptic("warning"); setTimeout(() => haptic("warning"), 400); }
        prevUrgency.current = urg;
      }
      if (s <= 0 && !midFiredRef.current) { midFiredRef.current = true; setTimeout(() => { endDayRef.current?.(); setTimeout(() => { midFiredRef.current = false; }, 10000); }, 600); }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const earnXP = useCallback((amount, label) => {
    setXp(prev => {
      const next = prev + amount;
      [100, 250, 500, 750, 1000, 1500, 2000, 3500, 5000, 7000].forEach(ms => { if (prev < ms && next >= ms) setTimeout(() => haptic("milestone"), 120); });
      let np = 0, cum = 0;
      for (let i = 0; i < PHASES.length; i++) { cum += PHASES[i].xpNeeded; if (next < cum) { np = i; break; } if (i === PHASES.length - 1) np = PHASES.length - 1; }
      setCurrentPhase(cur => { if (np !== cur) { setTimeout(() => haptic("levelup"), 80); setTimeout(() => { setShowLevelUp(PHASES[np]); setTimeout(() => setShowLevelUp(null), 4000); }, 100); } return np; });
      return next;
    });
    haptic("xp"); setShowXpPop({ amount, label }); setTimeout(() => setShowXpPop(null), 2000);
  }, []);

  const toggleQuest = (q) => {
    if (completedQuests[q.id] || dayEnded) { haptic("blocked"); return; }
    haptic("pop");
    const nc = { ...completedQuests, [q.id]: true }; setCompletedQuests(nc);
    if (Object.keys(nc).length === DAILY_QUESTS_BASE.length) setTimeout(() => haptic("celebrate"), 180);
    earnXP(q.xp, q.text.slice(0, 30) + "…");
  };

  const redeemAchievement = (idx) => {
    const a = achievements[idx]; if (!a || a.unlocked) return;
    const e = computeElig({ xpV: xp, strV: streak, phI: currentPhase, wA: workoutACount, wB: workoutBCount, hiit: hiitCount, prot: proteinDays, rice: riceDays, sweet: sweetSwaps, sleep: sleepDays });
    if (!e[a.id]?.eligible) { haptic("blocked"); return; }
    haptic("celebrate"); setAchievements(prev => { const n = [...prev]; n[idx] = { ...n[idx], unlocked: true }; return n; }); earnXP(a.xp, `🏆 ${a.name} redeemed!`);
  };

  const endDay = () => {
    if (dayEnded) { haptic("newday"); setCompletedQuests({}); setDayEnded(false); setUsedFreezeToday(false); setSelectedDay(new Date().getDay()); return; }
    if (Object.keys(completedQuests).length === 0) { haptic("error"); setXpBeforeReset(xp); setShowResetModal(true); }
    else {
      if (allTick) { haptic("celebrate"); setTimeout(() => haptic("celebrate"), 350); } else haptic("medium");
      if (completedQuests["q5"]) setProteinDays(p => p + 1); else setProteinDays(0);
      if (completedQuests["q3"]) setRiceDays(r => r + 1);
      if (completedQuests["q4"]) setSweetSwaps(s => s + 1);
      if (completedQuests["q8"]) setSleepDays(s => s + 1);
      const np = allTick ? consecPerfect + 1 : 0; setConsecPerfect(np); setStreak(s => s + 1);
      if (np > 0 && np % 7 === 0) { setStreakFreezes(f => f + 1); haptic("celebrate"); setTimeout(() => haptic("milestone"), 250); earnXP(200, "🧊 Perfect Week Bonus!"); }
      setDayEnded(true);
    }
  };

  const confirmReset = () => { haptic("reset"); setXp(0); setStreak(0); setCurrentPhase(0); setConsecPerfect(0); setCompletedQuests({}); setWorkoutDone({}); setShowResetModal(false); setDayEnded(false); };
  const useFreeze = () => { haptic("freeze"); setStreakFreezes(f => f - 1); setUsedFreezeToday(true); setConsecPerfect(0); setShowResetModal(false); setDayEnded(true); };

  const count = Object.keys(completedQuests).length;
  const h = Math.floor(secsLeft / 3600), mn = Math.floor((secsLeft % 3600) / 60), sc = secsLeft % 60;
  const f = n => String(n).padStart(2, "0");
  const urg = secsLeft < 3600 ? "crit" : secsLeft < 10800 ? "warn" : "ok";
  const tc = urg === "crit" ? C.red : urg === "warn" ? C.orange : C.t3;
  const catC = { nutrition: C.orange, workout: C.green, cardio: C.red, recovery: C.purple };
  const catL = { nutrition: "Nutrition", workout: "Workout", cardio: "Cardio", recovery: "Recovery" };
  const TABS = [{ id: "today", label: "Today", icon: "☀️" }, { id: "workouts", label: "Train", icon: "🏋️" }, { id: "nutrition", label: "Eat", icon: "🥗" }, { id: "progress", label: "Journey", icon: "📊" }, { id: "awards", label: "Awards", icon: "✦" }];
  const eligBadge = computeElig({ xpV: xp, strV: streak, phI: currentPhase, wA: workoutACount, wB: workoutBCount, hiit: hiitCount, prot: proteinDays, rice: riceDays, sweet: sweetSwaps, sleep: sleepDays });
  const claimable = achievements.filter(a => !a.unlocked && eligBadge[a.id]?.eligible).length;

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* XP Toast */}
      {showXpPop && <div className="xp-toast" style={{ background: phase.color, color: "#000" }}>{showXpPop.amount > 0 ? `+${showXpPop.amount} XP  ` : ""}{showXpPop.label}</div>}

      {/* Level Up Sheet */}
      {showLevelUp && (
        <div className="sheet-overlay">
          <div className="sheet-content">
            <div className="sheet-handle" />
            <div className="sheet-emoji">{showLevelUp.badge}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Phase Unlocked</div>
            <div className="sheet-title" style={{ color: showLevelUp.color }}>{showLevelUp.name}</div>
            <div className="sheet-body">{showLevelUp.subtitle} · {showLevelUp.weeks}</div>
            <div style={{ background: C.s2, borderRadius: 16, padding: 18, marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 15, color: C.t2, lineHeight: 1.6 }}>{showLevelUp.desc}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
              {showLevelUp.unlocks.map((u, i) => <Chip key={i} label={`🔓 ${u}`} color={showLevelUp.color} />)}
            </div>
            <button onClick={() => { haptic("medium"); setShowLevelUp(null); }} className="sheet-btn" style={{ background: showLevelUp.color, color: "#fff" }}>Let's Go 🚀</button>
          </div>
        </div>
      )}

      {/* Reset Sheet */}
      {showResetModal && (
        <div className="sheet-overlay">
          <div className="sheet-content">
            <div className="sheet-handle" />
            <div className="sheet-emoji">💀</div>
            <div className="sheet-title" style={{ color: C.red }}>Day Missed</div>
            <div className="sheet-body">No tasks completed. All <span style={{ color: C.red, fontWeight: 700 }}>{xpBeforeReset} XP</span> and your <span style={{ color: C.red, fontWeight: 700 }}>{streak}-day streak</span> will be wiped.</div>
            {streakFreezes > 0 ? (
              <div style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}25`, borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.cyan, marginBottom: 8 }}>🧊 Streak Freeze Available</div>
                <div style={{ fontSize: 14, color: C.t2, lineHeight: 1.6, marginBottom: 16 }}>You have <span style={{ color: C.cyan, fontWeight: 700 }}>{streakFreezes} freeze{streakFreezes > 1 ? "s" : ""}</span> from perfect weeks.</div>
                <button onClick={useFreeze} className="sheet-btn" style={{ background: C.cyan, color: "#fff", marginBottom: 12 }}>🧊 Use Freeze</button>
                <button onClick={confirmReset} className="sheet-btn-ghost">Accept Reset Instead</button>
              </div>
            ) : (
              <>
                <div style={{ background: C.s2, borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 14, color: C.t2, lineHeight: 1.6 }}>No streak freezes. Complete all 10 tasks for 7 consecutive days to earn one.</div>
                <button onClick={confirmReset} className="sheet-btn" style={{ background: C.red, color: "#fff" }}>Reset & Start Again</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Achievement Notification */}
      {eligibleNotif && (
        <div className="notif-island" style={{ border: `1px solid ${C.green}35` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 30 }}>{eligibleNotif.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Achievement Ready</div>
              <div style={{ fontSize: 14, color: C.t1, marginTop: 2 }}>{eligibleNotif.name}</div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>Awards → +{eligibleNotif.xp} XP</div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="header">
        <div className="header-row">
          <div>
            <div className="header-title">Athlete in Progress</div>
            <div className="header-sub">{phase.badge} {phase.name} · {phase.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {streakFreezes > 0 && <div className="freeze-badge"><span style={{ fontSize: 14 }}>🧊</span><span style={{ fontSize: 14, fontWeight: 700, color: C.cyan }}>{streakFreezes}</span></div>}
            <div className="header-xp">
              <div className="header-xp-val" style={{ color: phase.color }}>{xp}</div>
              <div className="header-xp-label">XP</div>
            </div>
          </div>
        </div>
        <div className="header-bar">
          <div className="header-bar-labels">
            <span style={{ color: phase.color }}>{phase.badge} Phase {phase.id}</span>
            {currentPhase < PHASES.length - 1 && <span style={{ color: C.t3 }}>{phase.xpNeeded - phaseXp} to next</span>}
          </div>
          <Bar v={phaseXp} max={phase.xpNeeded} color={phase.color} h={3} />
        </div>
      </div>

      {/* ── TODAY ────────────────────────────────────────────────── */}
      {tab === "today" && (
        <div className="page">
          {/* Timer */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-pad">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: C.t3, fontWeight: 500 }}>Day resets at midnight</div>
                  <div style={{ fontSize: 12, color: urg === "crit" ? C.red : urg === "warn" ? C.orange : C.t3, fontWeight: urg !== "ok" ? 600 : 400, marginTop: 2 }}>
                    {urg === "crit" ? "Last hour — finish up!" : urg === "warn" ? "Evening — wrap up soon" : "Plenty of time"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ background: C.s2, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.orange }}>🔥 {streak}</div>
                    <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>STREAK</div>
                  </div>
                  <div style={{ background: C.s2, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: phase.color }}>{count}/{DAILY_QUESTS_BASE.length}</div>
                    <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>TASKS</div>
                  </div>
                </div>
              </div>
              <div className="timer-digits">
                {[f(h), ":", f(mn), ":", f(sc)].map((seg, i) =>
                  seg === ":" ? <div key={i} className="timer-colon" style={{ color: tc }}>:</div>
                    : <div key={i} className="timer-seg"><div className="timer-num" style={{ color: tc, animation: urg === "crit" ? "critPulse 1.8s ease-in-out infinite" : "none" }}>{seg}</div></div>
                )}
              </div>
              <Bar v={86400 - secsLeft} max={86400} color={urg === "crit" ? C.red : urg === "warn" ? C.orange : phase.color} h={3} />
              <div className="flex-between" style={{ marginTop: 6 }}>
                <span style={{ fontSize: 11, color: C.t3 }}>Start</span>
                <span style={{ fontSize: 11, color: C.t3 }}>Midnight</span>
              </div>
            </div>
            <div style={{ padding: "0 20px 18px" }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: C.t2 }}>Daily progress</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: allTick ? C.yellow : phase.color }}>{Math.round((count / DAILY_QUESTS_BASE.length) * 100)}%</span>
              </div>
              <Bar v={count} max={DAILY_QUESTS_BASE.length} color={allTick ? C.yellow : phase.color} h={5} />
              {allTick && <div style={{ fontSize: 13, color: C.yellow, marginTop: 8, fontWeight: 500 }}>⭐ Perfect day — auto-logs at midnight</div>}
            </div>
          </div>

          {/* Weekly Strip */}
          <div className="slabel">This Week</div>
          <div className="week-strip">
            {WEEKLY_SCHEDULE.map((d, i) => {
              const isSel = selectedDay === (i === 6 ? 0 : i + 1);
              const dc = d.rating === "hard" ? C.red : d.rating === "medium" ? C.orange : C.green;
              return (
                <div key={i} onClick={() => { haptic("tick"); setSelectedDay(i === 6 ? 0 : i + 1); }}
                  className="week-day" style={{ background: isSel ? phase.color : C.s1, border: isSel ? "none" : "none" }}>
                  <div className="week-day-label" style={{ color: isSel ? "#000" : C.t3 }}>{d.day}</div>
                  <div className="week-day-emoji">{d.workout ? "🏋️" : d.cardio ? "🏃‍♀️" : "😴"}</div>
                  <div className="week-day-dot" style={{ background: isSel ? "rgba(0,0,0,0.35)" : dc }} />
                </div>
              );
            })}
          </div>

          {/* Day Detail */}
          {dayData && (
            <div className="card" style={{ marginTop: 10 }}>
              <div className="card-pad">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>{dayData.workout || dayData.cardio || "Rest & Recovery"}</div>
                    {dayData.cardio && dayData.workout && <div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>+ {dayData.cardio}</div>}
                  </div>
                  <div style={{ background: `${dayData.rating === "hard" ? C.red : dayData.rating === "medium" ? C.orange : C.green}18`, color: dayData.rating === "hard" ? C.red : dayData.rating === "medium" ? C.orange : C.green, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8 }}>
                    {dayData.rating.toUpperCase()}
                  </div>
                </div>
                <div style={{ background: C.s2, borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>🍽 Hostel Strategy</div>
                  <div style={{ fontSize: 14, color: C.t2, lineHeight: 1.6 }}>{dayData.menuNote}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: phase.color, marginTop: 10 }}>Target: {dayData.calories} kcal</div>
                </div>
              </div>
            </div>
          )}

          {/* Quests */}
          <div className="flex-between" style={{ marginTop: 4 }}>
            <div className="slabel">Today's Tasks</div>
            <button onClick={() => { if (!dayEnded) { haptic("soft"); setCompletedQuests({}); } }} style={{ fontSize: 15, color: C.blue, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Reset</button>
          </div>
          {["nutrition", "workout", "cardio", "recovery"].map(cat => {
            const qs = DAILY_QUESTS_BASE.filter(q => q.category === cat);
            const acc = catC[cat];
            return (
              <div key={cat}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.t3, textTransform: "uppercase", letterSpacing: 0.4, padding: "10px 0 6px" }}>{catL[cat]}</div>
                <div className="card">
                  {qs.map((q, qi) => {
                    const done = !!completedQuests[q.id];
                    return (
                      <div key={q.id} onClick={() => toggleQuest(q)} className="quest-row"
                        style={{ borderBottom: qi < qs.length - 1 ? `0.5px solid ${C.sep}` : "none", cursor: done ? "default" : "pointer", background: done ? `${acc}06` : "transparent" }}>
                        <Chk checked={done} color={acc} />
                        <div className="quest-icon-box">{q.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="quest-text" style={{ color: done ? C.t3 : C.t1, textDecoration: done ? "line-through" : "none", textDecorationColor: acc }}>{q.text}</div>
                          {done && <div style={{ fontSize: 12, color: acc, marginTop: 3 }}>+{q.xp} XP earned</div>}
                        </div>
                        <div className="quest-xp-badge" style={{ background: `${acc}${done ? "20" : "10"}`, color: done ? acc : C.t3 }}>+{q.xp}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {allTick && (
            <div className="complete-banner" style={{ background: `${C.yellow}08`, border: `1px solid ${C.yellow}20` }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.yellow, letterSpacing: -0.3 }}>All Tasks Complete!</div>
              <div style={{ fontSize: 14, color: C.t3, marginTop: 6 }}>+{DAILY_QUESTS_BASE.reduce((a, q) => a + q.xp, 0)} XP · Perfect day logs at midnight</div>
            </div>
          )}
        </div>
      )}

      {/* ── WORKOUTS ─────────────────────────────────────────────── */}
      {tab === "workouts" && (
        <div className="page">
          <div className="slabel">Weekly Structure</div>
          <div className="card">
            {WEEKLY_SCHEDULE.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < WEEKLY_SCHEDULE.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.orange, width: 36 }}>{d.day}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{d.workout || d.cardio || "Rest"}</div>
                  {d.cardio && d.workout && <div style={{ fontSize: 13, color: C.t3, marginTop: 2 }}>+ {d.cardio}</div>}
                </div>
                {workoutDone[d.day] && <div style={{ fontSize: 16, color: C.green }}>✓</div>}
              </div>
            ))}
          </div>
          {[WORKOUT_A, WORKOUT_B].map(wk => (
            <div key={wk.name}>
              <div className="slabel">{wk.label}</div>
              <div className="card">
                <div className="wk-header">
                  <div>
                    <div className="wk-title">{wk.icon} {wk.label}</div>
                    <div className="wk-sub">{wk.day}</div>
                  </div>
                  <button onClick={() => { haptic("workout"); if (wk.name === "WORKOUT A") setWorkoutACount(c => c + 1); else setWorkoutBCount(c => c + 1); setWorkoutDone(p => ({ ...p, [wk.name]: true })); earnXP(80, `${wk.name} complete!`); }}
                    className="wk-btn" style={{ background: workoutDone[wk.name] ? `${wk.color}18` : wk.color, color: workoutDone[wk.name] ? wk.color : "#fff" }}>
                    {workoutDone[wk.name] ? "✓ Done" : "Log Done"}
                  </button>
                </div>
                {wk.exercises.map((ex, i) => (
                  <div key={i} onClick={() => { const isO = expandedEx === `${wk.name}-${i}`; haptic(isO ? "soft" : "tick"); setExpandedEx(isO ? null : `${wk.name}-${i}`); }}
                    style={{ borderBottom: i < wk.exercises.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                    <div className="ex-row">
                      <div style={{ flex: 1 }}>
                        <div className="ex-name">{ex.name}</div>
                        <div className="ex-meta">{ex.sets} sets × {ex.reps}</div>
                      </div>
                      <div className="ex-chevron" style={{ transform: expandedEx === `${wk.name}-${i}` ? "rotate(90deg)" : "rotate(0)" }}>›</div>
                    </div>
                    {expandedEx === `${wk.name}-${i}` && (
                      <div className="ex-why">
                        <div className="ex-why-inner" style={{ background: `${wk.color}08`, borderLeftColor: wk.color }}>
                          <div className="ex-why-title" style={{ color: wk.color }}>Why this exercise</div>
                          <div className="ex-why-text">{ex.why}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="slabel">Cardio Protocol</div>
          <div className="card">
            {CARDIO.map((c, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: i < CARDIO.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 26, width: 38, textAlign: "center" }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: c.color }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: C.t2, marginTop: 3 }}>{c.freq} · {c.duration}</div>
                    <div style={{ fontSize: 13, color: C.t3, marginTop: 2 }}>{c.format}</div>
                    <div style={{ fontSize: 13, color: C.t2, marginTop: 4, fontStyle: "italic" }}>{c.benefit}</div>
                  </div>
                  {c.name === "HIIT" && <button onClick={() => { haptic("hiit"); setHiitCount(h => h + 1); earnXP(60, "HIIT done!"); }} className="cardio-btn" style={{ background: C.red }}>+60 XP</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NUTRITION ────────────────────────────────────────────── */}
      {tab === "nutrition" && (
        <div className="page">
          <div className="slabel">Daily Targets</div>
          <div className="grid-3 mb-8">
            {[{ l: "Calories", v: "1,600", c: C.orange }, { l: "Protein", v: "130g", c: C.green }, { l: "Deficit", v: "400", c: C.red }].map((s, i) => <Pill key={i} label={s.l} value={s.v} color={s.c} />)}
          </div>
          <div className="grid-3 mb-12">
            {[{ l: "Carbs", v: "165g", c: C.purple }, { l: "Fats", v: "52g", c: C.yellow }, { l: "Loss/wk", v: "0.4kg", c: C.cyan }].map((s, i) => <Pill key={i} label={s.l} value={s.v} color={s.c} />)}
          </div>
          <div className="slabel">Hostel Menu — Day Guide</div>
          <div className="card">
            {WEEKLY_SCHEDULE.map((d, i) => {
              const dc = d.rating === "hard" ? C.red : d.rating === "medium" ? C.orange : C.green;
              return (
                <div key={i} style={{ padding: "16px 20px", borderBottom: i < WEEKLY_SCHEDULE.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: dc }}>{d.day}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.t2 }}>{d.calories}</span>
                      <div style={{ background: `${dc}18`, color: dc, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>{d.rating.toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: C.t2, lineHeight: 1.6 }}>{d.menuNote}</div>
                </div>
              );
            })}
          </div>
          <div className="slabel">Power Rankings</div>
          <div className="grid-2">
            <div className="card"><div className="card-pad">
              <div style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>✅ Always Eat</div>
              {["Idli + Sambar", "Fish curry", "Prawns (Fri)", "Dalma (Mon)", "Santula", "Dal / Dali", "Raita", "Egg dishes", "Mitha Dahi", "Plain Dosa"].map((t, i) => <div key={i} className="food-item">→ {t}</div>)}
            </div></div>
            <div className="card"><div className="card-pad">
              <div style={{ fontSize: 12, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>🚫 Avoid / Limit</div>
              {["Full Maggie pack", "2 Bhatura", "Gulab Jamun", "Khiri / Kheer", "Chips (side)", "2 cups rice", "Both chicken+paneer", "Dalibara full", "Fried Rice+Paneer", "Full sweets"].map((t, i) => <div key={i} className="food-item">✗ {t}</div>)}
            </div></div>
          </div>
          <div className="slabel">Protein Gap</div>
          <div className="card">
            <div className="card-pad">
              <div style={{ fontSize: 16, fontWeight: 600, color: C.yellow, marginBottom: 10 }}>⚠ The Protein Gap</div>
              <div style={{ fontSize: 14, color: C.t2, lineHeight: 1.6, marginBottom: 14 }}>Hostel delivers ~60–80g/day. You need 125–140g. Gap = <span style={{ color: C.red, fontWeight: 600 }}>45–60g daily.</span></div>
              <div style={{ background: C.s2, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.yellow, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Close the gap</div>
                {["1 scoop whey = +25g (120 kcal)", "Hung curd 150g = +15g", "Extra egg = +12g", "Double dal = +10g"].map((t, i) => <div key={i} style={{ fontSize: 14, color: C.t2, marginBottom: 6 }}>→ {t}</div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESS ─────────────────────────────────────────────── */}
      {tab === "progress" && (
        <div className="page">
          <div className="card" style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ padding: "28px 24px" }}>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>The Athletic Ideal</div>
              <div style={{ fontSize: 14, color: C.t3, marginBottom: 24 }}>Perfect biomarkers · Curves intact · Strength-defined</div>
              <div className="grid-3 mb-12">
                {[{ l: "Now", v: "78 kg", c: C.t3 }, { l: "Mid (Mo 5)", v: "72 kg", c: C.orange }, { l: "Goal (Mo 12)", v: "66 kg", c: C.yellow }].map((s, i) => (
                  <div key={i} style={{ background: C.s2, borderRadius: 14, padding: "16px 8px" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.c, letterSpacing: -0.5 }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 5 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 18px", background: C.s2, borderRadius: 14 }}>
                <div style={{ fontSize: 13, color: C.t3, marginBottom: 8 }}>Phase Progress</div>
                <Bar v={phaseXp} max={phase.xpNeeded} color={phase.color} h={5} />
                <div className="flex-between" style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: C.t3 }}>{phaseXp} / {phase.xpNeeded} XP</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: phase.color }}>{Math.round(phasePct)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="slabel">The 4 Phases</div>
          {PHASES.map((p, i) => {
            const isAct = i === currentPhase, isDone = i < currentPhase;
            return (
              <div key={i} className="card" style={isAct ? { border: `1px solid ${p.color}30` } : {}}>
                <div className="card-pad">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: (isAct || isDone) ? 14 : 0 }}>
                    <div style={{ fontSize: 28 }}>{p.badge}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: (isAct || isDone) ? p.color : C.t3 }}>{p.name}</span>
                        {isAct && <Chip label="ACTIVE" color={p.color} />}
                        {isDone && <span style={{ fontSize: 14, color: C.green }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>{p.subtitle} · {p.weeks} · {p.xpNeeded} XP</div>
                    </div>
                  </div>
                  {(isAct || isDone) && <>
                    <Bar v={isAct ? phaseXp : p.xpNeeded} max={p.xpNeeded} color={p.color} h={4} />
                    <div style={{ fontSize: 14, color: C.t2, marginTop: 12, lineHeight: 1.6 }}>{p.bodyChange}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{p.unlocks.map((u, j) => <Chip key={j} label={`🔓 ${u}`} color={p.color} />)}</div>
                  </>}
                </div>
              </div>
            );
          })}
          <div className="slabel">Target Biomarkers</div>
          <div className="card">
            {BIOMARKERS.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < BIOMARKERS.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{b.icon}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500 }}>{b.name}</div><div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>Now: {b.current}</div></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: b.color, textAlign: "right" }}>→ {b.target}</div>
              </div>
            ))}
          </div>
          <div className="slabel">Monthly Milestones</div>
          <div className="card">
            {[{ mo: "Month 1", change: "1.5–2 kg lost", note: "Waist tightens, energy up, bloating gone", color: C.orange },
            { mo: "Month 2", change: "3–4 kg lost", note: "Belly noticeably flatter, clothes looser", color: C.green },
            { mo: "Month 3", change: "4–5 kg lost", note: "Lower belly reducing, thighs firming", color: C.purple },
            { mo: "Month 4–6", change: "6–8 kg lost", note: "Thighs reshaping, glutes lifted", color: C.yellow },
            { mo: "Month 6–12", change: "8–12 kg lost", note: "Full athletic silhouette, perfect biomarkers", color: C.cyan }
            ].map((m, i, arr) => (
              <div key={i} className="timeline-row" style={{ borderBottom: i < arr.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                <div className="timeline-track">
                  <div className="timeline-dot" style={{ background: m.color }} />
                  {i < arr.length - 1 && <div className="timeline-line" />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.mo}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{m.change}</div>
                  <div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>{m.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AWARDS ────────────────────────────────────────────────── */}
      {tab === "awards" && (() => {
        const e = computeElig({ xpV: xp, strV: streak, phI: currentPhase, wA: workoutACount, wB: workoutBCount, hiit: hiitCount, prot: proteinDays, rice: riceDays, sweet: sweetSwaps, sleep: sleepDays });
        const eligC = achievements.filter(a => !a.unlocked && e[a.id]?.eligible).length;
        const unlkC = achievements.filter(a => a.unlocked).length;
        return (
          <div className="page">
            <div className="grid-3" style={{ marginTop: 16, marginBottom: 14 }}>
              <Pill label="Unlocked" value={`${unlkC}/${achievements.length}`} color={C.yellow} />
              <Pill label="Claimable" value={eligC} color={C.green} />
              <Pill label="Total XP" value={xp} color={phase.color} />
            </div>
            {eligC > 0 && (
              <div style={{ background: `${C.green}08`, border: `1px solid ${C.green}20`, borderRadius: 16, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: C.green, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.green }}>{eligC} achievement{eligC > 1 ? "s" : ""} ready</div>
                  <div style={{ fontSize: 13, color: C.t3, marginTop: 3 }}>Tap the glowing card to claim</div>
                </div>
              </div>
            )}
            {eligC > 0 && <><div className="slabel" style={{ paddingTop: 4 }}>Ready to Claim</div><div className="grid-3 mb-8">{achievements.map((a, i) => { const ei = e[a.id]; if (a.unlocked || !ei?.eligible) return null; return <ACard key={a.id} {...a} status="eligible" progress={ei.progress} progressMax={ei.max} onClick={() => redeemAchievement(i)} />; })}</div></>}
            {unlkC > 0 && <><div className="slabel">Unlocked</div><div className="grid-3 mb-8">{achievements.map((a, i) => { if (!a.unlocked) return null; const ei = e[a.id]; return <ACard key={a.id} {...a} status="unlocked" progress={ei?.max} progressMax={ei?.max} onClick={() => { }} />; })}</div></>}
            <div className="slabel">In Progress</div>
            <div className="grid-3 mb-12">{achievements.map((a, i) => { const ei = e[a.id]; if (a.unlocked || ei?.eligible) return null; return <ACard key={a.id} {...a} status="locked" progress={ei?.progress ?? 0} progressMax={ei?.max ?? 0} onClick={() => { }} />; })}</div>
            <div className="slabel">Progress Trackers</div>
            <div className="card">
              {[{ label: "Workout A sessions", cur: workoutACount, max: 10, color: C.orange, achv: "Hip Thrust Hero" },
              { label: "Workout B sessions", cur: workoutBCount, max: 10, color: C.green, achv: "Chest Champion" },
              { label: "HIIT sessions", cur: hiitCount, max: 8, color: C.red, achv: "Cardio Crusher" },
              { label: "Protein days in row", cur: proteinDays, max: 3, color: C.green, achv: "Protein Queen" },
              { label: "Rice control days", cur: riceDays, max: 7, color: C.orange, achv: "Rice Rebel" },
              { label: "Sweet swaps", cur: sweetSwaps, max: 5, color: C.purple, achv: "Sweet Slayer" },
              { label: "Sleep 7h+ nights", cur: sleepDays, max: 7, color: C.purple, achv: "Deep Sleeper" },
              { label: "Day streak", cur: streak, max: 7, color: C.orange, achv: "Streak Goddess" },
              { label: "XP toward 500", cur: xp, max: 500, color: C.yellow, achv: "Phase Conqueror I" },
              { label: "Phase level", cur: currentPhase, max: 3, color: C.yellow, achv: "Athletic Body" },
              ].map((row, i, arr) => {
                const done = row.cur >= row.max;
                return (
                  <div key={i} style={{ padding: "14px 20px", borderBottom: i < arr.length - 1 ? `0.5px solid ${C.sep}` : "none" }}>
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: C.t2 }}>{row.label}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: done ? C.green : row.color }}>{row.cur}/{row.max}</span>
                        {done && <span style={{ fontSize: 13, color: C.green }}>✓</span>}
                      </div>
                    </div>
                    <Bar v={row.cur} max={row.max} color={done ? C.green : row.color} h={3} />
                    <div style={{ fontSize: 12, color: C.t3, marginTop: 5 }}>→ {row.achv}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── TAB BAR ──────────────────────────────────────────────── */}
      <div className="tab-bar">
        {TABS.map(t => {
          const isAct = tab === t.id;
          const dot = t.id === "awards" && claimable > 0;
          return (
            <button key={t.id} onClick={() => { haptic(tab === t.id ? "soft" : "tick"); setTab(t.id); }} className="tab-btn">
              <div style={{ position: "relative" }}>
                <div className="tab-icon" style={{ opacity: isAct ? 1 : 0.4, transform: isAct ? "scale(1.05)" : "scale(1)", filter: isAct ? "none" : "grayscale(0.3)" }}>{t.icon}</div>
                {dot && <div className="tab-dot" />}
              </div>
              <div className="tab-label" style={{ color: isAct ? phase.color : C.t3, fontWeight: isAct ? 600 : 400 }}>{t.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
