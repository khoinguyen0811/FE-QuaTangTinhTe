import { getMembers, adjustMemberPoints, toggleMemberBlacklist, getMemberPointsHistory, getRanks } from '../../../services/adminService.js';
import { showToast, createPagination, hasPermission, getRankBadgeHtml } from '../shared/ui.js';
import { exportMembersToCSV, renderMembersPageNav } from './MembersExport.js';

let state = { page: 1, limit: 10, search: '', rank: '', total: 0, data: [] };

export function renderMembers(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản Lý Khách Hàng</h2>
          <p class="text-sm text-gray-500 mt-0.5">Quản lý danh sách khách hàng và danh sách đen phòng chống lạm dụng đổi trả</p>
        </div>
        <button id="members-export-btn" class="px-4 py-2 bg-gray-950 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Xuất Excel (CSV)
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div class="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
            <div class="relative w-full sm:w-72">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input id="members-search" class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="Tìm tên, SĐT, email..." value="${state.search}">
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th class="px-6 py-4">Khách Hàng</th>
                <th class="px-6 py-4">Số Điện Thoại</th>
                <th class="px-6 py-4">Tổng Chi Tiêu</th>
                <th class="px-6 py-4 hidden">Điểm Tích Lũy</th>
                <th class="px-6 py-4">Danh Sách Đen</th>
                <th class="px-6 py-4">Ngày Tham Gia</th>
                <th class="px-6 py-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody id="members-tbody" class="divide-y divide-gray-50">
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100" id="members-pagination"></div>
      </div>
    </div>
  `;

  // Search input
  let timer;
  container.querySelector('#members-search').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadMembers(container);
    }, 300);
  });

  // Export CSV
  container.querySelector('#members-export-btn').addEventListener('click', () => {
    exportMembersToCSV(state, showToast);
  });

  const closeAllDropdowns = () => {
    container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
  };
  document.addEventListener('click', closeAllDropdowns);
  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeAllDropdowns);
  });

  loadMembers(container);
}
async function loadMembers(container) {
  const tbody = container.querySelector('#members-tbody');
  tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>`;

  try {
    const res = await getMembers({
      page: state.page,
      limit: state.limit,
      search: state.search,
      rank: state.rank
    });

    state.data = res.data || [];
    state.total = Number(res.meta?.total ?? state.data.length);

    renderRows(container);
    renderMembersPageNav(container, state, loadMembers, createPagination);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-500 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}



function renderRows(container) {
  const tbody = container.querySelector('#members-tbody');
  if (!state.data.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400 text-sm">Không tìm thấy khách hàng nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  state.data.forEach((user) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors text-gray-700';
    tr.innerHTML = `
      <td class="px-6 py-4">
        <button class="view-detail-btn text-left group">
          <div class="font-medium text-gray-900 group-hover:text-[#C9A84C] group-hover:underline transition-colors cursor-pointer">${user.full_name || 'Khách ẩn danh'}</div>
          <div class="text-xs text-gray-400">${user.email || '—'}</div>
        </button>
      </td>
      <td class="px-6 py-4 font-mono text-xs">${user.phone || '—'}</td>
      <td class="px-6 py-4 font-medium text-gray-800">${Number(user.total_spend).toLocaleString('vi-VN')}đ</td>
      <td class="px-6 py-4 font-bold text-gray-900 hidden">${Number(user.points).toLocaleString('vi-VN')}</td>
      <td class="px-6 py-4">
        ${user.is_blacklisted == 1
          ? '<span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">Blacklisted</span>'
          : '<span class="text-gray-300 text-xs">—</span>'}
      </td>
      <td class="px-6 py-4 text-xs text-gray-400">${new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
      <td class="px-6 py-4 text-right relative">
        <div class="inline-block text-left dropdown-wrapper">
          <button class="dropdown-trigger p-1.5 text-gray-500 hover:bg-gray-150 rounded-lg hover:text-gray-800 transition border-none bg-transparent cursor-pointer" title="Thao tác">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <div class="dropdown-menu hidden absolute right-6 top-9 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 font-medium text-left">
            <button class="view-detail-btn2 w-full text-left px-3 py-1.5 text-zinc-700 hover:bg-gray-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer">
              Chi tiết
            </button>
            <button class="view-history-btn w-full text-left px-3 py-1.5 text-zinc-700 hover:bg-gray-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer hidden">
              Lịch sử điểm
            </button>
            <button class="adjust-points-btn w-full text-left px-3 py-1.5 text-[#C9A84C] hover:bg-amber-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer hidden">
              Sửa Điểm
            </button>
          </div>
        </div>
      </td>
    `;

    const openDetail = (userId) => {
      window.location.hash = `#members/${userId}`;
    };

    const trigger = tr.querySelector('.dropdown-trigger');
    const menu = tr.querySelector('.dropdown-menu');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      container.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu.classList.toggle('hidden');
    });

    tr.querySelector('.view-detail-btn').addEventListener('click', () => openDetail(user.id));
    tr.querySelector('.view-detail-btn2').addEventListener('click', () => openDetail(user.id));
    tr.querySelector('.view-history-btn').addEventListener('click', () => showHistoryModal(user));
    tr.querySelector('.adjust-points-btn').addEventListener('click', () => showAdjustPointsModal(user, () => loadMembers(container)));
    tbody.appendChild(tr);
  });
}

