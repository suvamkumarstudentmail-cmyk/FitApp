// ─── HAPTICS ─────────────────────────────────────────────────────────
export const haptic = (type = "light") => {
  if (!navigator.vibrate) return;
  const p = {
    soft:[4], light:[8], tick:[6], medium:[18], heavy:[35],
    pop:[10,30,8], xp:[6,40,10], celebrate:[8,50,12,50,20],
    levelup:[8,80,16,100,28], milestone:[8,40,14,40,20],
    workout:[12,40,20], hiit:[10,20,10,20,10], newday:[8,60,8,60,8],
    freeze:[5,25,5,25,5,25,5], blocked:[30], warning:[20,70,20],
    error:[60,30,60], reset:[80,40,80,40,120],
  };
  navigator.vibrate(p[type] || [8]);
};

// ─── PHASES ──────────────────────────────────────────────────────────
export const PHASES = [
  { id:1, name:"The Awakening", subtitle:"Foundation", weeks:"Weeks 1–4", xpNeeded:500, color:"#FF9F0A", desc:"Build habit consistency. Nail protein targets. Establish workout rhythm.", unlocks:["Nutrition Tracker","Workout Log","Daily Quests"], bodyChange:"Energy improves, early waist tightening, 1–2 kg water weight drops, visceral belly fat begins reducing", badge:"🌱" },
  { id:2, name:"The Sculptor", subtitle:"Visible Progress", weeks:"Weeks 5–12", xpNeeded:1500, color:"#30D158", desc:"Progressive overload on all lifts. Dial in sleep. Maintain deficit.", unlocks:["Progress Photos","Measurement Tracker","Streak Multiplier"], bodyChange:"Waist visibly smaller, belly significantly flatter, pectoral muscle adds breast lift, scale down 3–5 kg", badge:"⚡" },
  { id:3, name:"The Forge", subtitle:"Thigh Recomposition", weeks:"Months 3–6", xpNeeded:3500, color:"#BF5AF2", desc:"Focus on measurements not scale. Increase lower body strength.", unlocks:["Strength Milestones","Body Measurement Charts","Advanced Cardio"], bodyChange:"Thighs reshape, glutes more lifted and defined, scale may plateau but measurements improve", badge:"🔥" },
  { id:4, name:"The Athlete", subtitle:"Full Transformation", weeks:"Months 6–12", xpNeeded:7000, color:"#FFD60A", desc:"Recomposition phase — maintain deficit while building strength.", unlocks:["Biomarker Dashboard","Athletic Goals","Elite Status"], bodyChange:"Thigh fat meaningfully reduced, full silhouette transformed, breast size maintained with improved shape", badge:"👑" },
];

export const WORKOUT_A = {
  name:"WORKOUT A", label:"Lower Body Arsenal", day:"Mon / Fri", icon:"🦵", color:"#FF9F0A",
  exercises:[
    { name:"Hip Thrust", sets:"4", reps:"10–12", why:"Highest glute EMG activation of any exercise" },
    { name:"Romanian Deadlift", sets:"3", reps:"8–10", why:"Deep glute + hamstring lengthening under load" },
    { name:"Bulgarian Split Squat", sets:"3", reps:"10–12 each", why:"Unilateral thigh shaping, fixes imbalances" },
    { name:"Leg Press (wide)", sets:"3", reps:"12–15", why:"High volume quad work, no spinal compression" },
    { name:"Cable Kickback", sets:"3", reps:"15 each", why:"Upper glute isolation, rounds the glutes" },
    { name:"Calf Raise", sets:"3", reps:"15–20", why:"Complete lower leg development" },
    { name:"Plank + Dead Bug", sets:"3", reps:"30–45s", why:"Core tightening directly narrows the waist" },
  ]
};

