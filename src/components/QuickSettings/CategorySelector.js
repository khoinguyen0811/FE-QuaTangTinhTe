import { API_BASE } from '../../services/config.js';

export let categoryTree = [];
let categoryTreePromise = null;

export function loadCategoryTree() {
  if (categoryTree.length > 0) {
    return Promise.resolve(categoryTree);
  }
  if (categoryTreePromise) {
    return categoryTreePromise;
  }
  categoryTreePromise = fetch(`${API_BASE}/api/categories?tree=1`)
    .then(res => res.ok ? res.json() : null)
    .then(json => {
      if (json && json.success && Array.isArray(json.data)) {
        categoryTree = json.data;
      } else {
        categoryTree = [];
      }
      return categoryTree;
    })
    .catch(err => {
      console.warn('Failed to load category tree:', err);
      categoryTree = [];
      return [];
    });
  return categoryTreePromise;
}

export function renderCategorySelector(item, itemIdx, childIdx = null) {
  const isChild = childIdx !== null;
  const catId = item.category_id || null;
  const subcatId = item.subcategory_id || null;

  let displayLabel = 'Chọn liên kết...';
  if (catId) {
    const catIdInt = parseInt(catId, 10);
    const cat = Array.isArray(categoryTree) ? categoryTree.find(c => c && parseInt(c.id, 10) === catIdInt) : null;
    displayLabel = cat ? `[Danh mục] ${cat.name}` : `[Danh mục ID: ${catId}]`;
  } else if (subcatId) {
    const subcatIdInt = parseInt(subcatId, 10);
    let foundSub = null;
    const list = Array.isArray(categoryTree) ? categoryTree : [];
    for (const cat of list) {
      if (!cat) continue;
      const sub = (cat.children || []).find(s => s && parseInt(s.id, 10) === subcatIdInt);
      if (sub) {
        foundSub = sub;
        break;
      }
    }
    displayLabel = foundSub ? `[Sub] ${foundSub.name}` : `[Sub ID: ${subcatId}]`;
  } else if (item && item.href) {
    displayLabel = `[Tùy chỉnh] ${item.href}`;
  }

  const selectorId = isChild ? `selector-${itemIdx}-${childIdx}` : `selector-${itemIdx}`;
  const triggerClass = isChild ? 'quick-child-href' : 'quick-menu-href';

  return `
    <div class="relative category-selector-container w-full animate-fade-in" id="${selectorId}-container">
      <button type="button" class="${triggerClass}-trigger w-full px-2 py-1 border border-gray-350 rounded text-[11px] font-semibold focus:outline-none bg-white text-left flex justify-between items-center select-none cursor-pointer hover:border-zinc-400 transition"
        data-item-index="${itemIdx}"
        ${isChild ? `data-child-index="${childIdx}"` : ''}
        data-category-id="${catId || ''}"
        data-subcategory-id="${subcatId || ''}"
        data-href="${item.href || ''}"
      >
        <span class="truncate pr-2">${displayLabel}</span>
        <span class="text-gray-400 text-[8px] shrink-0 transition-transform duration-200">▼</span>
      </button>
      
      <!-- Dropdown Popover -->
      <div class="category-selector-dropdown absolute left-0 right-0 mt-1 bg-white border border-gray-250 rounded-lg shadow-xl z-[999] p-3 hidden flex flex-col gap-2 w-[280px] sm:w-[320px] max-h-[320px]" style="top: 100%;">
        <input type="text" class="category-search-input w-full px-2 py-1 border border-gray-300 rounded text-[11px] focus:outline-none" placeholder="Tìm kiếm danh mục..." />
        
        <div class="category-tree-container overflow-y-auto max-h-[160px] flex-1 space-y-1 text-left text-[11px] pr-1 border border-zinc-100 rounded p-1 bg-zinc-50/30">
           <!-- Populated dynamically via populateTree -->
        </div>
        
        <div class="flex items-center justify-between border-t border-gray-150 pt-2 gap-2 shrink-0">
           <button type="button" class="custom-link-btn text-[10px] text-zinc-500 hover:text-black font-semibold underline bg-transparent border-0 cursor-pointer select-none">Tự điền link</button>
           <button type="button" class="confirm-selection-btn bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-[10px] px-3 py-1 rounded cursor-pointer select-none">OK</button>
        </div>
      </div>
    </div>
  `;
}

export function populateTree(dropdownEl, searchTerm = '', selectedCatId = null, selectedSubcatId = null) {
  const treeContainer = dropdownEl.querySelector('.category-tree-container');
  if (!treeContainer) return;

  searchTerm = searchTerm.toLowerCase().trim();

  const selCatId = selectedCatId ? parseInt(selectedCatId, 10) : null;
  const selSubcatId = selectedSubcatId ? parseInt(selectedSubcatId, 10) : null;

  let html = '';

  categoryTree.forEach(cat => {
    const catId = parseInt(cat.id, 10);
    const catMatches = cat.name.toLowerCase().includes(searchTerm);
    const matchingChildren = (cat.children || []).filter(sub => sub.name.toLowerCase().includes(searchTerm));
    
    if (searchTerm && !catMatches && matchingChildren.length === 0) {
      return;
    }

    const hasChildren = (cat.children || []).length > 0;
    const isSelected = selCatId === catId;
    const isExpanded = searchTerm ? true : false;

    html += `
      <div class="category-tree-node space-y-1" data-cat-id="${catId}">
        <div class="flex items-center gap-1 hover:bg-zinc-100/60 rounded px-1 py-0.5">
          ${hasChildren ? `
            <button type="button" class="category-expand-btn w-4 h-4 flex items-center justify-center text-[8px] text-zinc-400 hover:text-black rounded bg-transparent border-0 cursor-pointer p-0 select-none transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}">
              ▶
            </button>
          ` : '<div class="w-4"></div>'}
          
          <div class="category-option-item flex-1 py-0.5 px-2 rounded cursor-pointer select-none transition-all border border-transparent font-bold ${isSelected ? 'category-option-selected' : 'text-zinc-800'}" 
               data-type="category" data-id="${catId}" data-name="${cat.name}" data-slug="${cat.slug}">
            ${cat.name}
          </div>
        </div>
        
        ${hasChildren ? `
          <div class="subcategory-list-container pl-5 space-y-0.5 ${isExpanded ? '' : 'hidden'}">
            ${(cat.children || []).map(sub => {
              const subId = parseInt(sub.id, 10);
              const subSelected = selSubcatId === subId;
              return `
                <div class="category-option-item py-0.5 px-2 rounded cursor-pointer select-none transition-all border border-transparent ${subSelected ? 'category-option-selected' : 'text-zinc-600 font-semibold'}"
                     data-type="subcategory" data-id="${subId}" data-name="${sub.name}" data-slug="${sub.slug}">
                  ${sub.name}
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });

  if (!html) {
    html = `<div class="text-center py-4 text-zinc-400">Không tìm thấy danh mục.</div>`;
  }

  treeContainer.innerHTML = html;
}
