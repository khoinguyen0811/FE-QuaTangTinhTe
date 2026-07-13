import { getReviews, replyToReview, updateReviewStatus, bulkUploadReviews } from '../../../services/adminService.js';
import { showToast, createPagination } from '../shared/ui.js';

let state = { page: 1, limit: 10, status: '', total: 0, data: [], search: '' };

export function renderReviews(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Quản Lý Đánh Giá Sản Phẩm</h2>
          <p class="text-sm text-gray-500 mt-0.5">Kiểm duyệt đánh giá của khách hàng và import đánh giá số lượng lớn từ các sàn thương mại điện tử</p>
        </div>
        <button id="reviews-import-btn" class="px-4 py-2 bg-gray-950 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import Đánh Giá (CSV)
        </button>
      </div>

      <!-- Hidden Input for CSV upload -->
      <input type="file" id="csv-file-input" class="hidden" accept=".csv">

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
          <div class="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
            <div class="relative w-full sm:w-64 flex items-center">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" id="review-search-input" value="${state.search || ''}" placeholder="Tìm theo tên khách, comment, sản phẩm..." class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] bg-white">
            </div>
            <!-- Popover Filter Wrapper -->
            <div class="relative inline-block text-left" id="review-filter-wrapper">
              <button type="button" id="review-filter-toggle" class="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center relative text-xs font-bold" title="Bộ lọc nâng cao">
                Lọc
                <span id="review-filter-badge" class="${state.status ? '' : 'hidden'} absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 border border-white rounded-full"></span>
              </button>

              <div id="review-filter-popover" class="hidden absolute left-0 mt-2 w-60 bg-white border border-gray-250 shadow-xl rounded-xl p-4 z-50">
                <div class="flex items-center justify-between border-b border-gray-150 pb-2 mb-3">
                  <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5 select-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Bộ lọc đánh giá
                  </span>
                  <button type="button" id="review-clear-all-filters" class="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline transition-all">
                    Xóa bộ lọc
                  </button>
                </div>
                <div class="space-y-3">
                  <div class="space-y-1">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</label>
                    <select id="review-filter-status" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C9A84C] bg-white">
                      <option value="">Tất cả đánh giá</option>
                      <option value="pending" ${state.status === 'pending' ? 'selected' : ''}>Chờ duyệt</option>
                      <option value="approved" ${state.status === 'approved' ? 'selected' : ''}>Đã duyệt hiển thị</option>
                      <option value="hidden" ${state.status === 'hidden' ? 'selected' : ''}>Đã ẩn</option>
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
                <th class="px-6 py-4">Sản Phẩm</th>
                <th class="px-6 py-4">Khách Hàng</th>
                <th class="px-6 py-4">Đánh Giá</th>
                <th class="px-6 py-4">Nội Dung</th>
                <th class="px-6 py-4">Ảnh Đính Kèm</th>
                <th class="px-6 py-4">Phản Hồi</th>
                <th class="px-6 py-4 text-right">Trạng Thái / Hành Động</th>
              </tr>
            </thead>
            <tbody id="reviews-tbody" class="divide-y divide-gray-50">
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải đánh giá...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100" id="reviews-pagination"></div>
      </div>
    </div>
  `;

  // Popover filter toggle
  const filterToggleBtn = container.querySelector('#review-filter-toggle');
  const filterPopover = container.querySelector('#review-filter-popover');
  const clearFiltersBtn = container.querySelector('#review-clear-all-filters');
  const select = container.querySelector('#review-filter-status');

  if (filterToggleBtn && filterPopover) {
    filterToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterPopover.classList.toggle('hidden');
    });

    const closeFilterPopover = (e) => {
      if (filterPopover && !e.target.closest('#review-filter-wrapper')) {
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

      const badge = container.querySelector('#review-filter-badge');
      if (badge) {
        if (state.status) badge.classList.remove('hidden');
        else badge.classList.add('hidden');
      }

      loadReviews(container);
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.status = '';
      state.page = 1;
      if (select) select.value = '';

      const badge = container.querySelector('#review-filter-badge');
      if (badge) badge.classList.add('hidden');

      loadReviews(container);
    });
  }

  const searchInput = container.querySelector('#review-search-input');
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadReviews(container);
    }, 400);
  });

  // CSV Import triggers file input
  const fileInput = container.querySelector('#csv-file-input');
  container.querySelector('#reviews-import-btn').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const parsed = parseReviewsCSV(text);
      if (!parsed.length) {
        showToast('Tệp CSV rỗng hoặc định dạng không đúng.', 'error');
        return;
      }

      try {
        const res = await bulkUploadReviews(parsed);
        showToast(res.data?.message || 'Import thành công');
        loadReviews(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsText(file);
    fileInput.value = ''; // reset
  });

  loadReviews(container);
}

async function loadReviews(container) {
  const tbody = container.querySelector('#reviews-tbody');
  tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">Đang tải đánh giá...</td></tr>`;

  try {
    const res = await getReviews({
      page: state.page,
      limit: state.limit,
      status: state.status,
      search: state.search
    });

    state.data = res.data || [];
    state.total = Number(res.meta?.total ?? state.data.length);

    renderRows(container);
    renderPageNav(container);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500 text-sm">${error.message || 'Lỗi tải dữ liệu'}</td></tr>`;
  }
}

