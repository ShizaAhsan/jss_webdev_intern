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

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9_pRuKo218AnRBD1YsvAulx6ud6BOjRg",
  authDomain: "jobskillshare-899e6.firebaseapp.com",
  projectId: "jobskillshare-899e6",
  storageBucket: "jobskillshare-899e6.firebasestorage.app",
  messagingSenderId: "943714874912",
  appId: "1:943714874912:web:fbfa3ae7ec79175f45ee45",
  measurementId: "G-1VECK8GWBV"
};
// ─────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
