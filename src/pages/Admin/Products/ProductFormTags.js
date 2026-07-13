export function setupProductTags(container, context) {
  const tagInput = container.querySelector('#pf-tag-input');
  const tagsDropdown = container.querySelector('#pf-tags-dropdown');
  const tagsList = container.querySelector('#pf-tags-list');

  if (!tagInput || !tagsDropdown || !tagsList) return;

  // Initialize selectedTags array in context if not exist
  if (!context.selectedTags) {
    context.selectedTags = [];
    if (context.product && Array.isArray(context.product.tags)) {
      context.selectedTags = context.product.tags.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug
      }));
    }
  }

  let activeIdx = -1;
  let currentSuggestions = [];
  let debounceTimeout = null;
  let isLoading = false;

  // Render tag chips
  function renderTags() {
    tagsList.innerHTML = '';
    
    if (context.selectedTags.length === 0) {
      tagsList.innerHTML = '<span class="text-xs text-gray-400 select-none py-1">Chưa gắn nhãn nào</span>';
      return;
    }

    context.selectedTags.forEach((tag, idx) => {
      const chip = document.createElement('div');
      chip.className = 'pf-tag-chip flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-[#C9A84C] border border-amber-200/50 dark:border-amber-900/30 rounded-xl text-xs font-bold cursor-grab active:cursor-grabbing hover:scale-105 transition transform select-none';
      chip.setAttribute('draggable', 'true');
      chip.setAttribute('data-index', idx);
      chip.innerHTML = `
        <span>🏷 ${escapeHtml(tag.name)}</span>
        <span class="pf-tag-remove hover:text-red-500 cursor-pointer font-bold text-xs" title="Gỡ nhãn">&times;</span>
      `;

      // Remove listener
      chip.querySelector('.pf-tag-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        context.selectedTags.splice(idx, 1);
        renderTags();
        context.onDraftChange?.();
      });

      // HTML5 Drag and Drop reordering
      chip.addEventListener('dragstart', handleDragStart);
      chip.addEventListener('dragover', handleDragOver);
      chip.addEventListener('drop', handleDrop);
      chip.addEventListener('dragend', handleDragEnd);

      tagsList.appendChild(chip);
    });
  }

  // Drag and Drop helpers
  let dragSrcEl = null;

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('opacity-50');
  }

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDrop(e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
      const srcIdx = parseInt(dragSrcEl.getAttribute('data-index'), 10);
      const targetIdx = parseInt(this.getAttribute('data-index'), 10);
      
      const temp = context.selectedTags[srcIdx];
      context.selectedTags.splice(srcIdx, 1);
      context.selectedTags.splice(targetIdx, 0, temp);
      
      renderTags();
      context.onDraftChange?.();
    }
    return false;
  }

  function handleDragEnd() {
    const chips = tagsList.querySelectorAll('.pf-tag-chip');
    chips.forEach(c => c.classList.remove('opacity-50'));
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Display suggestions
  function renderSuggestions() {
    tagsDropdown.innerHTML = '';
    const query = tagInput.value.trim();

    if (isLoading) {
      tagsDropdown.innerHTML = `
        <div class="px-4 py-3 text-xs text-gray-400 font-semibold text-center flex items-center justify-center gap-2 bg-white dark:bg-[#161c32]">
          <div class="animate-spin w-3 h-3 border border-gray-300 border-t-[#C9A84C] rounded-full"></div>
          Đang tìm kiếm...
        </div>
      `;
      tagsDropdown.classList.remove('hidden');
      return;
    }

    // Filter out suggestions that are already selected
    const unselected = currentSuggestions.filter(s => 
      !context.selectedTags.some(t => t.name.toLowerCase() === s.name.toLowerCase())
    );

    if (unselected.length === 0 && query !== '') {
      tagsDropdown.innerHTML = `
        <div class="pf-tag-opt-create px-4 py-3 text-xs text-[#C9A84C] hover:bg-gray-100 dark:hover:bg-[#1e2945] cursor-pointer font-black text-center bg-white dark:bg-[#161c32] transition" data-name="${escapeHtml(query)}">
          ➕ Nhấn Enter để tạo nhãn mới: "${escapeHtml(query)}"
        </div>
      `;
      tagsDropdown.classList.remove('hidden');
      
      tagsDropdown.querySelector('.pf-tag-opt-create').addEventListener('click', () => {
        addTag(query);
      });
      return;
    }

    if (unselected.length === 0) {
      tagsDropdown.classList.add('hidden');
      return;
    }

    unselected.forEach((s, index) => {
      const opt = document.createElement('div');
      opt.className = `pf-tag-opt px-4 py-2.5 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors flex justify-between items-center bg-white dark:bg-[#161c32] ${index === activeIdx ? 'bg-gray-100 dark:bg-[#1e2945]' : 'hover:bg-gray-50 dark:hover:bg-[#12182b]'}`;
      opt.setAttribute('data-name', s.name);
      opt.innerHTML = `
        <span>🏷 ${escapeHtml(s.name)}</span>
        <span class="text-[10px] text-gray-400 font-semibold">(${s.products_count ?? 0} sản phẩm)</span>
      `;

      opt.addEventListener('click', () => {
        addTag(s.name);
      });

      tagsDropdown.appendChild(opt);
    });

    tagsDropdown.classList.remove('hidden');
  }

  // Add tag helper
  function addTag(name) {
    name = name.trim();
    if (name === '' || name.length > 50) return;

    // Check case-insensitive duplicate
    const isDup = context.selectedTags.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (!isDup) {
      context.selectedTags.push({ name });
      renderTags();
      context.onDraftChange?.();
    }

    tagInput.value = '';
    tagsDropdown.classList.add('hidden');
    activeIdx = -1;
  }

  // Fetch suggestions with debounce
  async function performSearch() {
    const query = tagInput.value.trim();
    if (query === '') {
      currentSuggestions = [];
      isLoading = false;
      renderSuggestions();
      return;
    }

    isLoading = true;
    renderSuggestions();

    try {
      const headers = {};
      const token = localStorage.getItem('sly_auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/backend/public/api/admin/tags?search=${encodeURIComponent(query)}&limit=10`, { headers });
      const data = await res.json();
      currentSuggestions = (data && data.success && Array.isArray(data.data)) ? data.data : [];
    } catch (e) {
      console.error('Failed to search tags:', e);
      currentSuggestions = [];
    } finally {
      isLoading = false;
      renderSuggestions();
    }
  }

  // Debounced input search
  tagInput.addEventListener('input', () => {
    activeIdx = -1;
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(performSearch, 250);
  });

  // Delimiters paste splitting
  tagInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const items = text.split(/[,;\n\r]+/);
    
    items.forEach(item => {
      const name = item.trim();
      if (name && name.length <= 50) {
        addTag(name);
      }
    });
  });

  // Keyboard navigation & controls
  tagInput.addEventListener('keydown', (e) => {
    const query = tagInput.value.trim();
    const dropdownVisible = !tagsDropdown.classList.contains('hidden');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!dropdownVisible) return;
      const opts = tagsDropdown.querySelectorAll('.pf-tag-opt');
      if (opts.length > 0) {
        activeIdx = (activeIdx + 1) % opts.length;
        renderSuggestions();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!dropdownVisible) return;
      const opts = tagsDropdown.querySelectorAll('.pf-tag-opt');
      if (opts.length > 0) {
        activeIdx = (activeIdx - 1 + opts.length) % opts.length;
        renderSuggestions();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault(); // ALWAYS prevent product form submission
      
      const opts = tagsDropdown.querySelectorAll('.pf-tag-opt');
      if (activeIdx >= 0 && activeIdx < opts.length && dropdownVisible) {
        const name = opts[activeIdx].getAttribute('data-name');
        addTag(name);
      } else if (query !== '') {
        addTag(query);
      }
    } else if (e.key === 'Escape') {
      tagsDropdown.classList.add('hidden');
      activeIdx = -1;
    } else if (e.key === 'Backspace' && tagInput.value === '') {
      if (context.selectedTags.length > 0) {
        context.selectedTags.pop();
        renderTags();
        context.onDraftChange?.();
      }
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (e.target !== tagInput && !tagsDropdown.contains(e.target)) {
      tagsDropdown.classList.add('hidden');
      activeIdx = -1;
    }
  });

  // Initial draw
  renderTags();
}
