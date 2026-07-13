import { formatPrice, navigate } from '../../../utils/helpers.js';

export class ProfileVouchers {
  constructor(page) {
    this.page = page;
  }

  render() {
    let filtered = this.page._vouchers || [];

    // 1. Filter by status tab
    if (this.page._voucherFilter === 'active') {
      filtered = filtered.filter(v => v.status === 'active');
    } else if (this.page._voucherFilter === 'used') {
      filtered = filtered.filter(v => v.status === 'used');
    } else if (this.page._voucherFilter === 'expired') {
      filtered = filtered.filter(v => v.status === 'expired');
    }

    // 2. Filter by minimum order range
    const range = this.page._voucherMinOrderRange || 'all';
    if (range === '0-100k') {
      filtered = filtered.filter(v => (v.min_order_amount || 0) >= 0 && (v.min_order_amount || 0) < 100000);
    } else if (range === '100k-200k') {
      filtered = filtered.filter(v => (v.min_order_amount || 0) >= 100000 && (v.min_order_amount || 0) < 200000);
    } else if (range === '200k-500k') {
      filtered = filtered.filter(v => (v.min_order_amount || 0) >= 200000 && (v.min_order_amount || 0) < 500000);
    } else if (range === '500k+') {
      filtered = filtered.filter(v => (v.min_order_amount || 0) >= 500000);
    }

    // 3. Sort by discount value
    const sort = this.page._voucherSort || 'default';
    if (sort === 'value_desc') {
      filtered.sort((a, b) => (b.discount_value || 0) - (a.discount_value || 0));
    } else if (sort === 'value_asc') {
      filtered.sort((a, b) => (a.discount_value || 0) - (b.discount_value || 0));
    }

    // Dynamic counts
    const tabs = [
      { id: 'active', label: `Còn hiệu lực (${(this.page._vouchers || []).filter(v => v.status === 'active').length})` },
      { id: 'used', label: `Đã dùng (${(this.page._vouchers || []).filter(v => v.status === 'used').length})` },
      { id: 'expired', label: `Hết hạn (${(this.page._vouchers || []).filter(v => v.status === 'expired').length})` }
    ];

    // 4. Paginate
    const itemsPerPage = 4;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    let currentPage = this.page._voucherPage || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    this.page._voucherPage = currentPage;

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return `
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
        <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-950" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M15 5v2" /><path d="M15 11v2" /><path d="M15 17v2" />
            <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
          </svg>
          <span>Voucher Của Tôi</span>
        </h2>
      </div>

      <!-- Filters and Sort Section -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6 items-end sm:items-center justify-between">
        <!-- Tab Filters -->
        <div class="flex gap-2 border-b border-zinc-100 flex-1 pb-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
          ${tabs.map(t => `
            <button data-voucher-filter="${t.id}"
              class="pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 focus:outline-none transition whitespace-nowrap ${this.page._voucherFilter === t.id ? 'border-zinc-950 text-zinc-950 font-black' : 'border-transparent text-zinc-400'}">
              ${t.label}
            </button>
          `).join('')}
        </div>
        
        <!-- Dropdown Controls -->
        <div class="flex items-center gap-3 w-full sm:w-auto shrink-0 select-none">
          <!-- Sort -->
          <div class="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <select id="voucher-sort-select" class="w-full sm:w-auto bg-transparent border border-zinc-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider outline-none rounded-xl cursor-pointer">
              <option value="default" ${this.page._voucherSort === 'default' ? 'selected' : ''}>Mặc định</option>
              <option value="value_desc" ${this.page._voucherSort === 'value_desc' ? 'selected' : ''}>Giá trị giảm dần</option>
              <option value="value_asc" ${this.page._voucherSort === 'value_asc' ? 'selected' : ''}>Giá trị tăng dần</option>
            </select>
          </div>
          <!-- Min Order Range -->
          <div class="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <select id="voucher-range-select" class="w-full sm:w-auto bg-transparent border border-zinc-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider outline-none rounded-xl cursor-pointer">
              <option value="all" ${this.page._voucherMinOrderRange === 'all' ? 'selected' : ''}>Tất cả mức đơn</option>
              <option value="0-100k" ${this.page._voucherMinOrderRange === '0-100k' ? 'selected' : ''}>Đơn từ 0đ - 100k</option>
              <option value="100k-200k" ${this.page._voucherMinOrderRange === '100k-200k' ? 'selected' : ''}>Đơn từ 100k - 200k</option>
              <option value="200k-500k" ${this.page._voucherMinOrderRange === '200k-500k' ? 'selected' : ''}>Đơn từ 200k - 500k</option>
              <option value="500k+" ${this.page._voucherMinOrderRange === '500k+' ? 'selected' : ''}>Đơn từ 500k trở lên</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${paginated.length === 0 ? `
          <div class="col-span-full text-center py-16 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-zinc-300 mb-4" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M15 5v2" /><path d="M15 11v2" /><path d="M15 17v2" />
              <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
            </svg>
            <p class="text-sm font-bold text-zinc-400 mb-6">Không tìm thấy voucher phù hợp.</p>
            <button id="btn-shop-now-vouchers" class="h-11 px-8 bg-zinc-950 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-amber-500 transition">
              ĐI MUA SẮM NGAY
            </button>
          </div>
        ` : paginated.map(v => this.voucherCardHTML(v)).join('')}
      </div>

      <!-- Pagination Controls -->
      ${totalPages > 1 ? `
        <div class="flex items-center justify-center gap-2 mt-8">
          <button id="btn-voucher-prev" ${currentPage === 1 ? 'disabled class="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-350 bg-zinc-50 border border-zinc-150 cursor-not-allowed"' : 'class="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 transition"'}>
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
            <button data-voucher-page="${p}"
              class="h-8 min-w-8 px-2 rounded-lg text-xs font-black uppercase transition ${p === currentPage ? 'bg-zinc-950 text-white border border-zinc-950' : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950'}">
              ${p}
            </button>
          `).join('')}
          <button id="btn-voucher-next" ${currentPage === totalPages ? 'disabled class="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-350 bg-zinc-50 border border-zinc-150 cursor-not-allowed"' : 'class="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 transition"'}>
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      ` : ''}

