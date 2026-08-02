// ══════════════════════════════════════════════════════════════
// JobSkillShare — Authentication Module (auth.js)
// Uses Firebase v10 Modular SDK
// ══════════════════════════════════════════════════════════════

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";
import { logAffiliateConversion } from "./backend.js";

const googleProvider = new GoogleAuthProvider();

// ── Friendly error messages ───────────────────────────────────
function getFirebaseError(code) {
  const errors = {
    'auth/user-not-found':        'No account found with this email address.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/invalid-credential':    'Invalid email or password. Please check and try again.',
    'auth/email-already-in-use':  'An account with this email already exists. Try signing in.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/weak-password':         'Password must be at least 6 characters long.',
    'auth/network-request-failed':'Network error. Please check your internet connection.',
    'auth/too-many-requests':     'Too many failed attempts. Please wait a few minutes.',
    'auth/popup-closed-by-user':  'Google sign-in was cancelled. Please try again.',
    'auth/popup-blocked':         'Popup was blocked. Please allow popups for this site.',
    'auth/invalid-api-key':       'Firebase is not configured yet! Please add your API key to firebase-config.js.',
    'auth/internal-error':        'Firebase configuration error. Did you update firebase-config.js?',
  };
  return errors[code] || `Error: ${code}. Please make sure Firebase is configured.`;
}

// ── UI Helpers ────────────────────────────────────────────────
function showMsg(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  const icon = type === 'error'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  el.innerHTML = `${icon} ${msg}`;
  el.style.display = 'flex';
}
function hideAllAlerts() {
  ['loginError','loginSuccess','signupError','signupSuccess'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function setButtonLoading(btnId, loading, defaultHTML) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = `<div class="btn-spinner"></div> Please wait...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = defaultHTML;
  }
}

// ── Save user profile to Firestore ───────────────────────────
async function saveUserToFirestore(user, extra = {}) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    // Only create doc if it doesn't exist (don't overwrite on re-login)
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid:         user.uid,
        email:       user.email,
        displayName: user.displayName || extra.fullName || '',
        photoURL:    user.photoURL || '',
        plan:        extra.plan || 'free',
        careerGoals: extra.careerGoals || '',
        howFound:    extra.howFound || '',
        createdAt:   serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Update last login time
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore write skipped (rules or config):', err.message);
  }
}

// ── LOGIN ─────────────────────────────────────────────────────
window.handleLogin = async function(e) {
  e.preventDefault();
  hideAllAlerts();

  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) return;

  const defaultHTML = `<span class="btn-text">Sign In</span><svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
  setButtonLoading('loginBtn', true, defaultHTML);

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(cred.user);
    showMsg('loginSuccess', 'Signed in successfully! Redirecting...', 'success');
    const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
    setTimeout(() => { window.location.href = redirect; }, 1200);
  } catch (err) {
    setButtonLoading('loginBtn', false, defaultHTML);
    showMsg('loginError', getFirebaseError(err.code));
  }
};

