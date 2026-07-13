import { getReturns, handleReturnAction } from '../../../services/adminService.js';
import { showToast, createPagination } from '../shared/ui.js';
import { openLightbox } from '../../ProductDetail/components/LightboxModal.js';
import { initAutocompleteSuggestions } from '../shared/suggestions.js';

let state = { page: 1, limit: 10, status: '', total: 0, data: [], search: '' };

export function renderReturns(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Yêu Cầu Đổi / Trả Hàng</h2>
          <p class="text-sm text-gray-500 mt-0.5">Xử lý các yêu cầu đổi trả của khách hàng trong 15 ngày</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
          <div class="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
            <div class="relative w-full sm:w-64 flex items-center">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" id="return-search-input" value="${state.search || ''}" placeholder="Tìm theo Mã đổi trả, Đơn hàng, tên..." class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] bg-white">
            </div>
            <!-- Popover Filter Wrapper -->
            <div class="relative inline-block text-left" id="return-filter-wrapper">
              <button type="button" id="return-filter-toggle" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center relative text-xs font-bold" title="Bộ lọc nâng cao">
                Lọc
                <span id="return-filter-badge" class="${state.status ? '' : 'hidden'} absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
              </button>

              <div id="return-filter-popover" class="hidden absolute left-0 mt-2 w-60 bg-white border border-gray-250 shadow-xl rounded-xl p-4 z-50">
                <div class="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                  <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5 select-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Bộ lọc đổi trả
                  </span>
                  <button type="button" id="return-clear-all-filters" class="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline transition-all">
                    Xóa bộ lọc
                  </button>
                </div>
                <div class="space-y-3">
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</label>
                    <select id="return-filter-status" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] bg-white">
                      <option value="">Tất cả trạng thái</option>
                      <option value="requested" ${state.status === 'requested' ? 'selected' : ''}>Yêu cầu mới</option>
                      <option value="approved_shipping" ${state.status === 'approved_shipping' ? 'selected' : ''}>Đã duyệt - Chờ ship</option>
                      <option value="shipper_pickup" ${state.status === 'shipper_pickup' ? 'selected' : ''}>Shipper đang lấy hàng</option>
                      <option value="received_checking" ${state.status === 'received_checking' ? 'selected' : ''}>Đã nhận - Đang kiểm tra</option>
                      <option value="completed" ${state.status === 'completed' ? 'selected' : ''}>Đã hoàn tất</option>
                      <option value="rejected" ${state.status === 'rejected' ? 'selected' : ''}>Bị từ chối</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th class="px-6 py-4">Mã Đổi/Trả</th>
                <th class="px-6 py-4">Khách Hàng</th>
                <th class="px-6 py-4">Đơn Hàng</th>
                <th class="px-6 py-4">Loại Yêu Cầu</th>
                <th class="px-6 py-4">Lý Do</th>
                <th class="px-6 py-4">Trạng Thái</th>
                <th class="px-6 py-4">Ngày Tạo</th>
                <th class="px-6 py-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody id="returns-tbody" class="divide-y divide-gray-50">
              <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100" id="returns-pagination"></div>
      </div>
    </div>
  `;

  // Popover filter toggle
  const filterToggleBtn = container.querySelector('#return-filter-toggle');
  const filterPopover = container.querySelector('#return-filter-popover');
  const clearFiltersBtn = container.querySelector('#return-clear-all-filters');
  const select = container.querySelector('#return-filter-status');

  if (filterToggleBtn && filterPopover) {
    filterToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterPopover.classList.toggle('hidden');
    });

    const closeFilterPopover = (e) => {
      if (filterPopover && !e.target.closest('#return-filter-wrapper')) {
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

  if (select) {
    select.addEventListener('change', (e) => {
      state.status = e.target.value;
      state.page = 1;

      const badge = container.querySelector('#return-filter-badge');
      if (badge) {
        if (state.status) badge.classList.remove('hidden');
        else badge.classList.add('hidden');
      }

      loadReturns(container);
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.status = '';
      state.page = 1;
      if (select) select.value = '';

      const badge = container.querySelector('#return-filter-badge');
      if (badge) badge.classList.add('hidden');

      loadReturns(container);
    });
  }

  const searchInput = container.querySelector('#return-search-input');
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadReturns(container);
    }, 400);
  });

  if (searchInput) {
    initAutocompleteSuggestions({
      inputEl: searchInput,
      fetchSuggestions: async (q) => {
        try {
          const res = await getReturns({ search: q, limit: 6 });
          return Array.isArray(res.data) ? res.data : [];
        } catch (err) {
          return [];
        }
      },
      renderItem: (item) => {
        return `
          <div class="flex flex-col min-w-0 flex-1">
            <div class="font-bold text-gray-900">${item.return_code || '#' + item.id}</div>
            <div class="text-[10px] text-gray-500 mt-0.5 truncate">Đơn #${item.order_id} — ${item.receiver_name || '-'}</div>
          </div>
        `;
      },
      getSearchValue: (item) => item.return_code || String(item.id),
      onSelect: (item) => {
        state.search = item.return_code || String(item.id);
        state.page = 1;
        loadReturns(container);
      }
    });
  }

  loadReturns(container);
}

async function loadReturns(container) {
  const tbody = container.querySelector('#returns-tbody');
  tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>`;

  try {
    const params = {
      page: state.page,
      limit: state.limit
    };
    if (state.status) params.status = state.status;
    if (state.search) params.search = state.search;

    const res = await getReturns(params);

    state.data = res.data || [];
    state.total = Number(res.meta?.total ?? state.data.length);

    renderRows(container);
    renderPageNav(container);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-8 text-center text-red-500 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

const statusBadges = {
  requested: '<span class="px-2 py-1 text-xs rounded-full font-semibold bg-yellow-100 text-yellow-800">Yêu cầu mới</span>',
  approved_shipping: '<span class="px-2 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-800">Đã duyệt - Chờ ship</span>',
  shipper_pickup: '<span class="px-2 py-1 text-xs rounded-full font-semibold bg-indigo-100 text-indigo-800">Shipper đang lấy</span>',
  received_checking: '<span class="px-2 py-1 text-xs rounded-full font-semibold bg-purple-100 text-purple-800">Đang kiểm tra</span>',
  completed: '<span class="px-2 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-800">Đã hoàn tất</span>',
  rejected: '<span class="px-2 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-800">Bị từ chối</span>',
};

const typeLabels = {
  exchange_size: 'Đổi Size',
  return_goods: 'Trả Hàng hoàn tiền',
  refund: 'Trả Hàng hoàn tiền',
  exchange_product: 'Đổi Sản phẩm khác',
};

const sourceLabels = {
  web: 'Web',
  shopee: 'Shopee',
  tiktok_shop: 'TikTok Shop',
  other: 'Khác'
};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function orderLabel(item) {
  if (item.order_source && item.order_source !== 'web') {
    return `${sourceLabels[item.order_source] || item.order_source}: ${item.external_order_code || '-'}`;
  }
  return `#${item.order_id}`;
}

function renderRows(container) {
  const tbody = container.querySelector('#returns-tbody');
  if (!state.data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-8 text-center text-gray-400 text-sm">Chưa có yêu cầu đổi trả nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  state.data.forEach((item) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors text-gray-700';
    tr.innerHTML = `
      <td class="px-6 py-4 font-mono font-medium text-gray-900">${escapeHTML(item.return_code)}</td>
      <td class="px-6 py-4">
        <div class="font-medium text-gray-900">${escapeHTML(item.customer_name || 'Khách ẩn danh')}</div>
        <div class="text-xs text-gray-400">${escapeHTML(item.customer_phone)}</div>
      </td>
      <td class="px-6 py-4 font-mono text-xs">${escapeHTML(orderLabel(item))}</td>
      <td class="px-6 py-4 text-xs">${escapeHTML(typeLabels[item.type] || item.type)}</td>
      <td class="px-6 py-4 text-xs max-w-[150px] truncate" title="${escapeHTML(item.reason)}">${escapeHTML(item.reason)}</td>
      <td class="px-6 py-4">${statusBadges[item.status] || escapeHTML(item.status)}</td>
      <td class="px-6 py-4 text-xs text-gray-500">${new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
      <td class="px-6 py-4 text-right">
        <button class="view-btn px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">Chi tiết</button>
      </td>
    `;

    tr.querySelector('.view-btn').addEventListener('click', () => showDetailModal(item, () => loadReturns(container)));
    tbody.appendChild(tr);
  });
}

