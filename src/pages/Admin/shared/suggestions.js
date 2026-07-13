/**
 * Reusable Autocomplete Suggestions Utility for Admin Panel
 */
export function initAutocompleteSuggestions({
  inputEl,
  fetchSuggestions, // async function(query) => Array of items
  renderItem,       // function(item) => HTML string
  onSelect,         // function(item)
  getSearchValue,   // function(item) => string to set in input
}) {
  if (!inputEl) return;

  let dropdown = null;
  let currentItems = [];

  const createDropdown = () => {
    if (dropdown) return dropdown;
    
    // Ensure parent has relative class
    if (inputEl.parentNode) {
      inputEl.parentNode.classList.add('relative');
    }

    dropdown = document.createElement('div');
    dropdown.className = 'absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200/80 shadow-2xl rounded-xl z-50 overflow-hidden transition-all duration-200 opacity-0 pointer-events-none transform -translate-y-1 max-h-80 overflow-y-auto scrollbar-thin';
    inputEl.parentNode.appendChild(dropdown);
    return dropdown;
  };

  const showDropdown = () => {
    if (!dropdown) return;
    dropdown.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-1');
    dropdown.classList.add('opacity-100', 'translate-y-0');
  };

  const hideDropdown = () => {
    if (!dropdown) return;
    dropdown.classList.remove('opacity-100', 'translate-y-0');
    dropdown.classList.add('opacity-0', 'pointer-events-none', '-translate-y-1');
  };

  const renderSuggestions = (items) => {
    const dd = createDropdown();
    currentItems = items;
    if (items.length === 0) {
      dd.innerHTML = `<div class="p-4 text-center text-xs text-gray-400 font-semibold select-none bg-gray-50/50">Không tìm thấy gợi ý phù hợp</div>`;
      showDropdown();
      return;
    }

    dd.innerHTML = items.map((item, idx) => `
      <div class="suggestion-item p-2.5 border-b border-gray-50 hover:bg-amber-50/40 cursor-pointer transition-colors duration-150 flex items-center justify-between gap-3 text-xs" data-idx="${idx}">
        ${renderItem(item)}
      </div>
    `).join('');

    // Attach click listeners
    dd.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', (e) => {
        const idx = parseInt(el.dataset.idx, 10);
        const selectedItem = currentItems[idx];
        inputEl.value = getSearchValue(selectedItem);
        hideDropdown();
        onSelect(selectedItem);
      });
    });

    showDropdown();
  };

  let debounceTimer;
  const handleInput = (e) => {
    const q = e.target.value.trim();
    if (!q) {
      hideDropdown();
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const items = await fetchSuggestions(q);
        renderSuggestions(items);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      }
    }, 300);
  };

  const handleFocus = async () => {
    const q = inputEl.value.trim();
    if (q) {
      try {
        const items = await fetchSuggestions(q);
        renderSuggestions(items);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      }
    }
  };

  inputEl.addEventListener('input', handleInput);
  inputEl.addEventListener('focus', handleFocus);

  // Handle click outside
  const handleOutsideClick = (e) => {
    if (!inputEl.contains(e.target) && (!dropdown || !dropdown.contains(e.target))) {
      hideDropdown();
    }
  };
  document.addEventListener('click', handleOutsideClick);

  // Clean up registration helper
  if (!window.adminCleanups) {
    window.adminCleanups = [];
  }
  window.adminCleanups.push(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
}
