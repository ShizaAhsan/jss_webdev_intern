// ── Checkout Page Logic ──────────────────────────────────────────────
// Handles plan loading from URL params, auth state, and the payment flow.

import { requireAuth, upgradeMembership, logAffiliateConversion, getAffiliateRef, PLANS } from './backend.js';

let currentUser = null;

// ── Load plan from URL ──────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const planKey   = urlParams.get('plan') || 'monthly';
const plan      = PLANS[planKey] || PLANS.monthly;

// Populate plan details
document.getElementById('plan-name').textContent     = plan.name;
document.getElementById('plan-price').textContent    = plan.price;
document.getElementById('plan-period').textContent   = plan.period;
document.getElementById('summary-name').textContent  = plan.name;
document.getElementById('summary-price').textContent = plan.price;
document.getElementById('summary-total').textContent = plan.price;

const checkmark = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
document.getElementById('plan-features').innerHTML = plan.features
  .map(f => `<li>${checkmark} ${f}</li>`)
  .join('');

// Update login hrefs to include plan param so they redirect back
document.getElementById('loginBtn').href  = `login.html?redirect=checkout.html%3Fplan%3D${planKey}`;
document.getElementById('signupBtn').href = `login.html?redirect=checkout.html%3Fplan%3D${planKey}`;

// ── Show affiliate banner if ref exists ──────────────────────────────
const ref = getAffiliateRef();
if (ref) {
  document.getElementById('affiliate-banner').style.display = 'flex';
  document.getElementById('affiliate-discount').style.display = 'flex';
}

// ── Firebase Auth State ──────────────────────────────────────────────
requireAuth(
  (user) => {
    // User IS logged in
    currentUser = user;
    document.getElementById('authNotice').style.display = 'none';

    const userInfoEl = document.getElementById('user-info');
    userInfoEl.style.display = 'flex';

    const name = user.displayName || user.email.split('@')[0];
    const initials = name.slice(0, 2).toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-name').textContent   = name;
    document.getElementById('user-email').textContent  = user.email;

    const navUser = document.getElementById('nav-user');
    if (navUser) navUser.textContent = `Signed in as ${name}`;
  },
  () => {
    // User is NOT logged in
    currentUser = null;
    document.getElementById('authNotice').style.display = 'block';
    document.getElementById('user-info').style.display  = 'none';
  }
);

// ── Handle Get Access button ─────────────────────────────────────────
window.handleGetAccess = async function() {
  if (!currentUser) {
    document.getElementById('authNotice').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('authNotice').style.animation = 'pulse 0.4s ease';
    return;
  }

  const btn = document.getElementById('getAccessBtn');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Processing...`;

  try {
    // Simulate a 1.5s payment processing delay.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = await upgradeMembership(currentUser.uid, planKey);

    if (success) {
      await logAffiliateConversion(currentUser.uid, planKey);

      btn.style.display = 'none';
      document.getElementById('successState').style.display = 'block';

      // Auto-redirect to course page after 3 seconds
      setTimeout(() => { window.location.href = 'course-details.html'; }, 3000);
    } else {
      throw new Error('Membership upgrade failed. Please try again.');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Get Access Now`;
    alert(err.message || 'Something went wrong. Please try again.');
  }
};