function showDetailModal(item, reloadCallback) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto';
  modal.setAttribute('data-lenis-prevent', 'true');
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden my-8">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Chi tiết yêu cầu đổi/trả</h3>
          <p class="text-xs text-gray-500 font-mono mt-0.5">Mã: ${escapeHTML(item.return_code)}</p>
        </div>
        <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      
      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-400 text-xs uppercase font-semibold">Khách hàng</div>
            <div class="font-semibold text-gray-800 mt-1">${escapeHTML(item.customer_name)} (${escapeHTML(item.customer_phone)})</div>
            <div class="text-gray-500 text-xs mt-0.5">${escapeHTML(item.customer_email || 'Không có email')}</div>
          </div>
          <div>
            <div class="text-gray-400 text-xs uppercase font-semibold">Đơn hàng gốc</div>
            <div class="font-mono text-gray-800 mt-1">${escapeHTML(orderLabel(item))}</div>
            ${item.receiver_address ? `<div class="text-xs text-gray-500 mt-1">${escapeHTML(item.receiver_address)}</div>` : ''}
          </div>
          <div>
            <div class="text-gray-400 text-xs uppercase font-semibold">Loại đổi trả</div>
            <div class="text-gray-800 mt-1">${escapeHTML(typeLabels[item.type] || item.type)}</div>
          </div>
          <div>
            <div class="text-gray-400 text-xs uppercase font-semibold">Trạng thái hiện tại</div>
            <div class="mt-1">${statusBadges[item.status] || escapeHTML(item.status)}</div>
          </div>
        </div>

        <div>
          <div class="text-gray-400 text-xs uppercase font-semibold mb-1">Lý do từ khách hàng</div>
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic border border-gray-100">${escapeHTML(item.reason)}</div>
          ${item.description ? `<div class="text-sm text-gray-600 mt-2">${escapeHTML(item.description)}</div>` : ''}
        </div>

        <!-- Customer tags images -->
        <div>
          <div class="text-gray-400 text-xs uppercase font-semibold mb-2">Hình ảnh sản phẩm gửi kèm (${item.images?.length || 0} ảnh)</div>
          <div class="flex flex-wrap gap-2">
            ${item.images && item.images.length > 0
              ? item.images.map(img => `<img src="${escapeHTML(img)}" class="return-detail-img w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-zoom-in" data-src="${escapeHTML(img)}" onerror="this.src='https://placehold.co/100?text=Error'">`).join('')
              : '<div class="text-xs text-gray-400">Không có hình ảnh đính kèm</div>'
            }
          </div>
        </div>

        ${item.shipping_code ? `
          <div>
            <div class="text-gray-400 text-xs uppercase font-semibold">Mã vận đơn ship trả</div>
            <div class="font-mono font-bold text-sm text-blue-700 mt-1">${escapeHTML(item.shipping_code)}</div>
          </div>
        ` : ''}

        ${item.rejection_reason ? `
          <div class="bg-red-50 text-red-700 rounded-lg p-3 text-sm border border-red-100">
            <strong>Lý do từ chối:</strong> ${escapeHTML(item.rejection_reason)}
          </div>
        ` : ''}

        ${item.internal_notes ? `
          <div>
            <div class="text-gray-400 text-xs uppercase font-semibold mb-1">Ghi chú nội bộ</div>
            <pre class="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed border border-gray-100">${escapeHTML(item.internal_notes)}</pre>
          </div>
        ` : ''}

        <!-- Workflow Actions -->
        <div class="border-t border-gray-100 pt-4 space-y-3">
          <div class="text-gray-500 text-xs font-bold uppercase tracking-wider">Thao tác quy trình</div>
          <div class="flex items-center gap-3">
            <select id="rt-status-sel" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C]">
              <option value="requested" ${item.status === 'requested' ? 'selected' : 'disabled'}>Yêu cầu mới</option>
              <option value="approved_shipping" ${item.status === 'approved_shipping' ? 'selected' : ''}>Đã duyệt - Chờ ship</option>
              <option value="shipper_pickup" ${item.status === 'shipper_pickup' ? 'selected' : ''}>Shipper đang lấy (Nhập mã vận đơn)</option>
              <option value="received_checking" ${item.status === 'received_checking' ? 'selected' : ''}>Đã nhận & kiểm tra</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Hoàn tất</option>
              <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Từ chối</option>
            </select>
            <button id="rt-update-btn" class="px-5 py-2 bg-[#C9A84C] text-white rounded-lg text-xs font-semibold hover:bg-[#b8963e] transition-colors">Cập nhật</button>
            <button id="rt-note-btn" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">Thêm ghi chú</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
  };

  modal.querySelector('#close-modal-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Attach lightbox zoom / slider event listeners to images
  modal.querySelectorAll('.return-detail-img').forEach(img => {
    img.addEventListener('click', () => {
      const src = img.dataset.src;
      openLightbox(item.images, src, `Yêu cầu đổi/trả ${item.return_code}`);
    });
  });

  const updateBtn = modal.querySelector('#rt-update-btn');
  const statusSel = modal.querySelector('#rt-status-sel');
  const noteBtn = modal.querySelector('#rt-note-btn');

  updateBtn.addEventListener('click', async () => {
    const newStatus = statusSel.value;
    if (newStatus === item.status) {
      showToast('Vui lòng chọn trạng thái khác để cập nhật', 'warning');
      return;
    }

    let action = '';
    let payload = {};

    switch (newStatus) {
      case 'approved_shipping':
        action = 'approve';
        break;
      case 'rejected':
        action = 'reject';
        const reason = prompt('Nhập lý do từ chối yêu cầu đổi trả:');
        if (reason === null) return;
        if (!reason.trim()) { alert('Lý do không được để trống.'); return; }
        payload.rejection_reason = reason.trim();
        break;
      case 'shipper_pickup':
        action = 'shipper_pickup';
        const code = prompt('Nhập mã vận đơn hãng vận chuyển (SPX/GHN/GHTK):');
        if (code === null) return;
        if (!code.trim()) { alert('Mã vận đơn không được để trống.'); return; }
        payload.shipping_code = code.trim();
        break;
      case 'received_checking':
        action = 'receive_check';
        break;
      case 'completed':
        action = 'complete';
        break;
      default:
        showToast('Trạng thái không hợp lệ', 'error');
        return;
    }

    payload.action = action;

    if (action !== 'reject' && action !== 'shipper_pickup') {
      const label = statusSel.options[statusSel.selectedIndex].text;
      const confirmOk = confirm(`Xác nhận chuyển trạng thái sang "${label}"?`);
      if (!confirmOk) return;
    }

    updateBtn.disabled = true;
    updateBtn.textContent = 'Đang lưu...';
    try {
      await handleReturnAction(item.id, payload);
      showToast('Cập nhật trạng thái thành công');
      close();
      reloadCallback();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      updateBtn.disabled = false;
      updateBtn.textContent = 'Cập nhật';
    }
  });

  noteBtn.addEventListener('click', async () => {
    const note = prompt('Nhập ghi chú nội bộ (không thay đổi trạng thái):');
    if (note === null) return;
    if (!note.trim()) { alert('Nội dung không được để trống.'); return; }

    noteBtn.disabled = true;
    try {
      await handleReturnAction(item.id, { action: 'internal_note', note: note.trim() });
      showToast('Thêm ghi chú thành công');
      close();
      reloadCallback();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      noteBtn.disabled = false;
    }
  });
}

function renderPageNav(container) {
  const wrap = container.querySelector('#returns-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / state.limit);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadReturns(container);
  }));
}
