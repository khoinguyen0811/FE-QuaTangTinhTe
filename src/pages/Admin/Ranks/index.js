import { getRanks, createRank, updateRank, deleteRank } from '../../../services/adminService.js';
import { showToast } from '../shared/ui.js';
import { getMidpoint } from './RankOrdering.js';

let ranksData = [];
let editingRankId = null;



export function renderRanks(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900 font-sans uppercase tracking-wider">Cấu Hình Cấp Bậc Hạng Thành Viên</h2>
          <p class="text-sm text-gray-500 mt-0.5 font-medium">Thiết lập các mốc chi tiêu để tự động thăng/hạ hạng VIP cho khách hàng</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Rank Form (Left side) -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit space-y-4">
          <h3 id="form-title" class="text-sm font-bold text-gray-800 uppercase tracking-wider">Tạo Hạng Thành Viên Mới</h3>
          <form id="rank-form" class="space-y-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Tên Hạng VIP</label>
              <input type="text" id="rank-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="Ví dụ: Silver, Gold, Platinum">
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Yêu Cầu Chi Tiêu Tối Thiểu (đ)</label>
              <input type="text" id="rank-min-spend" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="Ví dụ: 5.000.000đ">
              <!-- Suggestions container (Currency Input with Suggestions) -->
              <div id="rank-min-spend-suggestions" class="flex flex-wrap gap-2 mt-1.5"></div>
            </div>

            <div class="flex gap-2 pt-2">
              <button type="submit" id="submit-btn" class="flex-1 py-2 bg-gray-950 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">Kích Hoạt Hạng</button>
              <button type="button" id="cancel-edit-btn" class="hidden px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Hủy</button>
            </div>
          </form>
        </div>

        <!-- Rank List (Right side) -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th class="px-6 py-4">Tên Hạng</th>
                  <th class="px-6 py-4">Chi Tiêu Yêu Cầu</th>
                  <th class="px-6 py-4">Thứ Tự</th>
                  <th class="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="ranks-tbody" class="divide-y divide-gray-50">
                <tr>
                  <td colspan="4" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải danh sách hạng...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#rank-form');
  const cancelBtn = container.querySelector('#cancel-edit-btn');
  const minSpendInput = container.querySelector('#rank-min-spend');
  const minSpendSuggestions = container.querySelector('#rank-min-spend-suggestions');

  function formatInputWithSelection(input, isPercentage = false) {
    const value = input.value;
    const selectionStart = input.selectionStart;
    
    // Count how many digits exist before the cursor currently
    let digitsBeforeCursor = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/\d/.test(value[i])) {
        digitsBeforeCursor++;
      }
    }
    
    // Extract digits only
    let digits = value.replace(/\D/g, '');
    if (!digits) {
      input.value = '';
      return;
    }
    
    // Format value
    let formatted = '';
    if (isPercentage) {
      let num = Math.min(100, parseInt(digits, 10) || 0);
      formatted = num + '%';
    } else {
      formatted = Number(digits).toLocaleString('vi-VN') + 'đ';
    }
    
    input.value = formatted;
    
    // Calculate new cursor position
    let newCursorPos = 0;
    let digitsCount = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitsCount++;
        if (digitsCount === digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }
    }
    
    if (digitsCount < digitsBeforeCursor || newCursorPos === 0) {
      newCursorPos = formatted.length - 1;
    }
    
    if (newCursorPos > formatted.length - 1) {
      newCursorPos = formatted.length - 1;
    }
    
    input.setSelectionRange(newCursorPos, newCursorPos);
  }

  // Helper for "Currency Input with Suggestions" (Trường nhập tiền tệ định dạng động có nút chọn nhanh)
  function setupCurrencyInput(input, suggestionsContainer, suggestionOpts) {
    suggestionsContainer.innerHTML = suggestionOpts.map(opt => `
      <button type="button" class="sugg-btn px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition-colors focus:outline-none" data-val="${opt.val}">
        ${opt.label}
      </button>
    `).join('');

    suggestionsContainer.querySelectorAll('.sugg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = Number(btn.dataset.val).toLocaleString('vi-VN') + 'đ';
      });
    });

    input.addEventListener('input', () => {
      formatInputWithSelection(input, false);
    });
  }

  // Bind dynamic formatting and price suggestions
  setupCurrencyInput(minSpendInput, minSpendSuggestions, [
    { label: '0đ', val: 0 },
    { label: '3tr', val: 3000000 },
    { label: '5tr', val: 5000000 },
    { label: '10tr', val: 10000000 },
    { label: '15tr', val: 15000000 },
    { label: '20tr', val: 20000000 }
  ]);

  // Submit Handler (Create/Update)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newMinSpend = parseFloat(container.querySelector('#rank-min-spend').value.replace(/\D/g, '')) || 0;
    
    // Auto-calculate sort_order based on min_spend position
    const otherRanks = ranksData
      .filter(r => r.id !== editingRankId)
      .sort((a, b) => Number(a.min_spend) - Number(b.min_spend));
    
    // Find insert position by min_spend
    let insertIdx = otherRanks.findIndex(r => Number(r.min_spend) > newMinSpend);
    if (insertIdx === -1) insertIdx = otherRanks.length;
    
    const prev = insertIdx > 0 ? otherRanks[insertIdx - 1] : null;
    const next = insertIdx < otherRanks.length ? otherRanks[insertIdx] : null;
    const newSortOrder = getMidpoint(prev?.sort_order, next?.sort_order);

    const payload = {
      name: container.querySelector('#rank-name').value.trim(),
      min_spend: newMinSpend,
      sort_order: newSortOrder
    };

    try {
      if (editingRankId) {
        await updateRank(editingRankId, payload);
        showToast('Cập nhật hạng thành viên thành công');
      } else {
        await createRank(payload);
        showToast('Tạo hạng thành viên mới thành công');
      }
      resetForm(container);
      loadRanksList(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  cancelBtn.addEventListener('click', () => {
    resetForm(container);
  });

  const closeAllDropdowns = () => {
    container.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
  };
  document.addEventListener('click', closeAllDropdowns);
  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeAllDropdowns);
  });

  loadRanksList(container);
}

