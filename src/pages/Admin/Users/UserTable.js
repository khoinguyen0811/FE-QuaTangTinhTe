import { getUsers, updateUser } from '../../../services/adminService.js';
import { createConfirmDialog, showToast, createPagination, formatDate, hasPermission } from '../shared/ui.js?v=1.0.82';
import { openUserForm } from './UserForm.js';
import { renderRoleBadges } from './UserRoleBadge.js';

const PAGE_SIZE = 20;
let state = { page: 1, search: '', total: 0, data: [], sortDir: {} };

const SKELETON_ROWS = Array(5).fill(0).map(() => `
  <tr>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-8"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-24"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-36"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-20"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-6 w-16 rounded-full"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-5 w-20 rounded-full"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-24"></div></td>
    <td class="px-4 py-4 text-right"><div class="skeleton-shimmer h-8 w-16 ml-auto rounded-lg"></div></td>
  </tr>
`).join('');

export function renderUserTable(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
        <div class="relative w-full sm:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input id="user-search" class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="Tìm theo email, tên..." value="${state.search}">
        </div>
        <button id="user-add-btn" class="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e] flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm người dùng
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="id">
                <span class="flex items-center gap-1">ID <span class="sort-icon text-gray-300">⇅</span></span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="name">
                <span class="flex items-center gap-1">Tên <span class="sort-icon text-gray-300">⇅</span></span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Điện thoại</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 sort-th" data-col="date">
                <span class="flex items-center gap-1">Ngày tạo <span class="sort-icon text-gray-300">⇅</span></span>
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody id="user-tbody" class="divide-y divide-gray-50">
            ${SKELETON_ROWS}
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-gray-100" id="user-pagination"></div>
    </div>
  `;

  let searchTimer;
  container.querySelector('#user-search').addEventListener('input', (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = event.target.value.trim();
      state.page = 1;
      loadUsers(container);
    }, 300);
  });

  container.querySelector('#user-add-btn').addEventListener('click', () => {
    if (!hasPermission('users:write')) {
      showToast('Bạn không có quyền thực hiện chức năng này.', 'error');
      return;
    }
    openUserForm(null, () => loadUsers(container));
  });

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

  loadUsers(container);
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
    if (col === 'id')   { va = a.id; vb = b.id; return (va - vb) * factor; }
    if (col === 'name') { va = (a.full_name || a.name || '').toLowerCase(); vb = (b.full_name || b.name || '').toLowerCase(); return va.localeCompare(vb) * factor; }
    if (col === 'date') { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); return (va - vb) * factor; }
    return 0;
  });
}

async function loadUsers(container) {
  const tbody = container.querySelector('#user-tbody');
  tbody.innerHTML = SKELETON_ROWS;

  try {
    const res = await getUsers({ page: state.page, limit: PAGE_SIZE, search: state.search });
    const items = Array.isArray(res.data) ? res.data : [];
    state.total = Number(res.meta?.total ?? items.length);
    state.data = items;
    renderRows(container);
    renderPageNav(container);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-red-400 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#user-tbody');
  const rows = getSorted(state.data);

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-10 text-center text-gray-400 text-sm">Chưa có người dùng nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  rows.forEach((user) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors';
    const roles = user.roles || [];
    const isActive = user.is_active !== false && Number(user.is_active) !== 0;
    const isSuperAdminUser = user.email === 'admin@slyclothing.vn' || Number(user.id) === 1 || user.email === 'system';

    tr.innerHTML = `
      <td class="px-4 py-3 text-xs text-gray-400 font-mono">${user.id}</td>
      <td class="px-4 py-3 font-medium text-gray-900">${user.full_name || user.name || '-'}</td>
      <td class="px-4 py-3 text-gray-600 text-xs">${user.email || '-'}</td>
      <td class="px-4 py-3 text-gray-600 text-xs">${user.phone || '-'}</td>
      <td class="px-4 py-3">${renderRoleBadges(roles)}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 text-xs rounded-full font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
          ${isActive ? 'Hoạt động' : 'Vô hiệu'}
        </span>
      </td>
      <td class="px-4 py-3 text-xs text-gray-500">${formatDate(user.created_at)}</td>
      <td class="px-4 py-3 text-right relative whitespace-nowrap">
        <div class="flex items-center justify-end gap-1">
          ${isSuperAdminUser ? `
            <span class="text-xs text-gray-400 font-medium px-2 py-1 flex items-center gap-1 select-none bg-gray-100 rounded-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Hệ thống
            </span>
          ` : `
            <div class="inline-block text-left dropdown-wrapper">
              <button class="dropdown-trigger p-1.5 text-gray-500 hover:bg-gray-150 rounded-lg hover:text-gray-800 transition border-none bg-transparent cursor-pointer" title="Thao tác">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
              <div class="dropdown-menu hidden absolute right-4 top-9 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 font-medium text-left">
                <button class="edit-btn w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Sửa
                </button>
                <button class="toggle-active-btn w-full text-left px-3 py-1.5 ${isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} text-xs font-bold transition-all border-none bg-transparent cursor-pointer">
                  ${isActive ? `
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Khóa
                  ` : `
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                    Mở khóa
                  `}
                </button>
              </div>
            </div>
          `}
        </div>
      </td>
    `;

    if (!isSuperAdminUser) {
      const trigger = tr.querySelector('.dropdown-trigger');
      const menu = tr.querySelector('.dropdown-menu');
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        container.querySelectorAll('.dropdown-menu').forEach(m => {
          if (m !== menu) m.classList.add('hidden');
        });
        menu.classList.toggle('hidden');
      });

      tr.querySelector('.edit-btn').addEventListener('click', () => {
        if (!hasPermission('users:write')) {
          showToast('Bạn không có quyền thực hiện chức năng này.', 'error');
          return;
        }
        openUserForm(user, () => loadUsers(container));
      });

      tr.querySelector('.toggle-active-btn').addEventListener('click', () => {
        if (!hasPermission('users:write')) {
          showToast('Bạn không có quyền thực hiện chức năng này.', 'error');
          return;
        }
        const label = isActive ? 'khóa' : 'mở khóa';
        createConfirmDialog(`Bạn có chắc chắn muốn ${label} tài khoản "${user.full_name || user.email}"?`, async () => {
          try {
            await updateUser(user.id, { is_active: isActive ? 0 : 1 });
            showToast(`Đã ${label} thành công`);
            loadUsers(container);
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
      });
    }

    tbody.appendChild(tr);
  });
}

function renderPageNav(container) {
  const wrap = container.querySelector('#user-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / PAGE_SIZE);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadUsers(container);
  }));
}
