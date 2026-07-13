import { getOrders, updateOrderStatus } from '../../../services/adminService.js?v=1.0.82';
import { showToast, createPagination, formatPrice, formatDate, showShippingModal } from '../shared/ui.js?v=1.0.82';
import { renderOrderDetail } from './OrderDetail.js?v=1.0.84';
import { initAutocompleteSuggestions } from '../shared/suggestions.js';

const STATUS_LABELS = {
  all:        'Tất cả',
  pending:    'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping:   'Đang giao',
  completed:  'Hoàn thành',
  cancelled:  'Đã hủy',
};

let state = { page: 1, status: 'all', sortDir: {}, total: 0, data: [], search: '' };
const PAGE_SIZE = 20;
const SKELETON_ROWS = Array(5).fill(0).map(() => `
  <tr>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-10"></div></td>
    <td class="px-4 py-4">
      <div class="skeleton-shimmer h-4 w-28 mb-1.5"></div>
      <div class="skeleton-shimmer h-3 w-36"></div>
    </td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-20"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-16"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-20"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-6 w-20 rounded-full"></div></td>
    <td class="px-4 py-4 text-right"><div class="skeleton-shimmer h-8 w-24 ml-auto rounded-lg"></div></td>
  </tr>
`).join('');

export function renderOrderTable(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
        <div class="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
          <div class="relative w-full sm:w-64 flex items-center">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" id="order-search-input" value="${state.search || ''}" placeholder="Tìm theo Mã đơn, tên, sđt..." class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] bg-white">
          </div>
          <!-- Popover Filter Wrapper -->
          <div class="relative inline-block text-left" id="order-filter-wrapper">
            <button type="button" id="order-filter-toggle" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center relative text-xs font-bold" title="Bộ lọc nâng cao">
              Lọc
              <span id="order-filter-badge" class="${state.status && state.status !== 'all' ? '' : 'hidden'} absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
            </button>

            <div id="order-filter-popover" class="hidden absolute left-0 mt-2 w-60 bg-white border border-gray-250 shadow-xl rounded-xl p-4 z-50">
              <div class="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5 select-none">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Bộ lọc đơn hàng
                </span>
                <button type="button" id="order-clear-all-filters" class="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline transition-all">
                  Xóa bộ lọc
                </button>
              </div>
              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</label>
                  <select id="order-filter-status" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] bg-white">
                    ${Object.entries(STATUS_LABELS).map(([value, label]) => `
                      <option value="${value}" ${state.status === value ? 'selected' : ''}>${label}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="id">
                <span class="flex items-center gap-1"># Đơn <span class="sort-icon text-gray-300">⇅</span></span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="date">
                <span class="flex items-center gap-1">Ngày <span class="sort-icon text-gray-300">⇅</span></span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="total">
                <span class="flex items-center gap-1">Tổng <span class="sort-icon text-gray-300">⇅</span></span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody id="order-tbody" class="divide-y divide-gray-50">
            ${SKELETON_ROWS}
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-gray-100" id="order-pagination"></div>
    </div>
  `;

  // Popover filter toggle
  const filterToggleBtn = container.querySelector('#order-filter-toggle');
  const filterPopover = container.querySelector('#order-filter-popover');
  const clearFiltersBtn = container.querySelector('#order-clear-all-filters');
  const statusSelect = container.querySelector('#order-filter-status');

  if (filterToggleBtn && filterPopover) {
    filterToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterPopover.classList.toggle('hidden');
    });

    const closeFilterPopover = (e) => {
      if (filterPopover && !e.target.closest('#order-filter-wrapper')) {
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

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.status = e.target.value;
      state.page = 1;
      state.sortDir = {};

      const badge = container.querySelector('#order-filter-badge');
      if (badge) {
        if (state.status && state.status !== 'all') badge.classList.remove('hidden');
        else badge.classList.add('hidden');
      }

      loadOrders(container);
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.status = 'all';
      state.page = 1;
      state.sortDir = {};
      if (statusSelect) statusSelect.value = 'all';

      const badge = container.querySelector('#order-filter-badge');
      if (badge) badge.classList.add('hidden');

      loadOrders(container);
    });
  }

  const searchInput = container.querySelector('#order-search-input');
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadOrders(container);
    }, 400);
  });

  if (searchInput) {
    initAutocompleteSuggestions({
      inputEl: searchInput,
      fetchSuggestions: async (q) => {
        try {
          const res = await getOrders({ search: q, limit: 6 });
          return Array.isArray(res.data) ? res.data : [];
        } catch (err) {
          return [];
        }
      },
      renderItem: (item) => {
        return `
          <div class="flex flex-col min-w-0 flex-1">
            <div class="font-bold text-gray-900">Đơn #${item.id}</div>
            <div class="text-[10px] text-gray-500 mt-0.5 truncate">${item.customer_name || '-'} — ${item.customer_phone || '-'}</div>
          </div>
          <div class="text-[11px] font-bold text-gray-800 whitespace-nowrap">${Number(item.total_amount || item.total || 0).toLocaleString('vi-VN')}đ</div>
        `;
      },
      getSearchValue: (item) => String(item.id),
      onSelect: (item) => {
        state.search = String(item.id);
        state.page = 1;
        loadOrders(container);
      }
    });
  }

  container.querySelectorAll('.sort-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      const current = state.sortDir[col];
      state.sortDir = {};
      if (!current)            state.sortDir[col] = 'asc';
      else if (current === 'asc') state.sortDir[col] = 'desc';
      updateSortIcons(container);
      renderRows(container);
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

  loadOrders(container);
}

