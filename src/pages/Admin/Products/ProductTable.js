import { getProducts, getProduct, deleteProduct, toggleProduct, computeBadges } from '../../../services/adminService.js';
import { createConfirmDialog, showToast, createPagination, formatPrice } from '../shared/ui.js';
import { initAutocompleteSuggestions } from '../shared/suggestions.js';

const PAGE_SIZE = 10;

const SKELETON_ROWS = Array(5).fill(0).map(() => `
  <tr class="animate-pulse">
    <td class="px-5 py-4">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-xl bg-gray-200"></div>
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </td>
    <td class="px-5 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
    <td class="px-5 py-4"><div class="h-4 bg-gray-200 rounded w-16"></div></td>
    <td class="px-5 py-4"><div class="h-6 bg-gray-200 rounded-lg w-10"></div></td>
    <td class="px-5 py-4"><div class="h-6 bg-gray-200 rounded-full w-10 mx-auto"></div></td>
    <td class="px-5 py-4 text-center"><div class="h-8 bg-gray-200 rounded-lg w-8 mx-auto"></div></td>
  </tr>
`).join('');

// sort field → [asc key, desc key]
const SORT_COLS = {
  sku:      ['sku_asc',    'sku_desc'],
  name:     ['name_asc',   'name_desc'],
  category: ['cat_asc',    'cat_desc'],
  price:    ['price_asc',  'price_desc'],
  stock:    ['stock_asc',  'stock_desc'],
};

let state = { page: 1, search: '', sort: '', sortDir: {}, total: 0, data: [] };

