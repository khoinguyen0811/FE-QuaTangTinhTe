import { getVariantTypes, deleteVariantType } from '../../../services/adminService.js';
import { createConfirmDialog, showToast } from '../shared/ui.js';
import { openVariantTypeForm } from './VariantTypeForm.js';

const SKELETON_ROWS = Array(2).fill(0).map(() => `
  <tr>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-32"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-40"></div></td>
    <td class="px-4 py-4"><div class="skeleton-shimmer h-4 w-16"></div></td>
    <td class="px-4 py-4 text-right"><div class="skeleton-shimmer h-8 w-16 ml-auto rounded-lg"></div></td>
  </tr>
`).join('');

let state = { data: [] };

export function renderVariantTypesTable(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h3 class="text-base font-semibold text-gray-900">Danh Sách Loại Biến Thể</h3>
          <p class="text-xs text-gray-500">Các thuộc tính dùng để phân loại biến thể sản phẩm</p>
        </div>
        <button id="vt-add-btn"
          class="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#b8963e] transition-colors flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Thêm loại biến thể
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã code (Name)</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tên hiển thị</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Loại</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody id="vt-tbody" class="divide-y divide-gray-50">
            ${SKELETON_ROWS}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Add button binding
  container.querySelector('#vt-add-btn').addEventListener('click', () => {
    openVariantTypeForm(null, () => loadVariantTypes(container));
  });

  const closeAllDropdowns = () => {
    container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
  };
  document.addEventListener('click', closeAllDropdowns);
  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeAllDropdowns);
  });

  loadVariantTypes(container);
}

async function loadVariantTypes(container) {
  const tbody = container.querySelector('#vt-tbody');
  tbody.innerHTML = SKELETON_ROWS;

  try {
    const res = await getVariantTypes();
    state.data = Array.isArray(res.data) ? res.data : [];
    renderRows(container);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-red-400 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#vt-tbody');
  if (!state.data.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-gray-400 text-sm">Chưa có loại biến thể nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  state.data.forEach((t) => {
    const isSystem = t.name === 'size' || t.name === 'color';
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3 text-gray-600 font-mono text-xs">${t.name}</td>
      <td class="px-4 py-3 font-medium text-gray-900">${t.display_name}</td>
      <td class="px-4 py-3">
        ${isSystem 
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800">Hệ thống</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Tùy biến</span>`
        }
      </td>
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
            <button class="del-btn w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-35" ${isSystem ? 'disabled' : ''}>
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

    tr.querySelector('.edit-btn').addEventListener('click', () => {
      openVariantTypeForm(t, () => loadVariantTypes(container));
    });

    if (!isSystem) {
      tr.querySelector('.del-btn').addEventListener('click', () => {
        createConfirmDialog(`Xác nhận xóa loại biến thể "${t.display_name}" (${t.name})? Tất cả các giá trị biến thể liên quan sẽ bị xóa!`, async () => {
          try {
            await deleteVariantType(t.id);
            showToast('Đã xóa loại biến thể thành công!');
            loadVariantTypes(container);
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
      });
    }

    tbody.appendChild(tr);
  });
}