export const WORKOUT_B = {
  name:"WORKOUT B", label:"Upper Body + Chest", day:"Wed / Sat", icon:"💪", color:"#30D158",
  exercises:[
    { name:"Incline Dumbbell Press", sets:"4", reps:"10–12", why:"Pec development lifts breast tissue naturally" },
    { name:"Flat Dumbbell Fly", sets:"3", reps:"12–15", why:"Chest width and fullness from stretch" },
    { name:"Push-Up Variations", sets:"3", reps:"10–15", why:"Bodyweight pec activation, no equipment needed" },
    { name:"One-Arm Dumbbell Row", sets:"3", reps:"10–12", why:"Posture correction opens chest visually" },
    { name:"Face Pull / Rear Delt Fly", sets:"3", reps:"15", why:"Corrects rounded shoulders, opens posture" },
    { name:"Lat Pulldown", sets:"3", reps:"10–12", why:"Back width creates hourglass ratio" },
    { name:"Shoulder Press", sets:"3", reps:"10–12", why:"Upper body symmetry and shoulder caps" },
    { name:"Curl + Tricep Extension", sets:"2 each", reps:"12–15", why:"Arm tone and definition" },
  ]
};

export const CARDIO = [
  { name:"HIIT", freq:"2×/week", duration:"20–25 min", format:"30s hard : 30s rest × 10", benefit:"Visceral belly fat killer", icon:"⚡", color:"#FF453A" },
  { name:"Zone 2 Walk/Bike", freq:"2–3×/week", duration:"35–45 min", format:"60–70% max HR", benefit:"Fat oxidation, active recovery", icon:"🚶‍♀️", color:"#30D158" },
  { name:"Fasted Walk", freq:"1×/week", duration:"30 min", format:"Morning, empty stomach", benefit:"Stubborn fat mobilisation", icon:"🌅", color:"#FF9F0A" },
];

export const WEEKLY_SCHEDULE = [
  { day:"MON", workout:"Workout A", cardio:null, calories:"~1,550", rating:"easy", menuNote:"Idli + Sambar · Dalma Rice · Paneer Dinner" },
  { day:"TUE", workout:"Workout B", cardio:"HIIT", calories:"~1,620", rating:"hard", menuNote:"Maggie (half only) · Chicken Rice · Mushroom+Egg Dinner" },
  { day:"WED", workout:"Workout A", cardio:null, calories:"~1,570", rating:"medium", menuNote:"Egg Chop only · Fish Rice (skip chips) · 1 Bhatura" },
  { day:"THU", workout:null, cardio:"Zone 2", calories:"~1,600", rating:"hard", menuNote:"1 Dalibara+Bara · Jeera Rice cut · Dahi over Kheer" },
  { day:"FRI", workout:"Workout B", cardio:"HIIT", calories:"~1,570", rating:"medium", menuNote:"Chaat breakfast · Prawn Rice · 1 protein dinner only" },
  { day:"SAT", workout:"Workout A", cardio:"Zone 2", calories:"~1,600", rating:"hard", menuNote:"1 Pakodi/Paratha · Rice cut · 1 Rasgulla max" },
  { day:"SUN", workout:null, cardio:"Fasted Walk", calories:"~1,600", rating:"easy", menuNote:"Dosa · Biryani (1 plate) · 1 protein at dinner" },
];

export const DAILY_QUESTS_BASE = [
  { id:"q1", text:"Drink 400ml water before lunch & dinner", xp:20, icon:"💧", category:"nutrition" },
  { id:"q2", text:"Eat protein first, rice last at every meal", xp:25, icon:"🍗", category:"nutrition" },
  { id:"q3", text:"Reduce rice to 1 cup (not heaped) at lunch", xp:30, icon:"🍚", category:"nutrition" },
  { id:"q4", text:"Skip dessert or swap for Mitha Dahi", xp:40, icon:"🚫", category:"nutrition" },
  { id:"q5", text:"Hit 125g+ protein today", xp:50, icon:"⚡", category:"nutrition" },
  { id:"q6", text:"Complete today's assigned workout", xp:80, icon:"🏋️‍♀️", category:"workout" },
  { id:"q7", text:"10-min walk after lunch", xp:20, icon:"🚶‍♀️", category:"cardio" },
  { id:"q8", text:"Sleep 7+ hours tonight", xp:30, icon:"😴", category:"recovery" },
  { id:"q9", text:"Wear sports bra for workout", xp:15, icon:"👙", category:"recovery" },
  { id:"q10", text:"Stay within 1,550–1,650 kcal today", xp:60, icon:"🎯", category:"nutrition" },
];

