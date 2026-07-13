import { getCategoryProducts, saveCategoryProductsSort } from '../../../services/adminService.js';
import { showToast } from '../shared/ui.js';

// Base-26 lexicographical midpoint calculation
export function getMidpoint(prev, next) {
  if (!prev && !next) return 'm';
  if (!prev) {
    prev = 'a'.repeat(next.length);
  }
  if (!next) {
    next = 'z'.repeat(prev.length + 1);
  }
  if (prev >= next) {
    return prev + 'm';
  }

  const len = Math.max(prev.length, next.length) + 1;
  let prevPad = prev.padEnd(len, 'a');
  let nextPad = next.padEnd(len, 'a');

  let diffIdx = 0;
  while (diffIdx < len && prevPad[diffIdx] === nextPad[diffIdx]) {
    diffIdx++;
  }

  let chunkLen = Math.min(5, len - diffIdx);
  const base = 26;

  const getVal = (padStr) => {
    let val = 0;
    for (let i = 0; i < chunkLen; i++) {
      val = val * base + (padStr.charCodeAt(diffIdx + i) - 97);
    }
    return val;
  };

  let prevVal = getVal(prevPad);
  let nextVal = getVal(nextPad);

  if (nextVal - prevVal <= 1) {
    prevPad += 'a';
    nextPad += 'a';
    chunkLen++;
    prevVal = getVal(prevPad);
    nextVal = getVal(nextPad);
  }

  const midVal = Math.floor((prevVal + nextVal) / 2);

  let midStr = '';
  let val = midVal;
  for (let i = 0; i < chunkLen; i++) {
    const rem = val % base;
    midStr = String.fromCharCode(97 + rem) + midStr;
    val = Math.floor(val / base);
  }

  const prefix = prevPad.substring(0, diffIdx);
  let result = prefix + midStr;
  result = result.replace(/a+$/, '');
  if (!result) result = 'a';

  if (result <= prev || (next && result >= next)) {
    return prev + 'm';
  }
  return result;
}

