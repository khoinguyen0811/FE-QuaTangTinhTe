import { getVariants, deleteVariant, getVariantTypes, downloadVariantsCsv, importVariantsCsv } from '../../../services/adminService.js';
import { createConfirmDialog, showToast, createPagination } from '../shared/ui.js';
import { openVariantForm } from './VariantForm.js?v=1.0.22';
import { openBulkImageForm } from './BulkImageForm.js';

function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  if (url.match(ytRegExp)) return true;
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg')) {
    return true;
  }
  if (url.includes('/video/')) return true;
  return false;
}

function getVideoThumbnail(url) {
  if (!url || typeof url !== 'string') return '/image/default-placeholder.png';
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(ytRegExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
}

const PAGE_SIZE = 15;

const SKELETON_ROWS = `
  <tr>
    <td colspan="12" class="px-6 py-8">
      <div class="space-y-4">
        <div class="skeleton-shimmer h-5 w-full rounded-lg"></div>
        <div class="skeleton-shimmer h-5 w-11/12 rounded-lg"></div>
        <div class="skeleton-shimmer h-5 w-10/12 rounded-lg"></div>
        <div class="skeleton-shimmer h-5 w-full rounded-lg"></div>
      </div>
    </td>
  </tr>
`;

let state = { page: 1, search: '', total: 0, data: [], types: [], filters: {} };
let selectedVariantIds = new Set();

export function renderVariantTable(container) {
  // Clear any leftover selected items
  selectedVariantIds.clear();

  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden relative">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 border-b border-gray-100">
        <div class="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
          <div class="relative w-full sm:w-64 flex items-center">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input id="var-search" class="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
              placeholder="Tìm theo SKU, kích thước, chất liệu, tên sản phẩm..." value="${state.search}">
            <button id="var-clear-search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10 hidden" type="button" title="Xóa tìm kiếm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <!-- Popover Filter Wrapper -->
          <div class="relative inline-block text-left" id="var-filter-wrapper">
            <button type="button" id="var-filter-toggle" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center relative text-xs font-bold" title="Bộ lọc nâng cao">
              Lọc
              <span id="var-filter-badge" class="hidden absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
            </button>

            <div id="var-filter-popover" class="hidden absolute left-0 mt-2 w-60 bg-white border border-gray-250 shadow-xl rounded-xl p-4 z-50">
              <div class="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5 select-none">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Bộ lọc biến thể
                </span>
                <button type="button" id="var-clear-all-filters" class="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline transition-all">
                  Xóa bộ lọc
                </button>
              </div>
              <div id="var-filters-wrap" class="space-y-3 max-h-60 overflow-y-auto pr-1">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button id="var-export-btn"
            class="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex-shrink-0 focus:outline-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Xuất Excel
          </button>
          
          <button id="var-import-btn"
            class="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex-shrink-0 focus:outline-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Nhập Excel
          </button>

          <input type="file" id="var-import-input" accept=".csv" class="hidden" />

          <button id="var-add-btn"
            class="flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e] transition-colors flex-shrink-0 focus:outline-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm biến thể
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 py-3 text-left w-10">
                <input type="checkbox" id="select-all-vars" class="w-4 h-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] accent-[#C9A84C]">
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã SKU</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kích cỡ</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Màu sắc</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tồn kho</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody id="var-tbody" class="divide-y divide-gray-50">
            ${SKELETON_ROWS}
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-gray-100" id="var-pagination"></div>
    </div>

    <!-- Floating Bulk Action Bar -->
    <div id="var-bulk-bar" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900/95 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-6 transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none">
      <span class="text-sm font-medium"><span id="bulk-count" class="font-bold text-[#C9A84C]">0</span> biến thể đã chọn</span>
      <button id="bulk-image-btn" class="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white text-xs font-semibold rounded-lg shadow transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        Đổi ảnh hàng loạt
      </button>
      <button id="bulk-clear-btn" class="text-xs text-gray-400 hover:text-white transition-colors">
        Hủy
      </button>
    </div>
  `;

  const searchInput = container.querySelector('#var-search');
  const clearSearchBtn = container.querySelector('#var-clear-search');

  function toggleClearButton() {
    if (state.search) {
      clearSearchBtn?.classList.remove('hidden');
    } else {
      clearSearchBtn?.classList.add('hidden');
    }
  }

  // Toggle initially
  toggleClearButton();

  // Search input binding
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      selectedVariantIds.clear();
      updateBulkActionBar(container);
      toggleClearButton();
      loadVariants(container);
    }, 300);
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchInput.value = '';
    state.search = '';
    state.page = 1;
    selectedVariantIds.clear();
    updateBulkActionBar(container);
    toggleClearButton();
    loadVariants(container);
  });

  // Export Excel Button binding
  container.querySelector('#var-export-btn').addEventListener('click', async () => {
    try {
      showToast('Đang tạo và tải tệp Excel...', 'info');
      await downloadVariantsCsv();
      showToast('Tải danh sách biến thể thành công!');
    } catch (err) {
      showToast(err.message || 'Lỗi tải tệp', 'error');
    }
  });

  // Import Excel Button binding
  const importInput = container.querySelector('#var-import-input');
  container.querySelector('#var-import-btn').addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Đang nhập dữ liệu từ tệp Excel...', 'info');
      const res = await importVariantsCsv(file);
      const data = res.data || {};
      
      const successCount = data.success_count || 0;
      const errorCount = data.error_count || 0;
      
      if (errorCount === 0) {
        showToast(`Nhập Excel thành công! Đã xử lý ${successCount} dòng.`);
      } else {
        showToast(`Nhập hoàn tất: Cập nhật ${successCount} dòng thành công, ${errorCount} lỗi.`, 'warning');
        if (data.errors && data.errors.length) {
          console.warn('Import details:', data.errors);
        }
      }
      
      importInput.value = '';
      selectedVariantIds.clear();
      updateBulkActionBar(container);
      loadVariants(container);
    } catch (err) {
      showToast(err.message || 'Lỗi nhập tệp', 'error');
      importInput.value = '';
    }
  });

  // Add Button binding
  container.querySelector('#var-add-btn').addEventListener('click', () => {
    openVariantForm(null, () => loadVariants(container));
  });

  // Popover filter toggle
  const filterToggleBtn = container.querySelector('#var-filter-toggle');
  const filterPopover = container.querySelector('#var-filter-popover');
  const clearFiltersBtn = container.querySelector('#var-clear-all-filters');

  if (filterToggleBtn && filterPopover) {
    filterToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterPopover.classList.toggle('hidden');
    });

    const closeFilterPopover = (e) => {
      if (filterPopover && !e.target.closest('#var-filter-wrapper')) {
        filterPopover.classList.add('hidden');
      }
    };
    document.addEventListener('click', closeFilterPopover);

    window.adminCleanups = window.adminCleanups || [];
    window.adminCleanups.push(() => {
      document.removeEventListener('click', closeFilterPopover);
    });

    filterPopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.filters = {};
      state.page = 1;
      selectedVariantIds.clear();
      updateBulkActionBar(container);
      loadVariants(container);
    });
  }

  // Select all checkbox binding
  container.querySelector('#select-all-vars').addEventListener('change', (e) => {
    handleSelectAllChange(e.target.checked, container);
  });

  // Bulk action buttons
  container.querySelector('#bulk-clear-btn').addEventListener('click', () => {
    selectedVariantIds.clear();
    const selectAll = container.querySelector('#select-all-vars');
    if (selectAll) selectAll.checked = false;
    const checkboxes = container.querySelectorAll('.var-row-chk');
    checkboxes.forEach(chk => chk.checked = false);
    updateBulkActionBar(container);
  });

  container.querySelector('#bulk-image-btn').addEventListener('click', () => {
    if (selectedVariantIds.size === 0) return;
    openBulkImageForm(Array.from(selectedVariantIds), () => {
      selectedVariantIds.clear();
      const selectAll = container.querySelector('#select-all-vars');
      if (selectAll) selectAll.checked = false;
      updateBulkActionBar(container);
      loadVariants(container);
    });
  });

  const closeAllDropdowns = () => {
    container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
  };
  document.addEventListener('click', closeAllDropdowns);
  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeAllDropdowns);
  });

  loadVariants(container);
}

function updateBulkActionBar(container) {
  const bar = container.querySelector('#var-bulk-bar');
  const countEl = container.querySelector('#bulk-count');
  if (!bar || !countEl) return;

  const size = selectedVariantIds.size;
  countEl.textContent = size;

  if (size > 0) {
    bar.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    bar.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
  } else {
    bar.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    bar.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
  }
}

async function handleSelectAllChange(isChecked, container) {
  const selectAllCheckbox = container.querySelector('#select-all-vars');
  if (selectAllCheckbox) {
    selectAllCheckbox.disabled = true;
  }

  try {
    if (isChecked) {
      showToast('Đang chọn tất cả biến thể...', 'info');

      // Fetch all matching IDs
      const allParams = {
        limit: 100000,
        only_ids: 1,
        search: state.search,
      };
      Object.entries(state.filters || {}).forEach(([k, v]) => {
        allParams[`attr_${k}`] = v;
      });

      const res = await getVariants(allParams);
      const allIds = Array.isArray(res.data) ? res.data : [];

      selectedVariantIds.clear();
      allIds.forEach(id => {
        selectedVariantIds.add(Number(id));
      });

      // Update checkboxes on current page
      const checkboxes = container.querySelectorAll('.var-row-chk');
      checkboxes.forEach(chk => {
        chk.checked = true;
      });
      container.querySelectorAll('#var-tbody tr').forEach(tr => {
        tr.classList.add('bg-amber-50/30');
      });

      showToast(`Đã chọn tất cả ${allIds.length} biến thể!`);
    } else {
      selectedVariantIds.clear();

      // Update checkboxes on current page
      const checkboxes = container.querySelectorAll('.var-row-chk');
      checkboxes.forEach(chk => {
        chk.checked = false;
      });
      container.querySelectorAll('#var-tbody tr').forEach(tr => {
        tr.classList.remove('bg-amber-50/30');
      });
    }

    updateBulkActionBar(container);
  } catch (error) {
    showToast(error.message || 'Lỗi khi chọn tất cả biến thể', 'error');
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = !isChecked; // Revert checkbox state
    }
  } finally {
    if (selectAllCheckbox) {
      selectAllCheckbox.disabled = false;
    }
  }
}

async function loadVariants(container) {
  const tbody = container.querySelector('#var-tbody');
  tbody.innerHTML = SKELETON_ROWS;

  try {
    const params = {
      page: state.page,
      limit: PAGE_SIZE,
      search: state.search,
    };
    
    // Add dynamic attributes filters
    Object.entries(state.filters || {}).forEach(([k, v]) => {
      params[`attr_${k}`] = v;
    });

    // We fetch a list matching the current search parameters without attribute filters to build options
    const optionsParams = {
      limit: 1000,
      search: state.search,
    };

    const [variantsRes, typesRes, allMatchRes] = await Promise.all([
      getVariants(params),
      getVariantTypes(),
      getVariants(optionsParams)
    ]);

    const items = Array.isArray(variantsRes.data) ? variantsRes.data : [];
    state.total = Number(variantsRes.meta?.total ?? items.length);
    state.data = items;
    state.types = Array.isArray(typesRes.data) ? typesRes.data : [];

    // Calculate unique attribute values based on search results
    const allMatchingItems = Array.isArray(allMatchRes.data) ? allMatchRes.data : [];
    const uniqueValuesByType = {};
    
    state.types.forEach(t => {
      const uniqueVals = new Set();
      allMatchingItems.forEach(v => {
        let val = v.attribute_values?.[t.name];
        if (val === undefined || val === null) {
          val = v[t.name];
        }
        if (val && val.trim() !== '') {
          uniqueVals.add(val.trim());
        }
      });
      // Fallback to predefined values if none in actual current results
      if (uniqueVals.size === 0 && t.predefined_values) {
        t.predefined_values.split(',').map(x => x.trim()).filter(Boolean).forEach(x => uniqueVals.add(x));
      }
      uniqueValuesByType[t.name] = Array.from(uniqueVals).sort();
    });
    
    state.uniqueValuesByType = uniqueValuesByType;

    // Sync clear search button visibility
    const clearSearchBtn = container.querySelector('#var-clear-search');
    if (clearSearchBtn) {
      if (state.search) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
    }

    renderFiltersDropdowns(container);
    renderHeaders(container);
    renderRows(container);
    renderPageNav(container);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="12" class="py-8 text-center text-red-400 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function renderFiltersDropdowns(container) {
  const filtersWrap = container.querySelector('#var-filters-wrap');
  if (!filtersWrap) return;

  let html = '';
  state.types.forEach(t => {
    // Get unique values calculated for this type
    const values = state.uniqueValuesByType?.[t.name] || [];
    
    if (values.length > 0) {
      const activeValue = state.filters[t.name] || '';
      let optionsHtml = `<option value="">Tất cả ${t.display_name.toLowerCase()}</option>`;
      values.forEach(val => {
        optionsHtml += `<option value="${val}" ${activeValue === val ? 'selected' : ''}>${val}</option>`;
      });

      html += `
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">${t.display_name}</label>
          <select data-type="${t.name}" class="var-filter-select w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] bg-white">
            ${optionsHtml}
          </select>
        </div>
      `;
    }
  });

  filtersWrap.innerHTML = html;

  // Update filter badge
  const badge = container.querySelector('#var-filter-badge');
  const activeFiltersCount = Object.keys(state.filters).length;
  if (badge) {
    if (activeFiltersCount > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Bind change events
  filtersWrap.querySelectorAll('.var-filter-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const typeName = e.target.dataset.type;
      const value = e.target.value;
      if (value) {
        state.filters[typeName] = value;
      } else {
        delete state.filters[typeName];
      }
      state.page = 1;
      selectedVariantIds.clear();
      updateBulkActionBar(container);
      loadVariants(container);
    });
  });
}

function renderHeaders(container) {
  const thead = container.querySelector('thead');
  
  // Check if select-all is checked
  const allRowsSelected = state.data.length > 0 && state.data.every(v => selectedVariantIds.has(v.id));
  
  let html = `
    <tr class="bg-gray-50 border-b border-gray-100">
      <th class="px-4 py-3 text-left w-10">
        <input type="checkbox" id="select-all-vars" class="w-4 h-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] accent-[#C9A84C]" ${allRowsSelected ? 'checked' : ''}>
      </th>
      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã SKU</th>
  `;
  
  state.types.forEach(t => {
    html += `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">${t.display_name}</th>`;
  });
  
  html += `
      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Giá (VND)</th>
      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tồn kho</th>
      <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
    </tr>
  `;
  thead.innerHTML = html;

  // Re-bind select all checkbox
  const selectAllCheckbox = thead.querySelector('#select-all-vars');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      handleSelectAllChange(e.target.checked, container);
    });
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#var-tbody');
  const colsCount = 6 + state.types.length;

  if (!state.data.length) {
    tbody.innerHTML = `<tr><td colspan="${colsCount}" class="py-10 text-center text-gray-400 text-sm">Chưa có biến thể nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  state.data.forEach((v) => {
    const isLow = Number(v.stock_quantity ?? 0) < 5;
    const isChecked = selectedVariantIds.has(v.id);
    const tr = document.createElement('tr');
    tr.className = `hover:bg-gray-50 transition-colors ${isLow ? 'bg-yellow-50/50' : ''} ${isChecked ? 'bg-amber-50/30' : ''}`;
    
    let typeCellsHtml = '';
    state.types.forEach(t => {
      let val = v.attribute_values?.[t.name];
      if (val === undefined || val === null) {
        val = v[t.name];
      }
      
      const displayVal = val || '<span class="text-gray-300">—</span>';

      if (t.name === 'color' && val) {
        typeCellsHtml += `<td class="px-4 py-3 text-gray-500 text-xs">${displayVal}</td>`;
      } else if (t.name === 'size') {
        typeCellsHtml += `<td class="px-4 py-3 text-gray-800 font-bold">${displayVal}</td>`;
      } else {
        typeCellsHtml += `<td class="px-4 py-3 text-gray-600 text-sm">${displayVal}</td>`;
      }
    });

    tr.innerHTML = `
      <td class="px-4 py-3 w-10">
        <input type="checkbox" class="var-row-chk w-4 h-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] accent-[#C9A84C]" data-id="${v.id}" ${isChecked ? 'checked' : ''}>
      </td>
      <td class="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate" title="${v.product_name || ''}">
        <div class="flex items-center gap-2 justify-between">
          <div class="flex items-center gap-2 truncate">
            ${(() => {
              if (!v.images || v.images.length === 0) {
                return `<div class="w-8 h-8 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
              }
              const displaySrc = isVideoUrl(v.images[0]) ? getVideoThumbnail(v.images[0]) : v.images[0];
              return `<img src="${displaySrc}" class="w-8 h-8 rounded object-cover shadow-sm bg-gray-100 flex-shrink-0">`;
            })()}
            <span class="truncate">${v.product_name || '-'}</span>
          </div>
          <button type="button" class="filter-prod-btn shrink-0 p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors" title="Lọc theo sản phẩm này">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
      </td>
      <td class="px-4 py-3 text-gray-600 font-mono text-xs">${v.sku || '-'}</td>
      ${typeCellsHtml}
      <td class="px-4 py-3 text-gray-700 font-medium">${v.price !== null && v.price !== undefined ? Number(v.price).toLocaleString('vi-VN') + 'đ' : '<span class="text-gray-300">—</span>'}</td>
      <td class="px-4 py-3 ${isLow ? 'text-red-600 font-bold' : 'text-gray-600'}">${v.stock_quantity ?? 0}</td>
      <td class="px-4 py-3 text-right relative">
        <div class="inline-block text-left dropdown-wrapper">
          <button class="dropdown-trigger p-1.5 text-gray-500 hover:bg-gray-150 rounded-lg hover:text-gray-800 transition border-none bg-transparent cursor-pointer" title="Thao tác">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <div class="dropdown-menu hidden absolute right-4 top-9 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 font-medium text-left">
            <button class="edit-btn w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Sửa
            </button>
            <button class="del-btn w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Xóa
            </button>
          </div>
        </div>
      </td>
    `;

    const trigger = tr.querySelector('.dropdown-trigger');
    const menu = tr.querySelector('.dropdown-menu');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      container.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });

    // Click to filter by this product name
    tr.querySelector('.filter-prod-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const searchInput = container.querySelector('#var-search');
      if (searchInput) {
        searchInput.value = v.product_name;
        state.search = v.product_name;
        state.page = 1;
        selectedVariantIds.clear();
        updateBulkActionBar(container);
        loadVariants(container);
      }
    });

    // Row checkbox change binding
    tr.querySelector('.var-row-chk').addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const id = parseInt(e.target.dataset.id);
      if (isChecked) {
        selectedVariantIds.add(id);
        tr.classList.add('bg-amber-50/30');
      } else {
        selectedVariantIds.delete(id);
        tr.classList.remove('bg-amber-50/30');
      }
      
      // Update select all checkbox state
      const selectAll = container.querySelector('#select-all-vars');
      if (selectAll) {
        const allChecked = state.data.every(v => selectedVariantIds.has(v.id));
        selectAll.checked = allChecked;
      }
      
      updateBulkActionBar(container);
    });

    tr.querySelector('.edit-btn').addEventListener('click', () => {
      openVariantForm(v, () => loadVariants(container));
    });

    tr.querySelector('.del-btn').addEventListener('click', () => {
      createConfirmDialog(`Xóa biến thể SKU "${v.sku}"?`, async () => {
        try {
          await deleteVariant(v.id);
          showToast('Đã xóa biến thể thành công!');
          selectedVariantIds.delete(v.id);
          updateBulkActionBar(container);
          loadVariants(container);
        } catch (error) {
          showToast(error.message, 'error');
        }
      });
    });

    tbody.appendChild(tr);
  });
}

function renderPageNav(container) {
  const wrap = container.querySelector('#var-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / PAGE_SIZE);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadVariants(container);
  }));
}
