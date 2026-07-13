import { getPromotions, deletePromotion, togglePromotionStatus } from '../../../services/adminService.js';
import { showToast } from '../shared/ui.js';

let allPromotions = [];
let currentFilter = 'all'; // 'all', 'coupon', 'automatic', 'buy_x_get_y', 'gift', 'freeship', 'running', 'scheduled', 'ended', 'disabled'
let searchQuery = '';

export async function renderVouchersTab(wrap, onEditPromotion = null) {
  wrap.innerHTML = `
    <div class="space-y-6" style="font-family: 'Quicksand', sans-serif;">
      <!-- Top Filters & Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <input type="text" id="promo-search" class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5d58f0]" placeholder="Tìm theo tên hoặc mã khuyến mãi...">
          <span class="absolute left-3 top-2.5 text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
        </div>

        <!-- Filter Select (Mobile/Desktop dropdown fallback) -->
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Lọc theo:</label>
          <select id="promo-filter-select" class="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#5d58f0] bg-white">
            <option value="all">Tất cả chương trình</option>
            <option value="coupon">Mã giảm giá</option>
            <option value="automatic">Tự động</option>
            <option value="buy_x_get_y">Mua X tặng Y</option>
            <option value="gift">Quà tặng</option>
            <option value="freeship">Freeship</option>
            <option value="running">Đang chạy</option>
            <option value="scheduled">Sắp diễn ra</option>
            <option value="ended">Đã kết thúc</option>
            <option value="disabled">Đã tắt</option>
          </select>
        </div>
      </div>

      <!-- Quick Filter Pills -->
      <div class="flex flex-wrap gap-2">
        ${[
          { id: 'all', label: 'Tất cả' },
          { id: 'coupon', label: 'Mã giảm giá' },
          { id: 'automatic', label: 'Tự động' },
          { id: 'buy_x_get_y', label: 'Mua X tặng Y' },
          { id: 'gift', label: 'Quà tặng' },
          { id: 'freeship', label: 'Freeship' },
          { id: 'running', label: 'Đang chạy' },
          { id: 'scheduled', label: 'Sắp diễn ra' },
          { id: 'ended', label: 'Đã kết thúc' },
          { id: 'disabled', label: 'Đã tắt' }
        ].map(pill => `
          <button class="filter-pill px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${currentFilter === pill.id ? 'bg-[#5d58f0] text-white border-[#5d58f0] shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}" data-filter="${pill.id}">
            ${pill.label}
          </button>
        `).join('')}
      </div>

      <!-- List Container -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50/75 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 font-bold">Chương trình</th>
                <th class="px-6 py-4 font-bold text-center">Loại</th>
                <th class="px-6 py-4 font-bold">Điều kiện</th>
                <th class="px-6 py-4 font-bold">Ưu đãi</th>
                <th class="px-6 py-4 font-bold">Thời gian</th>
                <th class="px-6 py-4 font-bold text-center">Đã dùng</th>
                <th class="px-6 py-4 font-bold text-center">Trạng thái</th>
                <th class="px-6 py-4 font-bold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody id="promo-list-tbody" class="divide-y divide-gray-100">
              <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-400 font-medium">Đang tải danh sách khuyến mãi...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Bind events
  const searchInput = wrap.querySelector('#promo-search');
  searchInput.value = searchQuery;
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    filterAndRender(wrap, onEditPromotion);
  });

  const filterSelect = wrap.querySelector('#promo-filter-select');
  filterSelect.value = currentFilter;
  filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    updatePillsActiveState(wrap);
    filterAndRender(wrap, onEditPromotion);
  });

  wrap.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      currentFilter = e.target.getAttribute('data-filter');
      filterSelect.value = currentFilter;
      updatePillsActiveState(wrap);
      filterAndRender(wrap, onEditPromotion);
    });
  });

  // Load promotions list
  await fetchAndPopulate(wrap, onEditPromotion);
}

function updatePillsActiveState(wrap) {
  wrap.querySelectorAll('.filter-pill').forEach(pill => {
    const f = pill.getAttribute('data-filter');
    if (f === currentFilter) {
      pill.className = 'filter-pill px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all bg-[#5d58f0] text-white border-[#5d58f0] shadow-sm';
    } else {
      pill.className = 'filter-pill px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300';
    }
  });
}

async function fetchAndPopulate(wrap, onEditPromotion) {
  try {
    const res = await getPromotions();
    allPromotions = res.data || [];
    filterAndRender(wrap, onEditPromotion);
  } catch (err) {
    showToast('Lỗi tải danh sách khuyến mãi: ' + err.message, 'error');
  }
}

function filterAndRender(wrap, onEditPromotion) {
  const tbody = wrap.querySelector('#promo-list-tbody');
  if (!tbody) return;

  const now = new Date();

  const filtered = allPromotions.filter(promo => {
    // 1. Search Query
    const nameMatch = promo.name?.toLowerCase().includes(searchQuery);
    const codeMatch = promo.code?.toLowerCase().includes(searchQuery);
    if (searchQuery && !nameMatch && !codeMatch) return false;

    // 2. Filters
    const starts = promo.starts_at ? new Date(promo.starts_at) : null;
    const ends = promo.ends_at ? new Date(promo.ends_at) : null;
    const isActive = parseInt(promo.is_active) === 1;

    switch (currentFilter) {
      case 'running':
        return isActive && (!starts || starts <= now) && (!ends || ends >= now);
      case 'scheduled':
        return isActive && starts && starts > now;
      case 'ended':
        return isActive && ends && ends < now;
      case 'disabled':
        return !isActive;
      case 'coupon':
        return promo.promotion_type === 'coupon';
      case 'automatic':
        return promo.promotion_type === 'automatic';
      case 'buy_x_get_y':
        return promo.discount_type === 'buy_x_get_y';
      case 'gift':
        return promo.discount_type === 'gift';
      case 'freeship':
        return promo.discount_type === 'free_shipping';
      default:
        return true;
    }
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy chương trình khuyến mãi nào phù hợp.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(promo => {
    const starts = promo.starts_at ? new Date(promo.starts_at) : null;
    const ends = promo.ends_at ? new Date(promo.ends_at) : null;
    const active = parseInt(promo.is_active) === 1;

    // Determine status badge
    let statusBadge = '';
    if (!active) {
      statusBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Đã tắt</span>`;
    } else if (starts && starts > now) {
      statusBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">Sắp diễn ra</span>`;
    } else if (ends && ends < now) {
      statusBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600">Đã kết thúc</span>`;
    } else {
      statusBadge = `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600">Đang chạy</span>`;
    }

    // Determine type badge and style
    let badgeClass = '';
    let typeLabel = '';
    if (promo.discount_type === 'buy_x_get_y') {
      typeLabel = 'Buy X Get Y';
      badgeClass = 'bg-purple-50 text-purple-600 border border-purple-100';
    } else if (promo.discount_type === 'free_shipping') {
      typeLabel = 'Freeship';
      badgeClass = 'bg-blue-50 text-blue-600 border border-blue-100';
    } else if (promo.discount_type === 'gift') {
      typeLabel = 'Quà tặng';
      badgeClass = 'bg-pink-50 text-pink-600 border border-pink-100';
    } else if (promo.promotion_type === 'coupon') {
      typeLabel = 'Mã giảm giá';
      badgeClass = 'bg-amber-50 text-amber-600 border border-amber-100';
    } else {
      typeLabel = 'Tự động';
      badgeClass = 'bg-green-50 text-green-600 border border-green-100';
    }

    const conditionsText = formatConditionsSummary(promo);
    const rewardsText = formatRewardsSummary(promo);

    return `
      <tr class="hover:bg-gray-50/50 transition-colors">
        <td class="px-6 py-4 font-semibold text-gray-800">
          <div class="text-sm font-bold text-gray-900">${promo.name}</div>
          ${promo.code ? `<div class="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded w-fit mt-1 font-bold">Mã: ${promo.code}</div>` : ''}
          <div class="text-xs text-gray-400 font-normal mt-1">${promo.description || ''}</div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass}">
            ${typeLabel}
          </span>
        </td>
        <td class="px-6 py-4 text-xs text-gray-600 leading-relaxed font-medium">
          ${conditionsText}
        </td>
        <td class="px-6 py-4 text-sm text-[#5d58f0] font-bold leading-normal">
          ${rewardsText}
        </td>
        <td class="px-6 py-4 text-xs text-gray-500 font-medium">
          <div>Từ: ${promo.starts_at ? formatDate(promo.starts_at) : 'Kích hoạt ngay'}</div>
          <div class="mt-0.5">Đến: ${promo.ends_at ? formatDate(promo.ends_at) : 'Vô thời hạn'}</div>
        </td>
        <td class="px-6 py-4 text-center font-bold text-gray-700 text-sm">
          ${promo.usage_count} / ${promo.usage_limit || '∞'}
        </td>
        <td class="px-6 py-4 text-center">${statusBadge}</td>
        <td class="px-6 py-4">
          <div class="flex items-center justify-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer status-toggle" data-id="${promo.id}" ${active ? 'checked' : ''}>
              <div class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5d58f0]"></div>
            </label>

            <!-- Edit Action -->
            <button class="edit-promo-btn text-gray-400 hover:text-[#5d58f0] transition-colors" data-id="${promo.id}" title="Sửa">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>

            <!-- Delete Action -->
            <button class="delete-promo-btn text-gray-400 hover:text-red-600 transition-colors" data-id="${promo.id}" title="Xóa">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Actions
  tbody.querySelectorAll('.status-toggle').forEach(chk => {
    chk.addEventListener('change', async (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      const active = e.target.checked ? 1 : 0;
      try {
        await togglePromotionStatus(id, active);
        showToast('Cập nhật trạng thái thành công!', 'success');
        const p = allPromotions.find(x => x.id === id);
        if (p) p.is_active = active;
        filterAndRender(wrap, onEditPromotion);
      } catch (err) {
        showToast('Lỗi cập nhật trạng thái: ' + err.message, 'error');
        e.target.checked = !e.target.checked;
      }
    });
  });

  tbody.querySelectorAll('.edit-promo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.currentTarget;
      const id = parseInt(btnEl.getAttribute('data-id'));
      if (onEditPromotion) {
        onEditPromotion(id);
      }
    });
  });

  tbody.querySelectorAll('.delete-promo-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget;
      const id = parseInt(btnEl.getAttribute('data-id'));
      if (!confirm('Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không?')) return;
      try {
        await deletePromotion(id);
        showToast('Xóa chương trình khuyến mãi thành công!', 'success');
        allPromotions = allPromotions.filter(x => x.id !== id);
        filterAndRender(wrap, onEditPromotion);
      } catch (err) {
        showToast('Lỗi xóa chương trình: ' + err.message, 'error');
      }
    });
  });
}

function formatConditionsSummary(promo) {
  const summaries = [];
  if (promo.min_order_amount && parseFloat(promo.min_order_amount) > 0) {
    summaries.push(`Đơn từ <strong>${parseFloat(promo.min_order_amount).toLocaleString()}đ</strong>`);
  }
  if (promo.min_quantity && parseInt(promo.min_quantity) > 0) {
    summaries.push(`Mua từ <strong>${promo.min_quantity}</strong> sp`);
  }
  
  // Check product scope
  const prodCond = promo.conditions?.find(c => c.condition_type === 'product');
  if (prodCond) {
    try {
      const ids = JSON.parse(prodCond.value_json);
      if (Array.isArray(ids) && ids.length > 0) {
        summaries.push(`Sản phẩm: <strong>${ids.length} sp chỉ định</strong>`);
      }
    } catch (e) {}
  }

  // Check category scope
  const catCond = promo.conditions?.find(c => c.condition_type === 'category');
  if (catCond) {
    try {
      const ids = JSON.parse(catCond.value_json);
      if (Array.isArray(ids) && ids.length > 0) {
        summaries.push(`Danh mục: <strong>${ids.length} nhóm</strong>`);
      }
    } catch (e) {}
  }

  // Check variant scope
  const varCond = promo.conditions?.find(c => c.condition_type === 'variant');
  if (varCond) {
    try {
      const ids = JSON.parse(varCond.value_json);
      if (Array.isArray(ids) && ids.length > 0) {
        summaries.push(`Biến thể: <strong>${ids.length} loại</strong>`);
      }
    } catch (e) {}
  }

  // Check customer rank scope
  const rankCond = promo.conditions?.find(c => c.condition_type === 'customer_group');
  if (rankCond) {
    try {
      const ranks = JSON.parse(rankCond.value_json);
      if (Array.isArray(ranks) && ranks.length > 0) {
        summaries.push(`Hạng: <strong>${ranks.join(', ')}</strong>`);
      }
    } catch (e) {}
  }

  return summaries.length > 0 ? summaries.join('<br>') : 'Không giới hạn';
}

function formatRewardsSummary(promo) {
  let rewardText = '';
  if (promo.discount_type === 'percentage') {
    rewardText = `Giảm <strong>${parseFloat(promo.value)}%</strong>`;
    if (promo.max_discount_amount && parseFloat(promo.max_discount_amount) > 0) {
      rewardText += `<br><span class="text-[10px] text-gray-400 font-medium">Tối đa ${parseFloat(promo.max_discount_amount).toLocaleString()}đ</span>`;
    }
  } else if (promo.discount_type === 'fixed_amount') {
    rewardText = `Giảm <strong>${parseFloat(promo.value).toLocaleString()}đ</strong>`;
  } else if (promo.discount_type === 'free_shipping') {
    rewardText = `<strong>Freeship</strong>`;
  } else if (promo.discount_type === 'gift' || promo.discount_type === 'buy_x_get_y') {
    const giftRew = promo.rewards?.find(r => r.reward_type === 'gift_product' || r.reward_type === 'gift_variant');
    if (giftRew) {
      rewardText = `Tặng <strong>${giftRew.quantity || 1} quà tặng</strong>`;
    } else {
      rewardText = `Tặng quà tặng`;
    }
  } else {
    rewardText = promo.discount_type;
  }
  return rewardText;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', { hour12: false });
}