export function openProductSortModal(category, onSaveSuccess) {
  const isChild = !!category.parent_id;
  const type = isChild ? 'subcategory' : 'category';
  const categoryId = category.id;

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'product-sort-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 transition-opacity duration-300';
  modal.setAttribute('data-lenis-prevent', 'true');
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-2xl w-full flex flex-col max-h-[90vh] transform scale-95 opacity-0 transition-all duration-300" id="sort-modal-card">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-zinc-50/50 rounded-t-xl">
        <div>
          <h3 class="text-base font-bold text-gray-900">Sắp xếp Sản phẩm</h3>
          <p class="text-xs text-gray-500 mt-0.5">Danh mục: <span class="font-semibold text-gray-800">${category.name}</span></p>
        </div>
        <button id="sort-modal-close" class="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Search & Info Bar -->
      <div class="p-4 border-b border-gray-50 bg-white flex items-center gap-3">
        <div class="relative flex-1">
          <input id="sort-search-input" type="text" placeholder="Tìm nhanh sản phẩm..." 
            class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] bg-white text-gray-700" />
          <span class="absolute left-3 top-2.5 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
        <div class="text-xs text-gray-400 whitespace-nowrap bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 font-medium">
          Tổng số: <span id="sort-total-count" class="font-semibold text-gray-700">0</span> sản phẩm
        </div>
      </div>

      <!-- Drag & Drop Instruction -->
      <div class="px-6 py-2 bg-amber-50/40 border-b border-amber-100/50 flex items-center gap-2 text-xs text-amber-800">
        <svg class="text-amber-500 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Kéo thả hoặc dùng mũi tên để sắp xếp. Sản phẩm ở trên cùng sẽ hiển thị trước.
      </div>

      <!-- List Container -->
      <div class="flex-1 overflow-y-auto p-4 bg-zinc-50/30" id="sort-list-container">
        <div class="flex flex-col gap-2" id="sort-product-list">
          <!-- Loading skeleton -->
          ${Array(4).fill(0).map(() => `
            <div class="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <div class="w-8 h-8 rounded-lg skeleton-shimmer bg-zinc-100"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3.5 w-1/2 rounded skeleton-shimmer bg-zinc-100"></div>
                <div class="h-3 w-1/4 rounded skeleton-shimmer bg-zinc-100"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-zinc-50/50 rounded-b-xl">
        <button id="sort-modal-cancel" class="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Hủy bỏ
        </button>
        <button id="sort-modal-save" class="px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e] shadow-sm hover:shadow transition-all flex items-center gap-2">
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger intro animation
  setTimeout(() => {
    modal.querySelector('#sort-modal-card').classList.remove('scale-95', 'opacity-0');
  }, 10);

  let allProducts = [];
  let originalSortKeys = {}; // Keep copy to check which ones modified

  const listEl = modal.querySelector('#sort-product-list');
  const searchInput = modal.querySelector('#sort-search-input');
  const totalCountEl = modal.querySelector('#sort-total-count');

  // Load products from API
  async function loadData() {
    try {
      const res = await getCategoryProducts(categoryId, type);
      allProducts = res.data || [];

      // Sort items: explicitly sorted first (by sort_key), then by creation/default
      allProducts.sort((a, b) => {
        if (!a.sort_key && !b.sort_key) return 0;
        if (!a.sort_key) return 1;
        if (!b.sort_key) return -1;
        return a.sort_key.localeCompare(b.sort_key);
      });

      // Ensure every product has a valid sort key to start with
      let prevKey = '';
      allProducts.forEach(p => {
        if (!p.sort_key) {
          p.sort_key = getMidpoint(prevKey, '');
        }
        prevKey = p.sort_key;
        originalSortKeys[p.id] = p.sort_key;
      });

      totalCountEl.textContent = allProducts.length;
      renderList();
    } catch (err) {
      listEl.innerHTML = `
        <div class="py-12 text-center text-red-500 text-sm">
          Không thể tải danh sách sản phẩm. Lỗi: ${err.message}
        </div>
      `;
    }
  }

  // Render list items
  function renderList() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="py-16 text-center text-gray-400 text-sm bg-white border border-gray-100 rounded-xl">
          Không tìm thấy sản phẩm nào
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    filtered.forEach((product, index) => {
      // Find its position in the full sorted array
      const actualIndex = allProducts.indexOf(product);

      const div = document.createElement('div');
      div.className = 'flex items-center gap-3 p-3 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all cursor-move select-none group shadow-sm hover:shadow-md';
      div.setAttribute('draggable', 'true');
      div.dataset.productId = product.id;
      div.dataset.index = actualIndex;

      const imgUrl = product.image_url || 'https://images.pexels.com/photos/18413243/pexels-photo-18413243.jpeg';
      const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price);

      div.innerHTML = `
        <!-- Drag handle -->
        <div class="text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing p-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>

        <!-- Position Input -->
        <div class="relative">
          <input type="number" min="1" max="${allProducts.length}" value="${actualIndex + 1}" draggable="false"
            class="pos-input w-12 h-8 text-center border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] font-bold text-gray-800 bg-zinc-50 focus:bg-white transition-colors" />
        </div>

        <!-- Thumbnail -->
        <img src="${imgUrl}" alt="${product.name}" class="w-10 h-10 object-cover rounded-lg border border-gray-100 flex-shrink-0" />

        <!-- Product detail -->
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-800 truncate">${product.name}</h4>
          <p class="text-xs text-[#C9A84C] font-semibold mt-0.5">${formattedPrice}</p>
        </div>

        <!-- Sorting buttons (Mobile & Desktop secondary) -->
        <div class="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
          <button class="up-btn p-1.5 hover:bg-zinc-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors" title="Lên">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="down-btn p-1.5 hover:bg-zinc-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors" title="Xuống">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      `;

      // Event handler for typing number position directly
      const posInput = div.querySelector('.pos-input');
      posInput.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
      });
      posInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          posInput.blur();
        }
      });
      posInput.addEventListener('blur', () => {
        let val = parseInt(posInput.value, 10);
        if (isNaN(val) || val < 1) {
          posInput.value = actualIndex + 1;
          return;
        }
        if (val > allProducts.length) {
          val = allProducts.length;
        }
        const toPos = val - 1;
        if (toPos !== actualIndex) {
          moveItem(actualIndex, toPos);
        }
      });

      // Event handlers for arrows
      div.querySelector('.up-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        moveItem(actualIndex, actualIndex - 1);
      });
      div.querySelector('.down-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        moveItem(actualIndex, actualIndex + 1);
      });

      // HTML5 Drag and Drop events
      div.addEventListener('dragstart', (e) => {
        // Prevent drag triggers when clicking inside inputs
        if (e.target.tagName.toLowerCase() === 'input') {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', actualIndex);
        div.classList.add('opacity-40');
      });

      div.addEventListener('dragend', () => {
        div.classList.remove('opacity-40');
      });

      listEl.appendChild(div);
    });
  }

  // Handle Drag Over
  listEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingEl = listEl.querySelector('[draggable="true"].opacity-40');
    if (!draggingEl) return;

    const afterElement = getDragAfterElement(listEl, e.clientY);
    const listChildren = [...listEl.children];
    if (afterElement == null) {
      listEl.appendChild(draggingEl);
    } else {
      listEl.insertBefore(draggingEl, afterElement);
    }
  });

  // Handle Drag Drop
  listEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(fromIndex)) return;

    // Find new position in allProducts
    const draggingEl = listEl.querySelector('[draggable="true"].opacity-40');
    if (!draggingEl) return;

    const listChildren = [...listEl.children];
    const dropIndexInRenderedList = listChildren.indexOf(draggingEl);
    
    // Find target product from rendered list
    const query = searchInput.value.trim().toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    const targetProduct = filtered[dropIndexInRenderedList];
    const toIndex = allProducts.indexOf(targetProduct);

    if (fromIndex !== toIndex) {
      moveItem(fromIndex, toIndex);
    } else {
      renderList();
    }
  });

  // Helper to find drop position
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('[draggable="true"]:not(.opacity-40)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Core move item and calculate new midpoint sort_key
  function moveItem(from, to) {
    if (to < 0 || to >= allProducts.length || from === to) return;

    const item = allProducts[from];
    
    // Remove item from its current position
    allProducts.splice(from, 1);
    
    // Insert at new position
    allProducts.splice(to, 0, item);

    // Calculate new sort_key for the moved item based on its new neighbors
    let prevKey = '';
    let nextKey = '';

    if (to === 0) {
      // Moved to top
      nextKey = allProducts[1].sort_key;
    } else if (to === allProducts.length - 1) {
      // Moved to bottom
      prevKey = allProducts[allProducts.length - 2].sort_key;
    } else {
      // Moved between two items
      prevKey = allProducts[to - 1].sort_key;
      nextKey = allProducts[to + 1].sort_key;
    }

    item.sort_key = getMidpoint(prevKey, nextKey);

    // Sort list again just to ensure everything is sorted properly
    allProducts.sort((a, b) => a.sort_key.localeCompare(b.sort_key));

    renderList();
  }

  // Filter search
  searchInput.addEventListener('input', renderList);

  // Close modal
  function closeModal() {
    const card = modal.querySelector('#sort-modal-card');
    card.classList.add('scale-95', 'opacity-0');
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  modal.querySelector('#sort-modal-close').addEventListener('click', closeModal);
  modal.querySelector('#sort-modal-cancel').addEventListener('click', closeModal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Save changes
  modal.querySelector('#sort-modal-save').addEventListener('click', async () => {
    const saveBtn = modal.querySelector('#sort-modal-save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Đang lưu...
    `;

    // Only send updates that changed from original values
    const sortData = [];
    allProducts.forEach(p => {
      if (p.sort_key !== originalSortKeys[p.id]) {
        sortData.push({
          product_id: p.id,
          sort_key: p.sort_key
        });
      }
    });

    if (sortData.length === 0) {
      showToast('Không có thay đổi nào cần lưu.');
      closeModal();
      return;
    }

    try {
      await saveCategoryProductsSort(categoryId, type, sortData);
      showToast('Đã lưu thứ tự sắp xếp sản phẩm thành công!');
      if (onSaveSuccess) onSaveSuccess();
      closeModal();
    } catch (err) {
      showToast(`Không thể lưu thứ tự: ${err.message}`, 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Lưu thay đổi';
    }
  });

  // Load initially
  loadData();
}