export const BIOMARKERS = [
  { name:"Resting Heart Rate", current:"~82 bpm", target:"< 65 bpm", icon:"❤️", color:"#FF453A" },
  { name:"Body Fat %", current:"~32–35%", target:"20–24% (Athletic)", icon:"📊", color:"#FF9F0A" },
  { name:"Waist-to-Hip Ratio", current:"~0.82", target:"< 0.75", icon:"📏", color:"#30D158" },
  { name:"Fasting Blood Sugar", current:"Track monthly", target:"< 100 mg/dL", icon:"🩸", color:"#BF5AF2" },
  { name:"Vitamin D", current:"Unknown", target:"40–60 ng/mL", icon:"☀️", color:"#FFD60A" },
  { name:"Haemoglobin", current:"Check baseline", target:"12–15 g/dL", icon:"🔬", color:"#30D158" },
];

export const ACHIEVEMENTS = [
  { id:"a1", name:"First Blood", desc:"Complete first workout", xp:100, icon:"⚔️", unlocked:false },
  { id:"a2", name:"Protein Queen", desc:"Hit 125g protein 3 days in a row", xp:150, icon:"👑", unlocked:false },
  { id:"a3", name:"Rice Rebel", desc:"Control rice portions for 7 days", xp:200, icon:"🍚", unlocked:false },
  { id:"a4", name:"Sweet Slayer", desc:"Swap dessert for Mitha Dahi 5×", xp:175, icon:"🍬", unlocked:false },
  { id:"a5", name:"Streak Goddess", desc:"7-day workout streak", xp:300, icon:"🔥", unlocked:false },
  { id:"a6", name:"Deep Sleeper", desc:"7 nights of 7+ hours sleep", xp:200, icon:"💤", unlocked:false },
  { id:"a7", name:"Hip Thrust Hero", desc:"Complete 10 sessions of Workout A", xp:250, icon:"🦵", unlocked:false },
  { id:"a8", name:"Chest Champion", desc:"Complete 10 sessions of Workout B", xp:250, icon:"💪", unlocked:false },
  { id:"a9", name:"Cardio Crusher", desc:"Complete 8 HIIT sessions", xp:300, icon:"⚡", unlocked:false },
  { id:"a10", name:"Phase Conqueror I", desc:"Complete Phase 1 (500 XP)", xp:500, icon:"🌱", unlocked:false },
  { id:"a11", name:"The Sculptor", desc:"Lose first 5 kg", xp:400, icon:"✨", unlocked:false },
  { id:"a12", name:"Athletic Body", desc:"Reach Phase 4 — The Athlete", xp:1000, icon:"🏆", unlocked:false },
];

// ─── HELPERS ─────────────────────────────────────────────────────────
export const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

// ─── COLOR TOKENS ────────────────────────────────────────────────────
export const C = {
  bg:"#000", s1:"#1C1C1E", s2:"#2C2C2E", s3:"#3A3A3C",
  t1:"#FFFFFF", t2:"rgba(235,235,245,0.6)", t3:"rgba(235,235,245,0.38)", t4:"rgba(235,235,245,0.18)",
  sep:"rgba(84,84,88,0.34)",
  blue:"#0A84FF", green:"#30D158", orange:"#FF9F0A",
  red:"#FF453A", purple:"#BF5AF2", yellow:"#FFD60A", cyan:"#64D2FF",
};