export function renderProductTable(container) {
  container.innerHTML = `
    <div class="admin-card bg-white border border-gray-250 rounded-2xl shadow-xl overflow-hidden">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-gray-200">
        <div class="relative w-full sm:w-80">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input id="prod-search" class="admin-input w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] text-gray-900 placeholder-gray-500 transition-colors"
            placeholder="Tìm theo tên, SKU..." value="${state.search}">
        </div>
        <div class="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
          <button id="prod-add-btn"
            class="admin-primary-btn flex items-center gap-2 px-5 py-2.5 bg-[#5d58f0] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#4b46d5] transition-all shadow-md shadow-[#5d58f0]/15 border-none cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm sản phẩm
          </button>
        </div>
      </div>
      <div class="overflow-x-auto w-full">
        <table class="admin-table w-full text-sm">
          <thead class="bg-gray-50/50">
            <tr class="border-b border-gray-200">
              <th class="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 sort-th" data-col="name">
                <span class="flex items-center gap-1.5">Sản phẩm <span class="sort-icon text-gray-500">⇅</span></span>
              </th>
              <th class="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 sort-th" data-col="category">
                <span class="flex items-center gap-1.5">Danh mục <span class="sort-icon text-gray-500">⇅</span></span>
              </th>
              <th class="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 sort-th" data-col="price">
                <span class="flex items-center gap-1.5">Giá <span class="sort-icon text-gray-500">⇅</span></span>
              </th>
              <th class="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 sort-th" data-col="stock">
                <span class="flex items-center gap-1.5">Tồn kho <span class="sort-icon text-gray-500">⇅</span></span>
              </th>
              <th class="px-5 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-32">Trạng thái</th>
              <th class="px-5 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-24">Hành động</th>
            </tr>
          </thead>
          <tbody id="prod-tbody" class="divide-y divide-gray-200/70">
            ${SKELETON_ROWS}
          </tbody>
        </table>
      </div>
      <div class="px-5 py-4 border-t border-gray-200 bg-gray-50/20" id="prod-pagination"></div>
    </div>
  `;

  // Search
  let searchTimer;
  const prodSearch = container.querySelector('#prod-search');
  prodSearch.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadProducts(container);
    }, 300);
  });

  // Autocomplete Suggestions
  initAutocompleteSuggestions({
    inputEl: prodSearch,
    fetchSuggestions: async (q) => {
      try {
        const res = await getProducts({ search: q, limit: 6 });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    renderItem: (item) => {
      const image = item.images?.[0] || item.thumbnail || '';
      return `
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          ${image ? `<img src="${image}" class="w-8 h-8 object-cover rounded-lg bg-gray-50 flex-shrink-0" onerror="this.style.display='none'"/>` : `<div class="w-8 h-8 rounded-lg bg-gray-50 flex-shrink-0"></div>`}
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 truncate">${item.name}</div>
            <div class="text-[10px] text-gray-500 font-mono mt-0.5">${item.sku || '-'}</div>
          </div>
        </div>
        <div class="text-[11px] font-bold text-gray-800 whitespace-nowrap">${Number(item.sale_price || item.price).toLocaleString('vi-VN')}đ</div>
      `;
    },
    getSearchValue: (item) => item.name,
    onSelect: (item) => {
      state.search = item.name;
      state.page = 1;
      loadProducts(container);
    }
  });

  // Add product
  container.querySelector('#prod-add-btn').addEventListener('click', () => {
    window.location.hash = '#products/new';
  });

  // Sortable column headers
  container.querySelectorAll('.sort-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      const [asc, desc] = SORT_COLS[col];
      const current = state.sortDir[col]; // undefined → asc → desc → undefined

      // Reset other columns
      state.sortDir = {};

      if (!current) {
        state.sort = asc;
        state.sortDir[col] = 'asc';
      } else if (current === 'asc') {
        state.sort = desc;
        state.sortDir[col] = 'desc';
      } else {
        state.sort = '';
        state.sortDir[col] = undefined;
      }

      state.page = 1;
      updateSortIcons(container);
      loadProducts(container);
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

  loadProducts(container);
}

function updateSortIcons(container) {
  container.querySelectorAll('.sort-th').forEach(th => {
    const col = th.dataset.col;
    const dir = state.sortDir[col];
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (dir === 'asc')  { icon.textContent = '↑'; icon.className = 'sort-icon text-[#5d58f0] font-bold'; }
    else if (dir === 'desc') { icon.textContent = '↓'; icon.className = 'sort-icon text-[#5d58f0] font-bold'; }
    else { icon.textContent = '⇅'; icon.className = 'sort-icon text-gray-500'; }
  });
}

async function loadProducts(container) {
  const tbody = container.querySelector('#prod-tbody');
  tbody.innerHTML = SKELETON_ROWS;

  try {
    const res = await getProducts({
      page: state.page,
      limit: PAGE_SIZE,
      search: state.search,
      sort: state.sort,
    });

    const items = Array.isArray(res.data) ? res.data : [];
    state.total = Number(res.meta?.total ?? items.length);
    state.data = items;

    renderRows(container);
    renderPageNav(container);

    // Auto open edit form if redirected from detail page
    const autoEditId = sessionStorage.getItem('admin_edit_product_id');
    if (autoEditId) {
      sessionStorage.removeItem('admin_edit_product_id');
      window.location.hash = `#products/${autoEditId}`;
    }
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-red-400 text-sm bg-gray-50/20">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#prod-tbody');
  if (!state.data.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-gray-400 text-sm bg-gray-50/20">Chưa có sản phẩm nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  state.data.forEach((product) => {
    const lowStock = Number(product.stock ?? 0) < 5;
    const image = product.images?.[0] || product.thumbnail || '';
    const isRowActive = Number(product.is_active) === 1;

    const tr = document.createElement('tr');
    tr.className = `hover:bg-gray-50/40 transition-all h-[76px] ${!isRowActive ? 'opacity-65' : ''} ${lowStock ? 'border-l-2 border-amber-500 bg-amber-500/5' : ''}`;
    tr.innerHTML = `
      <td class="px-5 py-3">
        <div class="flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-xl object-cover bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5 border border-gray-200 relative">
            ${image
              ? `<img src="${image}" alt="" class="w-full h-full object-cover rounded-lg" onerror="this.src='/image/default-placeholder.png'">`
              : `<div class="w-full h-full rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 font-bold">SLY</div>`}
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-gray-900 truncate text-sm hover:text-[#5d58f0] cursor-pointer edit-trigger">${product.name || '-'}</div>
            <div class="text-[11px] text-gray-400 font-mono mt-0.5 select-all">SKU: ${product.sku || '-'}</div>
          </div>
        </div>
      </td>
      <td class="px-5 py-3 text-gray-900 text-xs font-semibold">${product.category_name || '-'}</td>
      <td class="px-5 py-3 text-gray-900 font-bold whitespace-nowrap text-sm">${formatPrice(product.sale_price || product.price)}</td>
      <td class="px-5 py-3">
        <span class="px-2.5 py-1 rounded-lg text-xs font-black ${lowStock ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}">
          ${product.stock ?? 0}
        </span>
      </td>
      <td class="px-5 py-3 text-center">
        <button class="admin-status-toggle toggle-status relative inline-flex items-center w-10 h-6 rounded-full transition-colors ${isRowActive ? 'is-active bg-[#5d58f0]' : 'is-inactive bg-gray-50'} border-none cursor-pointer" data-id="${product.id}">
          <span class="absolute top-0.5 ${isRowActive ? 'left-[18px]' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all"></span>
        </button>
      </td>
      <td class="px-5 py-3 text-center relative">
        <div class="inline-block text-left dropdown-wrapper">
          <button class="dropdown-trigger p-2 text-gray-400 hover:bg-gray-50 rounded-lg hover:text-white transition border-none bg-transparent cursor-pointer" title="Thao tác">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <div class="admin-dropdown dropdown-menu hidden absolute right-4 top-9 w-24 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 font-medium text-left">
            <button class="edit-btn w-full text-left px-3 py-2 text-blue-450 hover:bg-blue-950/20 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Sửa
            </button>
            <button class="del-btn w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer">
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

    tr.querySelector('.edit-trigger').addEventListener('click', () => {
      window.location.hash = `#products/${product.id}`;
    });

    tr.querySelector('.edit-btn').addEventListener('click', () => {
      window.location.hash = `#products/${product.id}`;
    });

    tr.querySelector('.del-btn').addEventListener('click', () => {
      createConfirmDialog(`Xóa sản phẩm "${product.name}"?`, async () => {
        try {
          await deleteProduct(product.id);
          showToast('Đã xóa');
          loadProducts(container);
        } catch (error) {
          showToast(error.message, 'error');
        }
      });
    });

    tr.querySelector('.toggle-status').addEventListener('click', async () => {
      try {
        await toggleProduct(product.id);
        loadProducts(container);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });

    tbody.appendChild(tr);
  });
}

function renderPageNav(container) {
  const wrap = container.querySelector('#prod-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / PAGE_SIZE);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadProducts(container);
  }));
}

function badgeClass(badge) {
  const map = { NEW: 'bg-blue-100 text-blue-700', BESTSELLER: 'bg-yellow-100 text-yellow-700', SALE: 'bg-red-100 text-red-700' };
  return map[badge] || 'bg-gray-100 text-gray-700';
}