function showHistoryModal(user) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto';
  modal.setAttribute('data-lenis-prevent', 'true');
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Lịch sử tích lũy điểm</h3>
          <p class="text-xs text-gray-500 mt-0.5">Khách hàng: ${user.full_name} (${user.phone})</p>
        </div>
        <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4" id="history-content">
        <div class="text-center py-4 text-gray-400 text-sm">Đang tải lịch sử...</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-modal-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  loadPointsHistory(user.id, modal.querySelector('#history-content'));
}

async function loadPointsHistory(userId, container) {
  try {
    const res = await getMemberPointsHistory(userId);
    const logs = res.data || [];
    if (!logs.length) {
      container.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Khách hàng chưa có lịch sử giao dịch điểm.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
        ${logs.map(log => `
          <div class="py-3 flex items-center justify-between text-sm">
            <div>
              <div class="font-medium text-gray-800">${log.description || 'Giao dịch điểm'}</div>
              <div class="text-xs text-gray-400">${new Date(log.created_at).toLocaleString('vi-VN')}</div>
            </div>
            <div class="font-bold ${log.action_type === 'earn' || log.action_type === 'welcome_bonus' ? 'text-green-600' : 'text-red-600'}">
              ${log.action_type === 'earn' || log.action_type === 'welcome_bonus' ? '+' : '-'}${log.points}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="text-center py-8 text-red-500 text-sm">${err.message || 'Lỗi tải lịch sử'}</div>`;
  }
}

function showAdjustPointsModal(user, reloadCallback) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50';
  modal.setAttribute('data-lenis-prevent', 'true');
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-gray-900">Điều chỉnh điểm & Blacklist</h3>
        <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Blacklist toggle first -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div class="text-sm font-bold text-gray-800">Danh sách đen (Blacklist)</div>
            <div class="text-xs text-gray-500">Chặn tạo yêu cầu đổi trả hàng</div>
          </div>
          <button id="toggle-blacklist-btn" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${user.is_blacklisted == 1 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
            ${user.is_blacklisted == 1 ? 'Mở Khóa' : 'Khóa'}
          </button>
        </div>

        <div class="border-t border-gray-100 pt-3">
          <div class="text-xs font-bold text-gray-500 uppercase mb-2">Cộng / Trừ Điểm</div>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Số lượng điểm (dùng số âm để trừ điểm)</label>
              <input type="number" id="adjust-pts-val" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="Ví dụ: 1000 hoặc -500">
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Lý do</label>
              <input type="text" id="adjust-pts-reason" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="Ví dụ: Tặng quà sinh nhật">
            </div>
            <button id="submit-adjust-btn" class="w-full py-2 bg-gray-950 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">Xác nhận điều chỉnh</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const close = () => modal.remove();

  modal.querySelector('#close-modal-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Blacklist action
  modal.querySelector('#toggle-blacklist-btn').addEventListener('click', async () => {
    if (!hasPermission('users:blacklist')) {
      showToast('Bạn không có quyền thực hiện chức năng này.', 'error');
      return;
    }
    try {
      await toggleMemberBlacklist(user.id);
      showToast('Cập nhật trạng thái blacklist thành công');
      close();
      reloadCallback();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Points action
  modal.querySelector('#submit-adjust-btn').addEventListener('click', async () => {
    const pts = parseInt(modal.querySelector('#adjust-pts-val').value);
    const reason = modal.querySelector('#adjust-pts-reason').value.trim();

    if (isNaN(pts) || pts === 0) {
      alert('Vui lòng nhập số điểm hợp lệ khác 0.');
      return;
    }
    if (!reason) {
      alert('Vui lòng cung cấp lý do điều chỉnh.');
      return;
    }

    try {
      await adjustMemberPoints(user.id, pts, reason);
      showToast('Đã điều chỉnh điểm tích lũy');
      close();
      reloadCallback();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
