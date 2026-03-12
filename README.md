# Athlete In Progress — PWA

Your girlfriend's personal fitness tracker. Runs as a full-screen app on Android, 
persists all data in localStorage (survives closing, rebooting, everything).

---

## Deploy in 4 steps

### Prerequisites
- [Node.js](https://nodejs.org) installed (v18 or higher)
- A free [Vercel account](https://vercel.com) (sign up with GitHub, takes 1 min)

---

### Step 1 — Install dependencies
```bash
cd fitapp
npm install
```

### Step 2 — Test locally (optional)
```bash
npm run dev
```
Opens at http://localhost:5173 — check everything works.

### Step 3 — Deploy to Vercel
```bash
npx vercel --prod
```
- First time: it asks you to log in (opens browser) and confirm project name
- Just press Enter for all defaults
- Done in ~60 seconds
- You get a URL like: `https://fitapp-xyz.vercel.app`

### Step 4 — Send her the link & install on Android
1. Send the Vercel URL to her phone (WhatsApp, SMS, anything)
2. She opens it in **Chrome**
3. Chrome shows a banner: **"Add Athlete In Progress to Home Screen"** → tap it
4. OR: tap the **3-dot menu** → **Add to Home Screen**
5. App icon appears on her home screen, opens fullscreen — no browser bar

---

## What's persistent (survives close/reboot/everything)
- ✅ Total XP
- ✅ Day streak + streak freezes  
- ✅ Current phase (Awakening → Sculptor → Forge → Athlete)
- ✅ All achievement unlock states
- ✅ Today's completed quests
- ✅ Workout A/B session counts
- ✅ HIIT session count
- ✅ Protein days in a row
- ✅ Rice control days
- ✅ Sweet swap count
- ✅ Sleep days tracked
- ✅ Consecutive perfect days

## What resets daily (by design)
- Today's quest ticks (auto-clear at midnight or on "New Day")
- Workout done status for today

---

## Pushing updates
Any time you update the code, just run:
```bash
npm run build
npx vercel --prod
```
She gets the update automatically next time she opens the app. No reinstall needed.

---

## Data safety
All data lives in Chrome's localStorage on her device. If she:
- **Clears Chrome data** → data wipes (warn her not to do this for this site)
- **Switches phones** → data won't transfer (it's local only)
- **Reinstalls Chrome** → data may wipe

If you ever want cloud backup, the next step would be adding Firebase — but localStorage is rock solid for a single-device personal app.
