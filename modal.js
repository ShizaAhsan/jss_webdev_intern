// ── Pricing Modal Logic ──────────────────────────────────────────────
// Handles opening/closing the membership modal and the step 1 → step 2 flow.
// Included on: index.html, program-details.html, course-details.html

function openPricingModal(e) {
  if(e) e.preventDefault();
  document.getElementById('pricingModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  goToStep1(); // Always start at step 1
}

function closePricingModal() {
  document.getElementById('pricingModal').classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { goToStep1(); }, 300);
}

function goToStep2(planName, planPrice) {
  document.getElementById('step-1-view').style.display = 'none';
  document.getElementById('step-2-view').style.display = 'block';

  document.getElementById('modal-plan-name').innerText = planName;
  document.getElementById('modal-plan-price').innerText = planPrice === 0 ? '$0.00' : '$' + planPrice + '.00';

  const paymentSection = document.getElementById('modal-payment-section');
  const pmtInputs = paymentSection.querySelectorAll('.pmt-input');

  if (planPrice === 0) {
    paymentSection.style.display = 'none';
    pmtInputs.forEach(i => i.removeAttribute('required'));
  } else {
    paymentSection.style.display = 'block';
    pmtInputs.forEach(i => i.setAttribute('required', 'true'));
  }

  // Handle Account Section visibility if user is logged in
  const accountSection = document.getElementById('checkout-account-section');
  const nameInput = document.getElementById('checkout-name');
  const emailInput = document.getElementById('checkout-email');
  const passInput = document.getElementById('checkout-password');

  if (window.currentUser) {
    accountSection.style.display = 'none';
    nameInput.removeAttribute('required');
    emailInput.removeAttribute('required');
    passInput.removeAttribute('required');
  } else {
    accountSection.style.display = 'block';
    nameInput.setAttribute('required', 'true');
    emailInput.setAttribute('required', 'true');
    passInput.setAttribute('required', 'true');
  }
}

function goToStep1() {
  document.getElementById('step-2-view').style.display = 'none';
  document.getElementById('step-1-view').style.display = 'block';
}

async function processCheckout(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('checkout-submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Processing...';

  try {
    if (!window.currentUser) {
      const name = document.getElementById('checkout-name').value;
      const email = document.getElementById('checkout-email').value;
      const password = document.getElementById('checkout-password').value;

      if (window.handleCheckoutRegistration) {
        await window.handleCheckoutRegistration(name, email, password);
      } else {
        console.warn("Auth not linked yet. Simulating success.");
      }
    }

    alert('Checkout Successful! Your account is ready.');
    closePricingModal();

  } catch (error) {
    alert(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Auto-open modal if URL hash is #pricing
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#pricing') {
    openPricingModal(new Event('click'));
  }
});