// ── SIGNUP ────────────────────────────────────────────────────
window.handleSignup = async function(e) {
  e.preventDefault();
  hideAllAlerts();

  const fullName        = document.getElementById('signupName')?.value.trim();
  const email           = document.getElementById('signupEmail')?.value.trim();
  const confirmEmail    = document.getElementById('signupConfirmEmail')?.value.trim();
  const password        = document.getElementById('signupPassword')?.value;
  const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
  const careerGoals     = document.getElementById('careerGoals')?.value || '';
  const howFound        = document.getElementById('howFound')?.value || '';
  const agreeTerms      = document.getElementById('agreeTerms')?.checked;
  const plan            = new URLSearchParams(window.location.search).get('plan') || 'free';

  // Client-side validation
  if (!fullName)                  return showMsg('signupError', 'Please enter your full name.');
  if (email !== confirmEmail)     return showMsg('signupError', 'Email addresses do not match.');
  if (password.length < 6)        return showMsg('signupError', 'Password must be at least 6 characters long.');
  if (password !== confirmPassword) return showMsg('signupError', 'Passwords do not match.');
  if (!agreeTerms)                return showMsg('signupError', 'Please agree to the Terms of Service to continue.');

  const defaultHTML = `<span class="btn-text">Create My Account</span><svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
  setButtonLoading('signupBtn', true, defaultHTML);

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name in Firebase Auth
    await updateProfile(cred.user, { displayName: fullName });

    // Save full profile to Firestore
    await saveUserToFirestore(cred.user, { fullName, plan, careerGoals, howFound });

    showMsg('signupSuccess', 'Account created! Redirecting to next step...', 'success');

    // Log affiliate conversion if a referral code was captured
    await logAffiliateConversion(cred.user.uid, plan).catch(() => {});

    // Route: free plan → homepage, paid plan → checkout with plan param
    setTimeout(() => {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect');
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        window.location.href = plan === 'free' ? 'index.html' : `checkout.html?plan=${plan}`;
      }
    }, 1500);

  } catch (err) {
    setButtonLoading('signupBtn', false, defaultHTML);
    showMsg('signupError', getFirebaseError(err.code));
  }
};

// ── GOOGLE SIGN IN ────────────────────────────────────────────
window.signInWithGoogle = async function() {
  hideAllAlerts();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(result.user);
    const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
    window.location.href = redirect;
  } catch (err) {
    const errId = document.getElementById('loginError') ? 'loginError' : 'signupError';
    showMsg(errId, getFirebaseError(err.code));
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────
window.handleForgotPassword = async function(e) {
  e.preventDefault();
  hideAllAlerts();
  const email = document.getElementById('loginEmail')?.value.trim();
  if (!email) return showMsg('loginError', 'Please enter your email address first, then click Forgot Password.');
  try {
    await sendPasswordResetEmail(auth, email);
    showMsg('loginSuccess', 'Password reset email sent! Please check your inbox.', 'success');
  } catch (err) {
    showMsg('loginError', getFirebaseError(err.code));
  }
};

// ── LOGOUT ────────────────────────────────────────────────────
window.handleLogout = async function() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
};

// ── AUTH STATE OBSERVER (navbar updates on all pages) ─────────
onAuthStateChanged(auth, (user) => {
  window.currentUser = user;
  updateNavbarForUser(user);
});

function updateNavbarForUser(user) {
  const navActions       = document.querySelector('.nav-actions');
  const mobileNavActions = document.querySelector('.mobile-nav-actions');
  if (!navActions) return;

  if (user) {
    const name     = user.displayName || user.email.split('@')[0];
    const initials = name.slice(0, 2).toUpperCase();

    navActions.innerHTML = `
      <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--blue),var(--navy));border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;font-family:var(--font-display);flex-shrink:0;">${initials}</div>
        <span style="font-size:14px;font-weight:600;color:var(--navy);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
      </a>
      <button onclick="handleLogout()" class="btn btn-secondary" style="padding:8px 16px;font-size:14px;">Logout</button>
    `;

    if (mobileNavActions) {
      mobileNavActions.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 0;margin-bottom:12px;border-bottom:1px solid var(--border);">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,var(--blue),var(--navy));border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">${initials}</div>
          <div>
            <div style="font-weight:600;color:var(--navy);font-size:15px;">${name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${user.email}</div>
          </div>
        </div>
        <button onclick="handleLogout()" class="btn btn-secondary" style="width:100%;">Logout</button>
      `;
    }
  }
  // If not logged in, nav keeps its default HTML (Sign In + Start Learning)
}

// ── Password toggle helper (shared across pages) ──────────────
window.togglePass = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.style.opacity = input.type === 'text' ? '1' : '0.5';
};

// ── CHECKOUT REGISTRATION ─────────────────────────────────────
window.handleCheckoutRegistration = async function(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, { displayName: name });
    
    // Save to Firestore
    await saveUserToFirestore(user, { fullName: name, plan: 'pending_checkout' });
    
    return user;
  } catch (err) {
    throw new Error(getFirebaseError(err.code));
  }
};