function resetForm(container) {
  editingRankId = null;
  const form = container.querySelector('#rank-form');
  form.reset();
  container.querySelector('#form-title').textContent = 'Tạo Hạng Thành Viên Mới';
  container.querySelector('#submit-btn').textContent = 'Kích Hoạt Hạng';
  container.querySelector('#cancel-edit-btn').classList.add('hidden');
}

async function loadRanksList(container) {
  const tbody = container.querySelector('#ranks-tbody');
  try {
    const res = await getRanks();
    ranksData = (res.data || []).sort((a, b) => Number(a.min_spend) - Number(b.min_spend));
    if (!ranksData.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400 text-sm">Chưa cấu hình hạng thành viên nào</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    ranksData.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'text-gray-700 text-sm hover:bg-gray-50 transition-colors';

      tr.innerHTML = `
        <td class="px-6 py-4 font-bold text-gray-900">${item.name}</td>
        <td class="px-6 py-4 font-semibold text-amber-600">${Number(item.min_spend).toLocaleString('vi-VN')}đ</td>
        <td class="px-6 py-4"><span class="px-2 py-0.5 text-xs font-bold rounded bg-zinc-100 text-zinc-800">Hạng ${index + 1}</span></td>
        <td class="px-6 py-4 text-right relative pr-6">
          <div class="inline-block text-left dropdown-wrapper">
            <button class="dropdown-trigger p-1.5 text-gray-500 hover:bg-gray-150 rounded-lg hover:text-gray-800 transition border-none bg-transparent cursor-pointer" title="Thao tác">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            <div class="dropdown-menu hidden absolute right-6 top-9 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 font-medium text-left">
              <button class="edit-rank-btn w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer" data-id="${item.id}">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Sửa
              </button>
              <button class="del-rank-btn w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-bold transition-all border-none bg-transparent cursor-pointer" data-id="${item.id}">
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

      // Edit Event
      tr.querySelector('.edit-rank-btn').addEventListener('click', () => {
        editingRankId = item.id;
        container.querySelector('#rank-name').value = item.name;
        container.querySelector('#rank-min-spend').value = Number(item.min_spend).toLocaleString('vi-VN') + 'đ';
        
        container.querySelector('#form-title').textContent = 'Cập Nhật Hạng';
        container.querySelector('#submit-btn').textContent = 'Cập Nhật';
        container.querySelector('#cancel-edit-btn').classList.remove('hidden');
      });

      // Delete Event
      tr.querySelector('.del-rank-btn').addEventListener('click', async () => {
        if (!confirm(`Xác nhận xóa hạng "${item.name}"? Thao tác này sẽ xóa vĩnh viễn cấu hình hạng.`)) return;
        try {
          await deleteRank(item.id);
          showToast('Xóa hạng thành viên thành công');
          loadRanksList(container);
          if (editingRankId === item.id) {
            resetForm(container);
          }
        } catch (err) {
          showToast(err.message, 'error');
        }
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-red-500 text-sm">${err.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}
