// ══════════════════════════════════════════════════════════════
// JobSkillShare — Backend Logic Module (backend.js)
// Handles: Auth state, affiliate tracking, checkout flow,
//          membership upgrades, and user dashboard data.
// ══════════════════════════════════════════════════════════════

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

// ── AFFILIATE TRACKING ────────────────────────────────────────
// Reads ?ref= from any URL and stores it in sessionStorage
// so it survives navigation and is saved on signup/checkout.
(function trackAffiliate() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    sessionStorage.setItem('jss_affiliate_ref', ref);
    console.log(`[Affiliate] Referral code captured: ${ref}`);
  }
})();

export function getAffiliateRef() {
  return sessionStorage.getItem('jss_affiliate_ref') || null;
}

// ── LOG AFFILIATE CONVERSION ──────────────────────────────────
// Called when a user completes signup. Logs the referral to Firestore.
export async function logAffiliateConversion(userId, plan) {
  const ref = getAffiliateRef();
  if (!ref) return; // No affiliate code, nothing to log

  try {
    await addDoc(collection(db, 'affiliate_conversions'), {
      affiliateRef: ref,
      userId:       userId,
      plan:         plan,
      convertedAt:  serverTimestamp(),
    });
    console.log(`[Affiliate] Conversion logged for ref: ${ref}`);
    sessionStorage.removeItem('jss_affiliate_ref'); // Clean up after logging
  } catch (err) {
    console.warn('[Affiliate] Could not log conversion:', err.message);
  }
}

// ── GET USER MEMBERSHIP DATA ──────────────────────────────────
export async function getUserMembership(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('[Backend] Could not fetch user data:', err.message);
    return null;
  }
}

// ── UPGRADE MEMBERSHIP PLAN ───────────────────────────────────
// Called after a successful payment (or simulated payment in prototype)
export async function upgradeMembership(userId, planName) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      plan:       planName,
      upgradedAt: serverTimestamp(),
    });

    // Log the enrollment event
    await addDoc(collection(db, 'enrollments'), {
      userId:     userId,
      plan:       planName,
      enrolledAt: serverTimestamp(),
    });

    console.log(`[Backend] Membership upgraded to: ${planName}`);
    return true;
  } catch (err) {
    console.warn('[Backend] Could not upgrade membership:', err.message);
    return false;
  }
}

// ── CHECKOUT AUTH GUARD ───────────────────────────────────────
// Checks if user is logged in. If not, redirects to login with a
// redirect parameter so they come back to checkout after logging in.
export function requireAuth(onAuthenticated, onUnauthenticated) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onAuthenticated(user);
    } else {
      if (onUnauthenticated) {
        onUnauthenticated();
      }
    }
  });
}

// ── PLAN DEFINITIONS ──────────────────────────────────────────
// Single source of truth for all plans displayed across the site.
export const PLANS = {
  free: {
    name:     'Free Access',
    price:    '$0.00',
    period:   '3-month access',
    features: [
      'Selected Free Courses',
      'Learning Portal Access',
      'Progress Tracking',
      'Community Forum',
    ]
  },
  monthly: {
    name:     'Premium Monthly',
    price:    '$50.00',
    period:   'per month',
    features: [
      'All Certificate Programs',
      'All Premium Courses',
      'Hands-on Labs & Certificates',
      'AI Career Tools',
    ]
  },
  yearly: {
    name:     'Premium Yearly',
    price:    '$549.00',
    period:   'per year (save 8%)',
    features: [
      'All Certificate Programs',
      'All Premium Courses',
      'Hands-on Labs & Certificates',
      'AI Career Tools',
      'Priority Support',
    ]
  },
  pro: {
    name:     'Pro Mentorship',
    price:    '$99.00',
    period:   'per month',
    features: [
      'Everything in Premium',
      '1-on-1 Mentorship Sessions',
      'Resume Reviews',
      'Mock Interviews',
      'Job Placement Assistance',
    ]
  }
};
