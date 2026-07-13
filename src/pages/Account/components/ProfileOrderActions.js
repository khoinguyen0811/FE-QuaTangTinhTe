import { formatDate, formatPrice, copyToClipboard } from '../../../utils/helpers.js';

console.log('=== ProfileOrderActions.js v1.0.80 loaded ===');

export const profileOrderActionMethods = {
  openReviewForm() {
    alert('Chức năng đánh giá đơn hàng đang được cập nhật.');
  },

  async openOrderDetails(orderId) {
    let order = (this.page._orders || []).find(o => Number(o.id) === Number(orderId));
    if (!order) {
      this.page._openModal(`Mã đơn #ORD-${orderId}`, `
        <div class="flex flex-col items-center justify-center py-12 space-y-4">
          <div class="w-8 h-8 border-4 border-zinc-200 border-t-zinc-950 rounded-full animate-spin"></div>
          <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Đang tải thông tin đơn hàng...</p>
        </div>
      `);
      try {
        const { getOrder } = await import('../../../services/orderService.js');
        const res = await getOrder(orderId);
        if (res && res.success && res.data) {
          order = res.data;
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      }

      if (!order) {
        this.page._openModal(`Lỗi tải đơn`, `
          <div class="text-center py-8">
            <p class="text-red-500 text-xs font-black uppercase tracking-wider">Không tìm thấy hoặc bạn không có quyền xem đơn hàng này.</p>
          </div>
        `);
        return;
      }
    }

    const icons = {
      pending: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      confirmed: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      processing: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 16 12 21 3 16 12 11 21 16"></polyline><polyline points="21 7.5 12 12.5 3 7.5"></polyline><polyline points="12 22.08 12 12"></polyline><polyline points="12 3 21 7.5 12 12 3 7.5 12 3"></polyline></svg>`,
      shipping: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
      delivering: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
      completed: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
    };

    const stages = [
      { id: 'pending', label: 'Đặt hàng thành công', desc: 'Đơn hàng đã được tạo và ghi nhận thành công.' },
      { id: 'confirmed', label: 'Xác nhận đơn hàng', desc: 'Đã xác nhận thông tin đơn hàng của bạn.' },
      { id: 'processing', label: 'Đang đóng gói', desc: 'Sản phẩm đang được chuẩn bị và đóng gói cẩn thận.' },
      { id: 'shipping', label: 'Bàn giao vận chuyển', desc: 'Đơn hàng đã bàn giao cho đơn vị vận chuyển.' },
      { id: 'delivering', label: 'Đang giao hàng', desc: 'Shipper đang trên đường giao hàng đến địa chỉ của bạn.' },
      { id: 'completed', label: 'Giao hàng thành công', desc: 'Đơn hàng đã giao thành công và hoàn tất giao dịch.' }
    ];
    const currentIdx = stages.findIndex(s => s.id === order.status);

    const trackerHtml = order.status === 'cancelled' ? `
    <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-750 rounded-xl">
      <span class="text-lg">!</span>
      <div>
        <div class="text-xs font-black uppercase tracking-wider">Đơn hàng đã bị hủy bỏ</div>
      </div>
    </div>
  ` : `
    <style>
      @keyframes tracker-pulse {
        0% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(201, 168, 76, 0); }
        100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0); }
      }
      .tracker-pulse-active {
        animation: tracker-pulse 2s infinite;
      }
    </style>
    <div class="space-y-1 py-2 pl-2">
      ${stages.map((stg, idx) => {
      const isActive = idx <= currentIdx;
      const isCurrent = idx === currentIdx;

      let circleClass = 'bg-zinc-100 text-zinc-400 border border-zinc-200';
      let lineClass = 'bg-zinc-200';
      let titleClass = 'text-zinc-400';
      let descClass = 'text-zinc-400';

      if (isCurrent) {
        circleClass = 'bg-[#C9A84C] text-white tracker-pulse-active ring-4 ring-[#C9A84C]/25';
        lineClass = 'bg-[#C9A84C]';
        titleClass = 'text-zinc-950 font-black';
        descClass = 'text-zinc-650';
      } else if (isActive) {
        circleClass = 'bg-zinc-900 text-white';
        lineClass = 'bg-zinc-950';
        titleClass = 'text-zinc-900 font-bold';
        descClass = 'text-zinc-500';
      }

      const icon = icons[stg.id];

      return `
          <div class="flex gap-4 items-start">
            <div class="flex flex-col items-center flex-shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}">
                ${icon}
              </div>
              ${idx < stages.length - 1 ? `
                <div class="w-[2px] h-9 my-0.5 ${lineClass}"></div>
              ` : ''}
            </div>
            <div class="pt-1 flex-1">
              <h4 class="text-[10px] uppercase tracking-widest ${titleClass}">
                ${stg.label}
              </h4>
              <p class="text-[10px] ${descClass} mt-0.5 font-medium leading-relaxed">
                ${stg.desc}
              </p>
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;

    const detailHtml = `
    <div class="space-y-6">
      <div>
        <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Hành trình đơn hàng</div>
        ${trackerHtml}
      </div>
      ${['shipping', 'delivering', 'completed'].includes(order.status) ? `
        <div class="bg-zinc-50 border border-zinc-150 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Mã vận đơn (${order.shipping_carrier || 'Shopee Express'})</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-xs font-black text-zinc-800 font-mono">${order.tracking_code || 'test'}</span>
              <button id="btn-copy-tracking" class="p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-zinc-850 transition" title="Sao chép mã vận đơn">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <a href="https://spx.vn/track" target="_blank" class="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-amber-500 transition">Theo dõi ↗</a>
        </div>
      ` : ''}
      <div>
        <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Địa chỉ nhận hàng</div>
        <div class="text-xs font-bold text-zinc-800">${order.customer_name} - ${order.customer_phone}</div>
        <div class="text-xs text-zinc-650 mt-1">${order.shipping_address}</div>
      </div>
      <div>
        <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Sản phẩm</div>
        <div class="space-y-4 max-h-48 overflow-y-auto pr-1">
          ${(order.items || []).map(item => {
      const img = item.product_images?.[0];
      const imgSrc = this.getImgSrc(img);
      return `
              <div class="flex items-start gap-4 py-2 border-b border-zinc-50 last:border-0">
                <div class="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src="${imgSrc}" class="w-full h-full object-contain p-1" onerror="this.src='https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400'" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-bold text-zinc-800 truncate">${item.product_name}</h4>
                  <div class="text-[10px] text-zinc-450 mt-1">Số lượng: x${item.quantity} · Giá: ${formatPrice(item.product_price)}</div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
      <div class="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100 text-xs space-y-2">
        <div class="flex justify-between text-zinc-650">
          <span>Tạm tính</span>
          <span>${formatPrice(parseFloat(order.total_amount) + parseFloat(order.discount_amount) - parseFloat(order.shipping_fee))}</span>
        </div>
        <div class="flex justify-between text-zinc-650">
          <span>Khuyến mãi / Voucher</span>
          <span class="text-red-650">-${formatPrice(order.discount_amount)}</span>
        </div>
        <div class="flex justify-between text-zinc-650">
          <span>Phí giao hàng</span>
          <span>${parseFloat(order.shipping_fee) === 0 ? 'Free ship' : formatPrice(order.shipping_fee)}</span>
        </div>
        <div class="flex justify-between text-sm font-black text-zinc-950 border-t border-zinc-150 pt-2">
          <span>Tổng thanh toán</span>
          <span class="text-amber-500">${formatPrice(order.total_amount)}</span>
        </div>
      </div>
    </div>
  `;
    this.page._openModal(`Mã đơn #ORD-${order.id}`, detailHtml);

    const copyBtn = document.getElementById('btn-copy-tracking');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeText = order.tracking_code || 'test';
        copyToClipboard(codeText).then(() => {
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
          }, 2000);
        }).catch(() => {
          alert('Không thể sao chép mã. Vui lòng tự sao chép.');
        });
      });
    }
  },

  openReturnRequestForm(orderId) {
    const order = this.page._orders.find(o => Number(o.id) === Number(orderId));
    if (!order) return;

    const defaults = this.page.compReturns?._receiverDefaults(order) || {
      name: order.customer_name || this.page._userProfile?.full_name || '',
      phone: order.customer_phone || this.page._userProfile?.phone || '',
      address: order.shipping_address || ''
    };

    this.page.compReturns?._openReturnForm?.({
      title: 'Yêu cầu đổi / trả hàng',
      isWebOrder: true,
      source: 'web',
      orderId: order.id,
      orderCode: `#ORD-${order.id}`,
      defaults
    });
  },

  orderCardHTML(order) {
    const statusMap = {
      pending: { text: 'Chờ xác nhận', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      confirmed: { text: 'Đã xác nhận', color: 'text-blue-650 bg-blue-50 border-blue-200' },
      processing: { text: 'Đang xử lý', color: 'text-purple-650 bg-purple-50 border-purple-200' },
      shipping: { text: 'Đang giao hàng', color: 'text-indigo-650 bg-indigo-50 border-indigo-200' },
      delivering: { text: 'Đang giao hàng', color: 'text-indigo-650 bg-indigo-50 border-indigo-200' },
      completed: { text: 'Đã giao thành công', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      cancelled: { text: 'Đã hủy', color: 'text-red-650 bg-red-50 border-red-200' }
    };
    const current = statusMap[order.status] || { text: order.status, color: 'text-zinc-650 bg-zinc-50 border-zinc-200' };

    const items = order.items || [];
    const firstItem = items[0] || {};
    const img = firstItem.product_images?.[0] || firstItem.product_image;
    const imgSrc = this.getImgSrc(img);

    const completedTime = order.status === 'completed' ? new Date(order.updated_at).getTime() : 0;
    const daysDiff = completedTime ? (Date.now() - completedTime) / (1000 * 60 * 60 * 24) : 999;
    const canReturn = order.status === 'completed' && daysDiff <= 15;

    let actionButtons = '';
    if (order.status === 'pending') {
      actionButtons += `
      <button onclick="window.accountPage.cancelOrder(${order.id})" class="h-9 px-4 border border-red-200 text-red-650 hover:bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition">
        Hủy đơn
      </button>
    `;
    }
    if (canReturn) {
      actionButtons += `
      <button onclick="window.accountPage.openReturnRequestForm(${order.id})" class="h-9 px-4 border border-zinc-950 text-zinc-950 hover:bg-zinc-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition inline-flex items-center gap-1.5 justify-center">
        Đổi / Trả <span class="px-1 py-0.5 text-[8px] font-black bg-emerald-500 text-white rounded normal-case tracking-normal">Free</span>
      </button>
    `;
    }
    actionButtons += `
    <button onclick="window.accountPage.openOrderDetails(${order.id})" class="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition">
      Chi tiết
    </button>
  `;

    const itemSummaryText = items.length > 1
      ? `${firstItem.product_name} và ${items.length - 1} sản phẩm khác`
      : (firstItem.product_name || 'Đơn hàng trống');

    return `
    <div class="border border-zinc-150/70 rounded-2xl bg-white p-5 hover:shadow-md transition">
      <div class="flex flex-wrap items-center justify-between border-b border-zinc-100 pb-3 mb-4 gap-2">
        <div>
          <span class="text-xs font-black text-zinc-800">#ORD-${order.id}</span>
          <span class="text-[10px] text-zinc-400 ml-2">${formatDate(order.created_at)}</span>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${current.color}">
          ${current.text}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
          <img src="${imgSrc}" class="w-full h-full object-cover" onerror="this.src='https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&w=400'" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-zinc-800 truncate">${itemSummaryText}</h4>
          <div class="text-[10px] text-zinc-450 mt-1">Tổng cộng: <strong class="text-zinc-950 font-black">${formatPrice(order.total_amount)}</strong> · Số lượng: ${items.reduce((acc, i) => acc + (i.quantity || 1), 0)} sản phẩm</div>
        </div>
      </div>

      <div class="flex items-center justify-end border-t border-zinc-100 mt-4 pt-4 gap-2">
        ${actionButtons}
      </div>
    </div>
  `;
  }
};
