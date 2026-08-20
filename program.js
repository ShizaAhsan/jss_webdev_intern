// Program catalogue interactive handlers

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');
  const searchInput = document.querySelector('.search-box input');
  const countBadge = document.querySelector('.count-badge');
  
  let currentFilter = 'all';
  let searchQuery = '';

  function updateDisplay() {
    let visibleCount = 0;
    
    courseCards.forEach(card => {
      // Check if it matches text search
      const text = card.textContent.toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());
      
      // Check if it matches category filter
      const isFree = card.querySelector('.free-tag') !== null;
      const matchesFilter = currentFilter === 'all' || (currentFilter === 'free' && isFree);
      
      if (matchesSearch && matchesFilter) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Update badge text
    if (countBadge) {
      countBadge.textContent = `${visibleCount} approved Course${visibleCount !== 1 ? 's' : ''}`;
    }
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.textContent.toLowerCase().includes('free') ? 'free' : 'all';
      updateDisplay();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      updateDisplay();
    });
  }
});