      <div class="mt-8 p-4 bg-zinc-50 border border-zinc-150 rounded-xl text-xs text-zinc-500 flex items-start gap-3">
        <span class="text-base">💡</span>
        <p class="leading-relaxed">Bạn có thể xếp chồng (stacking) tối đa <strong>3 voucher</strong> hợp lệ cho cùng 1 đơn hàng khi tiến hành checkout tại trang thanh toán.</p>
      </div>
    `;
  }

  bindEvents(container) {
    const shopNowBtn = container.querySelector('#btn-shop-now-vouchers');
    if (shopNowBtn) {
      shopNowBtn.addEventListener('click', () => navigate('/products'));
    }

    container.querySelectorAll('[data-voucher-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.page._voucherFilter = btn.dataset.voucherFilter;
        this.page._voucherPage = 1;
        this.page._renderTabContent();
      });
    });

    const sortSelect = container.querySelector('#voucher-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.page._voucherSort = e.target.value;
        this.page._voucherPage = 1;
        this.page._renderTabContent();
      });
    }

    const rangeSelect = container.querySelector('#voucher-range-select');
    if (rangeSelect) {
      rangeSelect.addEventListener('change', (e) => {
        this.page._voucherMinOrderRange = e.target.value;
        this.page._voucherPage = 1;
        this.page._renderTabContent();
      });
    }

    const prevBtn = container.querySelector('#btn-voucher-prev');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        this.page._voucherPage = (this.page._voucherPage || 1) - 1;
        this.page._renderTabContent();
      });
    }

    const nextBtn = container.querySelector('#btn-voucher-next');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', () => {
        this.page._voucherPage = (this.page._voucherPage || 1) + 1;
        this.page._renderTabContent();
      });
    }

    container.querySelectorAll('[data-voucher-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.page._voucherPage = parseInt(btn.dataset.voucherPage, 10);
        this.page._renderTabContent();
      });
    });

    // Apply Voucher Click Handler
    container.querySelectorAll('[data-apply-voucher]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = btn.dataset.applyVoucher;
        navigate(`/products?voucher=${encodeURIComponent(code)}`);
      });
    });
  }

  voucherCardHTML(v) {
    const isAvailable = v.status === 'active';
    
    let expireMsg = '';
    let isUrgent = false;
    if (v.expires_at) {
      const diffTime = new Date(v.expires_at).getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        expireMsg = 'Đã hết hạn';
      } else if (diffDays <= 3) {
        expireMsg = `⚠️ Chỉ còn ${diffDays} ngày`;
        isUrgent = true;
      } else {
        expireMsg = `Còn ${diffDays} ngày`;
      }
    }

    return `
      <div class="border rounded-2xl bg-white flex overflow-hidden shadow-sm relative border-zinc-200">
        <!-- Left Side stub -->
        <div class="w-24 ${isAvailable ? (isUrgent ? 'bg-red-500' : 'bg-zinc-900') : 'bg-zinc-200'} text-white flex flex-col items-center justify-center p-3 text-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M15 5v2" /><path d="M15 11v2" /><path d="M15 17v2" />
            <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
          </svg>
          <span class="text-[9px] font-black tracking-widest uppercase mt-2">
            ${v.discount_type === 'percentage' ? `${v.discount_value}%` : `-${formatPrice(v.discount_value)}`}
          </span>
        </div>

        <!-- Right Side details -->
        <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div class="text-xs font-black text-zinc-800 truncate">${v.code}</div>
            <div class="text-[10px] text-zinc-550 mt-1 leading-relaxed">
              Đơn từ: ${v.min_order_amount > 0 ? formatPrice(v.min_order_amount) : 'Không giới hạn'}
            </div>
            ${v.max_discount_amount > 0 ? `<div class="text-[9px] text-zinc-400 mt-0.5">Giảm tối đa: ${formatPrice(v.max_discount_amount)}</div>` : ''}
          </div>

          <div class="flex items-center justify-between border-t border-zinc-50 pt-2 mt-2 gap-2">
            <span class="text-[9px] font-bold ${isUrgent ? 'text-red-650' : 'text-zinc-450'} uppercase">${v.expires_at ? expireMsg : 'Vô thời hạn'}</span>
            ${isAvailable ? `
              <button data-apply-voucher="${v.code}"
                class="px-2.5 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-wider transition">
                Áp dụng
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}
