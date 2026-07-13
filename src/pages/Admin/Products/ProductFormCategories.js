// ProductFormCategories.js — WordPress-style inline category checkbox tree selection
import { getCategories, createCategory, createSubCategory } from '../../../services/adminService.js';
import { showToast } from '../shared/ui.js';

export function setupProductCategories(overlay, context) {
  let categories = [];
  let searchTimeout = null;

  // Select DOM Elements
  const treeContainer = overlay.querySelector('#pf-category-tree-container');
  const searchInput = overlay.querySelector('#pf-category-search');
  const searchClear = overlay.querySelector('#pf-category-search-clear');
  const subcategoryIdInput = overlay.querySelector('#pf-subcategory-id-input');
  const selectedText = overlay.querySelector('#pf-category-selected-text');
  const clearAllBtn = overlay.querySelector('#pf-category-clear-all');

  const addCatToggle = overlay.querySelector('#pf-add-category-toggle');
  const addCatContainer = overlay.querySelector('#pf-add-category-inline-container');
  const newCatNameInput = overlay.querySelector('#pf-new-cat-name');
  const newCatParentSelect = overlay.querySelector('#pf-new-cat-parent');
  const newCatCancelBtn = overlay.querySelector('#pf-new-cat-cancel');
  const newCatSubmitBtn = overlay.querySelector('#pf-new-cat-submit');

  // Initialize selectedCategoryIds in context if not exist
  if (!context.selectedCategoryIds) {
    if (context.product) {
      if (context.product.category_ids && Array.isArray(context.product.category_ids)) {
        context.selectedCategoryIds = context.product.category_ids.map(Number);
      } else if (context.product.category_id) {
        context.selectedCategoryIds = [Number(context.product.category_id)];
      } else {
        context.selectedCategoryIds = [];
      }
    } else {
      context.selectedCategoryIds = [1]; // Default category ID for new products
    }
  }

  // Initialize subcategory_id in context
  if (context.subcategory_id === undefined) {
    context.subcategory_id = context.product?.subcategory_id ? Number(context.product.subcategory_id) : null;
  }

  // Load and Render category tree
  async function loadCategoryTree() {
    try {
      treeContainer.innerHTML = '<div class="text-center text-gray-400 text-xs py-4">Đang tải danh mục...</div>';
      const res = await getCategories({ tree: true });
      categories = res.data || res || [];
      renderTree();
      populateParentDropdown();
      updateSelectedSummary();
    } catch (e) {
      treeContainer.innerHTML = `<div class="text-center text-red-500 text-xs py-4">Lỗi: ${e.message}</div>`;
    }
  }

  // Render tree structure with indentation and list lines
  function renderTree(query = '') {
    treeContainer.innerHTML = '';
    const filteredQuery = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const ul = document.createElement('ul');
    ul.className = 'space-y-2.5';

    categories.forEach(cat => {
      // Exclude All category (ID 16) from rendering if desired, or render it. Usually "All products" is implicit or rendered.
      // Let's render it as a disabled/always-selected item if it is category 16, or just regular parent.
      const isAllCat = Number(cat.id) === 1;
      if (isAllCat) {
        // Automatically ensure All Category ID is always in selectedCategoryIds
        if (!context.selectedCategoryIds.includes(1)) {
          context.selectedCategoryIds.push(1);
        }
      }

      // Check if parent or any of children matches search
      const parentMatch = cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(filteredQuery);
      const matchedChildren = (cat.children || []).filter(child =>
        child.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(filteredQuery)
      );

      // If search query is provided and neither parent nor children match, hide it
      if (filteredQuery && !parentMatch && matchedChildren.length === 0) {
        return;
      }

      const li = document.createElement('li');
      li.className = 'space-y-1.5';

      const row = document.createElement('label');
      row.className = 'flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-800/40 p-1.5 rounded-lg transition-colors cursor-pointer w-full select-none';

      const isChecked = context.selectedCategoryIds.includes(Number(cat.id));
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = cat.id;
      checkbox.className = 'pf-cat-checkbox w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-0 accent-emerald-500 cursor-pointer mt-0.5';
      checkbox.checked = isChecked;

      if (isAllCat) {
        checkbox.disabled = true; // All Products category cannot be unchecked
      }

      checkbox.addEventListener('change', (e) => {
        handleCategoryCheckboxChange(Number(cat.id), e.target.checked, checkbox);
      });

      const labelSpan = document.createElement('span');
      labelSpan.className = 'text-xs text-gray-800 dark:text-gray-200 font-bold';
      labelSpan.textContent = cat.name;

      row.appendChild(checkbox);
      row.appendChild(labelSpan);
      li.appendChild(row);

      // Children (Subcategories)
      const childrenToRender = filteredQuery ? matchedChildren : (cat.children || []);
      if (childrenToRender.length > 0) {
        const childUl = document.createElement('ul');
        childUl.className = 'pl-6 space-y-1.5 border-l border-gray-200 dark:border-gray-700 ml-3.5 mt-1';

        childrenToRender.forEach(child => {
          const childLi = document.createElement('li');
          const childRow = document.createElement('label');
          childRow.className = 'flex items-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-800/40 p-1.5 rounded-lg transition-colors cursor-pointer w-full select-none';

          const isSubChecked = context.subcategory_id === Number(child.id);
          const childCheckbox = document.createElement('input');
          childCheckbox.type = 'checkbox';
          childCheckbox.value = child.id;
          childCheckbox.className = 'pf-subcat-checkbox w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-[#C9A84C] focus:ring-0 accent-[#C9A84C] cursor-pointer mt-0.5';
          childCheckbox.checked = isSubChecked;

          childCheckbox.addEventListener('change', (e) => {
            handleSubcategoryCheckboxChange(Number(child.id), Number(cat.id), e.target.checked, childCheckbox);
          });

          const childLabel = document.createElement('span');
          childLabel.className = 'text-xs text-gray-600 dark:text-gray-300';
          childLabel.textContent = child.name;

          childRow.appendChild(childCheckbox);
          childRow.appendChild(childLabel);
          childLi.appendChild(childRow);
          childUl.appendChild(childLi);
        });

        li.appendChild(childUl);
      }

      ul.appendChild(li);
    });

    if (ul.children.length === 0) {
      treeContainer.innerHTML = '<div class="text-center text-gray-400 text-xs py-6">Không tìm thấy danh mục nào.</div>';
    } else {
      treeContainer.appendChild(ul);
    }
  }

  // Handle Parent Category checkbox change
  function handleCategoryCheckboxChange(catId, isChecked, checkboxEl) {
    if (isChecked) {
      // Check total checked items limit
      const currentTotalChecked = context.selectedCategoryIds.filter(id => id !== 1).length + (context.subcategory_id ? 1 : 0);
      if (currentTotalChecked >= 3) {
        showToast('Bạn chỉ có thể chọn tối đa 3 danh mục.', 'warning');
        checkboxEl.checked = false;
        return;
      }
      if (!context.selectedCategoryIds.includes(catId)) {
        context.selectedCategoryIds.push(catId);
      }
    } else {
      context.selectedCategoryIds = context.selectedCategoryIds.filter(id => id !== catId);
      // If we unchecked a category, and the currently checked subcategory belongs to it, we should clear it
      const parentCat = categories.find(c => c.id === catId);
      if (parentCat && parentCat.children) {
        const subIds = parentCat.children.map(c => Number(c.id));
        if (context.subcategory_id && subIds.includes(context.subcategory_id)) {
          context.subcategory_id = null;
          subcategoryIdInput.value = '';
          // Render tree again to sync subcategory checkbox unchecked state
          renderTree(searchInput.value);
        }
      }
    }
    updateSelectedSummary();
    context.onDraftChange?.();
  }

  // Handle Subcategory checkbox change (Single-choice/Mutually exclusive for subcategories)
  function handleSubcategoryCheckboxChange(subId, parentCatId, isChecked, checkboxEl) {
    if (isChecked) {
      // Check total checked items limit
      const currentTotalChecked = context.selectedCategoryIds.filter(id => id !== 1).length + (context.subcategory_id ? 1 : 0);
      if (currentTotalChecked >= 3) {
        showToast('Bạn chỉ có thể chọn tối đa 3 danh mục.', 'warning');
        checkboxEl.checked = false;
        return;
      }
      
      // Update subcategory selection (Mutually exclusive)
      context.subcategory_id = subId;
      subcategoryIdInput.value = subId;

      // Automatically add parent category to selectedCategoryIds if it is not selected
      if (!context.selectedCategoryIds.includes(parentCatId)) {
        // Check if adding parent category exceeds limit
        const postAddChecked = context.selectedCategoryIds.filter(id => id !== 1).length + 1; // +1 for the new parent, +1 for subcategory
        if (postAddChecked > 3) {
          // If adding both parent and subcategory exceeds 3 limit, just select the subcategory, 
          // and parent category will be synced on save automatically (or we show a warning)
        } else {
          context.selectedCategoryIds.push(parentCatId);
        }
      }

      // Re-render tree to clear other checked subcategories visually
      renderTree(searchInput.value);
    } else {
      if (context.subcategory_id === subId) {
        context.subcategory_id = null;
        subcategoryIdInput.value = '';
      }
    }
    updateSelectedSummary();
    context.onDraftChange?.();
  }

  // Update selected categories summary indicators
  function updateSelectedSummary() {
    const selectedNames = [];
    
    // Parent Categories (excluding All Products ID 1)
    context.selectedCategoryIds.forEach(id => {
      if (id === 1) return;
      const cat = categories.find(c => c.id === id);
      if (cat) selectedNames.push(cat.name);
    });

    // Subcategory
    if (context.subcategory_id) {
      let foundSub = null;
      for (const cat of categories) {
        const sub = (cat.children || []).find(c => c.id === context.subcategory_id);
        if (sub) {
          foundSub = sub;
          break;
        }
      }
      if (foundSub) selectedNames.push(foundSub.name);
    }

    if (selectedNames.length > 0) {
      selectedText.innerHTML = `Đã chọn: <span class="text-[#C9A84C] font-extrabold">${selectedNames.join(', ')}</span>`;
      clearAllBtn.classList.remove('hidden');
    } else {
      selectedText.textContent = 'Đã chọn: Chưa chọn';
      clearAllBtn.classList.add('hidden');
    }
  }

  // Clear all selections
  clearAllBtn.addEventListener('click', () => {
    context.selectedCategoryIds = [1]; // Keep default All category
    context.subcategory_id = null;
    subcategoryIdInput.value = '';
    
    // Update UI
    updateSelectedSummary();
    renderTree(searchInput.value);
    context.onDraftChange?.();
  });

  // Search input with debounce 250ms
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.trim()) {
      searchClear.classList.remove('hidden');
    } else {
      searchClear.classList.add('hidden');
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderTree(val);
    }, 250);
  });

  // Clear search button
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    renderTree('');
  });

  // Populate Parent category dropdown in new category creation form
  function populateParentDropdown() {
    newCatParentSelect.innerHTML = '<option value="">-- Không có (Danh mục gốc) --</option>';
    categories.forEach(cat => {
      if (Number(cat.id) === 1) return; // Skip All Products
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      newCatParentSelect.appendChild(opt);
    });
  }

  // Toggle inline form
  addCatToggle.addEventListener('click', () => {
    const isHidden = addCatContainer.classList.contains('hidden');
    if (isHidden) {
      addCatContainer.classList.remove('hidden');
      newCatNameInput.value = '';
      newCatNameInput.focus();
      populateParentDropdown();
    } else {
      addCatContainer.classList.add('hidden');
    }
  });

  newCatCancelBtn.addEventListener('click', () => {
    addCatContainer.classList.add('hidden');
  });

  // Submit new category inline
  newCatSubmitBtn.addEventListener('click', async () => {
    const name = newCatNameInput.value.trim();
    if (!name) {
      showToast('Vui lòng nhập tên danh mục', 'warning');
      return;
    }

    const parentId = newCatParentSelect.value;
    newCatSubmitBtn.disabled = true;
    newCatSubmitBtn.textContent = 'Đang thêm...';

    try {
      if (parentId) {
        // Create Subcategory
        const res = await createSubCategory({
          name: name,
          category_id: Number(parentId),
          is_active: 1
        });
        showToast('Đã thêm danh mục con mới thành công!', 'success');
        
        // Auto check the newly created subcategory if limit not exceeded
        const currentTotalChecked = context.selectedCategoryIds.filter(id => id !== 1).length + (context.subcategory_id ? 1 : 0);
        if (currentTotalChecked < 3) {
          const newSubId = Number(res.data?.id || res.id);
          context.subcategory_id = newSubId;
          subcategoryIdInput.value = newSubId;

          // Auto select parent too
          const parentNum = Number(parentId);
          if (!context.selectedCategoryIds.includes(parentNum) && context.selectedCategoryIds.filter(id => id !== 1).length < 2) {
            context.selectedCategoryIds.push(parentNum);
          }
        }
      } else {
        // Create Parent Category
        const res = await createCategory({
          name: name,
          is_active: 1
        });
        showToast('Đã thêm danh mục mới thành công!', 'success');

        // Auto check newly created parent category if limit not exceeded
        const currentTotalChecked = context.selectedCategoryIds.filter(id => id !== 1).length + (context.subcategory_id ? 1 : 0);
        if (currentTotalChecked < 3) {
          const newCatId = Number(res.data?.id || res.id);
          if (!context.selectedCategoryIds.includes(newCatId)) {
            context.selectedCategoryIds.push(newCatId);
          }
        }
      }

      addCatContainer.classList.add('hidden');
      await loadCategoryTree();
      context.onDraftChange?.();
    } catch (err) {
      showToast(err.message || 'Lỗi thêm danh mục', 'error');
    } finally {
      newCatSubmitBtn.disabled = false;
      newCatSubmitBtn.textContent = 'Thêm danh mục';
    }
  });

  // Initial Load
  loadCategoryTree();
}