function updateSortIcons(container) {
  container.querySelectorAll('.sort-th').forEach(th => {
    const dir = state.sortDir[th.dataset.col];
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (dir === 'asc')       { icon.textContent = '↑'; icon.className = 'sort-icon text-[#C9A84C]'; }
    else if (dir === 'desc') { icon.textContent = '↓'; icon.className = 'sort-icon text-[#C9A84C]'; }
    else                     { icon.textContent = '⇅'; icon.className = 'sort-icon text-gray-300'; }
  });
}

function getSorted(data) {
  const [col, dir] = Object.entries(state.sortDir).find(([, v]) => v) || [];
  if (!col) return data;
  const factor = dir === 'asc' ? 1 : -1;
  return [...data].sort((a, b) => {
    let va, vb;
    if (col === 'id')    { va = a.id; vb = b.id; }
    if (col === 'date')  { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); }
    if (col === 'total') { va = Number(a.total_amount ?? 0); vb = Number(b.total_amount ?? 0); }
    return (va - vb) * factor;
  });
}

async function loadOrders(container) {
  const tbody = container.querySelector('#order-tbody');
  tbody.innerHTML = SKELETON_ROWS;

  try {
    const params = { page: state.page, limit: PAGE_SIZE };
    if (state.status !== 'all') params.status = state.status;
    if (state.search) params.search = state.search;

    const res = await getOrders(params);
    const items = Array.isArray(res.data) ? res.data : [];
    state.total = Number(res.meta?.total ?? items.length);
    state.data = items;

    renderRows(container);
    renderPageNav(container);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-red-400 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#order-tbody');
  const rows = getSorted(state.data);

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-gray-400 text-sm">Không có đơn hàng</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  rows.forEach((order) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors cursor-pointer';
    const items = order.items || order.order_items || [];

    tr.innerHTML = `
      <td class="px-4 py-3 font-mono text-xs text-gray-500 font-medium">#${order.id}</td>
      <td class="px-4 py-3">
        <div class="font-medium text-gray-900">${order.customer_name || order.user?.full_name || '-'}</div>
        <div class="text-xs text-gray-400">${order.customer_email || order.user?.email || ''}</div>
      </td>
      <td class="px-4 py-3 text-gray-600 text-xs">${formatDate(order.created_at)}</td>
      <td class="px-4 py-3 text-gray-600 text-xs">${items.length} sản phẩm</td>
      <td class="px-4 py-3 font-semibold text-gray-900">${formatPrice(order.total_amount)}</td>
      <td class="px-4 py-3">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(order.status)}">${STATUS_LABELS[order.status] || order.status}</span>
      </td>
      <td class="px-4 py-3 text-right relative">
        <div class="inline-block text-left dropdown-wrapper">
          <button class="dropdown-trigger p-1.5 text-gray-500 hover:bg-gray-150 rounded-lg hover:text-gray-800 transition border-none bg-transparent cursor-pointer" title="Thao tác">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <div class="dropdown-menu hidden absolute right-4 top-9 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 font-medium text-left">
            <button class="view-btn w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Xem chi tiết
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

    tr.querySelector('.view-btn').addEventListener('click', (event) => {
      event.stopPropagation();
      showDetailView(container, order.id);
    });

    tr.addEventListener('click', () => showDetailView(container, order.id));
    tbody.appendChild(tr);
  });
}

function showDetailView(container, orderId) {
  window.location.hash = `#orders/${orderId}`;
}

function renderPageNav(container) {
  const wrap = container.querySelector('#order-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / PAGE_SIZE);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadOrders(container);
  }));
}

function statusClass(status) {
  const map = {
    pending:    'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipping:   'bg-purple-100 text-purple-700',
    completed:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}