function renderRows(container) {
  const tbody = container.querySelector('#reviews-tbody');
  if (!state.data.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">Chưa có đánh giá nào</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  state.data.forEach((rev) => {
    const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors text-gray-700 text-sm';
    tr.innerHTML = `
      <td class="px-6 py-4">
        <div class="font-medium text-gray-900 truncate max-w-[120px]" title="${rev.product_name || ''}">${rev.product_name || 'Sản phẩm đã xóa'}</div>
        <div class="text-xs font-mono text-gray-400">${rev.product_sku || '—'}</div>
      </td>
      <td class="px-6 py-4">
        <div class="font-semibold text-gray-800">${rev.customer_name}</div>
        ${rev.is_imported == 1 ? `<span class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded font-bold">Import: ${rev.imported_source}</span>` : ''}
      </td>
      <td class="px-6 py-4 text-yellow-500 font-bold tracking-wider">${stars}</td>
      <td class="px-6 py-4 text-xs max-w-[200px] break-words">${rev.comment || '<i>Không có nội dung comment</i>'}</td>
      <td class="px-6 py-4">
        <div class="flex gap-1">
          ${rev.images && rev.images.length > 0
            ? rev.images.map(img => `<img src="${img}" class="w-8 h-8 object-cover rounded border border-gray-200 cursor-zoom-in" onclick="window.open('${img}')" onerror="this.style.display='none'">`).join('')
            : '<span class="text-gray-300 text-xs">—</span>'}
        </div>
      </td>
      <td class="px-6 py-4 text-xs">
        ${rev.reply_comment 
          ? `<div class="bg-gray-50 border border-gray-100 rounded-lg p-2 max-w-[150px] truncate" title="${rev.reply_comment}"><strong>Shop:</strong> ${rev.reply_comment}</div>` 
          : '<button class="reply-btn text-blue-600 font-semibold hover:underline">Phản hồi</button>'}
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-1.5">
          ${rev.status === 'pending' ? `
            <button class="approve-btn px-2.5 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">Duyệt</button>
            <button class="hide-btn px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">Ẩn</button>
          ` : rev.status === 'approved' ? `
            <span class="text-green-600 text-xs font-bold mr-2">Đang hiện</span>
            <button class="hide-btn px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-semibold hover:bg-gray-200">Ẩn</button>
          ` : `
            <span class="text-red-500 text-xs font-bold mr-2">Đang ẩn</span>
            <button class="approve-btn px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold hover:bg-green-100">Duyệt</button>
          `}
        </div>
      </td>
    `;

    // Reply button click
    const replyBtn = tr.querySelector('.reply-btn');
    if (replyBtn) {
      replyBtn.addEventListener('click', () => {
        const text = prompt('Nhập nội dung phản hồi của shop:');
        if (text === null) return;
        if (!text.trim()) { alert('Nội dung không được rỗng.'); return; }
        sendReply(rev.id, text.trim(), container);
      });
    }

    // Approve click
    const appBtn = tr.querySelector('.approve-btn');
    if (appBtn) {
      appBtn.addEventListener('click', () => changeStatus(rev.id, 'approved', container));
    }

    // Hide click
    const hideBtn = tr.querySelector('.hide-btn');
    if (hideBtn) {
      hideBtn.addEventListener('click', () => changeStatus(rev.id, 'hidden', container));
    }

    tbody.appendChild(tr);
  });
}

async function sendReply(id, text, container) {
  try {
    await replyToReview(id, text);
    showToast('Đã gửi phản hồi đánh giá');
    loadReviews(container);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function changeStatus(id, status, container) {
  try {
    await updateReviewStatus(id, status);
    showToast(status === 'approved' ? 'Đã duyệt hiển thị' : 'Đã ẩn đánh giá');
    loadReviews(container);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * CSV parser helper for imported reviews
 * Expected CSV headers: customer_name,rating,comment,product_sku_or_id,source
 */
function parseReviewsCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const customerNameIdx = headers.indexOf('customer_name');
  const ratingIdx = headers.indexOf('rating');
  const commentIdx = headers.indexOf('comment');
  const skuIdx = headers.indexOf('product_sku_or_id');
  const sourceIdx = headers.indexOf('source');

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // basic split by comma, ignoring commas in double quotes
    const cells = [];
    let insideQuote = false;
    let currentCell = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length < 3) continue;

    results.push({
      customer_name: cells[customerNameIdx] || 'Khách hàng',
      rating: parseInt(cells[ratingIdx]) || 5,
      comment: cells[commentIdx] || '',
      product_sku_or_id: cells[skuIdx] || '',
      source: cells[sourceIdx] || 'Shopee',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });
  }

  return results;
}

function renderPageNav(container) {
  const wrap = container.querySelector('#reviews-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / state.limit);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadReviews(container);
  }));
}
