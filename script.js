document.addEventListener('DOMContentLoaded', () => {
  
  const menuToggle = document.getElementById('menu-toggle');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  
  let isOpen = false;

  function toggleMenu(forceClose = false) { 
    if (forceClose) {
      isOpen = false;
    } else {
      isOpen = !isOpen;
    }

    if (isOpen) {
      menuToggle.classList.add('active');
      mobileOverlay.classList.add('active');
      mobileDrawer.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      menuToggle.classList.remove('active');
      mobileOverlay.classList.remove('active');
      mobileDrawer.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (menuToggle && mobileOverlay && mobileDrawer) {
    menuToggle.addEventListener('click', () => toggleMenu());
    mobileOverlay.addEventListener('click', () => toggleMenu(true));
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });
  }

  // Testimonial Carousel Logic (Infinite Smooth Scroll)
  const track = document.getElementById('testimonial-track');
  const btnPrev = document.getElementById('t-prev');
  const btnNext = document.getElementById('t-next');
  
  if (track && btnPrev && btnNext) {
    let cards = Array.from(track.children);
    let currentIndex = 0;
    
    // Clone first few items for infinite loop effect
    const maxClones = 3; 
    for(let i = 0; i < maxClones; i++) {
      if(cards[i]) {
        let clone = cards[i].cloneNode(true);
        clone.classList.add('clone');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      }
    }
    
    let allCards = Array.from(track.children);
    let isTransitioning = false;

    function updateCarousel(smooth = true) {
      if(allCards.length === 0) return;
      
      const cardWidth = allCards[0].getBoundingClientRect().width;
      const gap = 24; 
      const offset = (cardWidth + gap) * currentIndex;
      
      if(smooth) {
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        track.style.transition = 'none';
      }
      
      track.style.transform = `translateX(-${offset}px)`;
    }

    btnNext.addEventListener('click', () => {
      if(isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      updateCarousel(true);
    });

    btnPrev.addEventListener('click', () => {
      if(isTransitioning) return;
      
      if (currentIndex === 0) {
        // Jump to the cloned end instantly
        isTransitioning = true;
        currentIndex = cards.length;
        updateCarousel(false);
        
        // Force reflow
        track.offsetHeight;
        
        // Now slide left
        currentIndex--;
        updateCarousel(true);
      } else {
        isTransitioning = true;
        currentIndex--;
        updateCarousel(true);
      }
    });

    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      // If we reached the cloned section (past the original cards)
      if (currentIndex >= cards.length) {
        // Silently snap back to the beginning
        currentIndex = 0;
        updateCarousel(false);
      }
    });
    
    window.addEventListener('resize', () => {
      updateCarousel(false);
    });
  }

  // Password Visibility Toggle
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else {
        input.type = 'password';
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  });

  // ─── GLOBAL JSS REDIRECT ────────────────────────────────────────────────────
  // login.html links are handled by each page — no interception here.
  // goToStep2 (plan card buttons) redirect to JSS — see below.
  // ─── END GLOBAL JSS REDIRECT ────────────────────────────────────────────────
});

// ─── JSS Membership URL ─────────────────────────────────────────────────────
const JSS_MEMBERSHIP_URL = 'https://www.jobskillshare.org/?ref=shizaahsan2006-gmail-com#/membership';

// When user picks a plan card inside the modal → redirect to JSS
function goToStep2(planName, planPrice) {
  window.open(JSS_MEMBERSHIP_URL, '_blank');
}

// goToStep1 / closePricingModal — used by modals that still render locally
function goToStep1() {
  const s1 = document.getElementById('step-1-view');
  const s2 = document.getElementById('step-2-view');
  if (s1) s1.style.display = '';
  if (s2) s2.style.display = 'none';
}

function closePricingModal() {
  const modal = document.getElementById('pricingModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => goToStep1(), 300);
}

// openPricingModal — opens the local popup (defined per-page).
// This global version is a fallback for pages without their own modal HTML.
function openPricingModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('pricingModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    goToStep1();
  } else {
    // No local modal — go straight to JSS
    window.open(JSS_MEMBERSHIP_URL, '_blank');
  }
}
// ─── END JSS REDIRECT ───────────────────────────────────────────────────────

// ─── GLOBAL LOGIN LINK INTERCEPTOR (failsafe) ───────────────────────────────
// Catches any <a href="login.html"> that wasn't individually updated.
document.addEventListener('click', function(e) {
  const anchor = e.target.closest('a[href="login.html"]');
  if (anchor) {
    e.preventDefault();
    window.open(JSS_MEMBERSHIP_URL, '_blank', 'noopener,noreferrer');
  }
}, true);
// ─── END GLOBAL INTERCEPTOR ─────────────────────────────────────────────────
