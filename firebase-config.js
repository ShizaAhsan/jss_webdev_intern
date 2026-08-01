// ══════════════════════════════════════════════════════════════
// JobSkillShare — Firebase Configuration
// ══════════════════════════════════════════════════════════════
//
// SETUP INSTRUCTIONS (one-time, 5 minutes):
// ──────────────────────────────────────────
// 1. Go to:  https://console.firebase.google.com
// 2. Click "Add project" → Name: "JobSkillShare" → Continue
// 3. Disable Google Analytics (optional) → Create project
// 4. Click "</>" (Web App) icon → Register app → Copy config below
// 5. Enable Auth: Authentication → Sign-in method → Email/Password → Enable
//    Also enable: Google → Enable → Save
// 6. Create DB: Firestore Database → Create database → Start in test mode → Done
// 7. Replace the placeholder values below with YOUR config values
// ══════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// ─────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
