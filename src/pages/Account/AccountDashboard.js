import { isLoggedIn, logout } from '../../services/authService.js?v=1.0.20';
import { formatPrice, navigate } from '../../utils/helpers.js';
import { getIconSvg } from './icons.js';

export const accountDashboardMethods = {
_syncNavbarUser(user) {
  if (!user) return;

  const label = (user.full_name || user.name || 'Tai khoan').toUpperCase();
  const textEl = document.getElementById('nav-account-text');
  if (textEl) {
    textEl.textContent = label;
  }

  const mobileBtn = document.getElementById('mobile-account-btn');
  if (mobileBtn) {
    mobileBtn.classList.remove('text-black');
    mobileBtn.classList.add('text-emerald-500');
  }
},

_renderDashboard(wrap) {
  const spend = parseFloat(this._userProfile?.total_spend || 0);
  let rank = this._userProfile?.rank || 'Silver';

  // Sort ranks by min_spend ascending
  const sortedRanks = [...(this._ranks || [])].sort((a, b) => Number(a.min_spend) - Number(b.min_spend));
  
  let nextRank = '';
  let targetSpend = 0;
  let spendDiff = 0;
  let pct = 0;
  
  if (sortedRanks.length > 0) {
    const currentRankIndex = sortedRanks.findIndex(r => r.name.toLowerCase() === rank.toLowerCase());
    const nextRankObj = currentRankIndex !== -1 && currentRankIndex < sortedRanks.length - 1 
      ? sortedRanks[currentRankIndex + 1] 
      : null;
      
    if (nextRankObj) {
      nextRank = nextRankObj.name;
      targetSpend = parseFloat(nextRankObj.min_spend);
      spendDiff = Math.max(0, targetSpend - spend);
      
      const currentRankMin = currentRankIndex !== -1 ? parseFloat(sortedRanks[currentRankIndex].min_spend) : 0;
      const range = targetSpend - currentRankMin;
      pct = range > 0 ? Math.min(100, Math.max(0, ((spend - currentRankMin) / range) * 100)) : 100;
    } else {
      pct = 100;
    }
  } else {
    nextRank = spend < 3000000 ? 'Gold' : spend < 10000000 ? 'Diamond' : '';
    targetSpend = spend < 3000000 ? 3000000 : spend < 10000000 ? 10000000 : 10000000;
    spendDiff = targetSpend - spend;
    pct = spend < 3000000 ? (spend / 3000000) * 100 : spend < 10000000 ? ((spend - 3000000) / 7000000) * 100 : 100;
  }

  const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;
  const navItems = [];
  if (isEcommerce) {
    navItems.push(
      { id: 'orders', label: 'Đơn Hàng Của Tôi', icon: 'package', badge: this._orders.length || 0, badgeColor: 'bg-zinc-900 text-white' },
      { id: 'returns', label: 'Đổi / Trả Hàng <span class="ml-1.5 px-1.5 py-0.5 text-[9px] font-black tracking-normal bg-emerald-500 text-white rounded normal-case">Free</span>', icon: 'refresh', badge: this._returns.filter(r => ['requested', 'approved', 'approved_shipping', 'shipper_pickup', 'received_checking'].includes(r.status)).length, badgeColor: 'bg-red-500 text-white' },
      { id: 'vouchers', label: 'Voucher Của Tôi', icon: 'ticket', badge: this._vouchers.filter(v => v.status === 'active').length, badgeColor: 'bg-amber-500 text-zinc-950' }
    );
  }
  navItems.push(
    { id: 'profile', label: 'Thông Tin Cá Nhân', icon: 'user', badge: !this._userProfile?.birthday ? '!' : 0, badgeColor: 'bg-yellow-500 text-zinc-950 animate-pulse' },
    { id: 'addresses', label: 'Sổ Địa Chỉ', icon: 'map-pin', badge: 0 }
  );

  wrap.innerHTML = `
    <div class="max-width-container mx-auto px-4 py-8">
      <!-- Mobile Header Card -->
      <div class="block md:hidden p-5 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-800 text-white shadow-xl mb-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-base font-bold tracking-wide">${this._userProfile?.full_name || 'Khách'}</div>
            <div class="text-[10px] text-amber-400 font-black tracking-widest uppercase">★ Hạng ${rank}</div>
          </div>
          <div class="text-right">
            <div class="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Chi tiêu</div>
            <div class="text-sm font-black text-amber-400">${formatPrice(spend)}</div>
          </div>
        </div>
        <div class="w-full bg-zinc-700/50 h-1.5 rounded-full overflow-hidden mb-2">
          <div class="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" style="width: ${pct}%"></div>
        </div>
        <div class="text-[9px] text-zinc-400 text-center mb-4">${nextRank ? `Cần chi tiêu thêm <strong>${formatPrice(spendDiff)}</strong> để lên ${nextRank}` : 'Hạng Diamond tối đa'}</div>
        ${isEcommerce ? `
        <div class="grid grid-cols-2 gap-2 border-t border-zinc-700/30 pt-3 text-center">
          <button onclick="window.accountPage.setTab('orders')" class="focus:outline-none">
            <div class="text-base font-black text-white">${this._orders.length}</div>
            <div class="text-[9px] text-zinc-400 uppercase tracking-widest font-black">Đơn hàng</div>
          </button>
          <button onclick="window.accountPage.setTab('vouchers')" class="focus:outline-none">
            <div class="text-base font-black text-white">${this._vouchers.filter(v => v.status === 'active').length}</div>
            <div class="text-[9px] text-zinc-400 uppercase tracking-widest font-black">Voucher</div>
          </button>
        </div>
        ` : ''}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
        <!-- Desktop Sidebar -->
        <div class="hidden md:block md:col-span-1 lg:col-span-1 bg-white border border-zinc-100/80 rounded-2xl p-6 shadow-sm sticky top-28">
          <div class="text-center pb-5 border-b border-zinc-100 mb-5">
            <div class="text-sm font-black text-zinc-950 mb-1">${this._userProfile?.full_name || 'Khách'}</div>
            <div class="inline-flex px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black border border-amber-200/50 mb-4 uppercase tracking-wider">★ ${rank}</div>
            <div class="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mb-1"><div class="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style="width: ${pct}%"></div></div>
            <div class="text-[9px] text-zinc-500">${nextRank ? `Tích lũy ${pct.toFixed(0)}% · Thêm ${formatPrice(spendDiff)} → ${nextRank}` : 'Hạng Diamond tối đa'}</div>
          </div>
          <div class="space-y-1">
            ${navItems.map(item => `
              <button onclick="window.accountPage.setTab('${item.id}')"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider transition focus:outline-none ${this._activeTab === item.id ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-650 hover:bg-zinc-50'}">
                <span class="flex items-center gap-3">
                  <span class="w-5 h-5 flex items-center justify-center">${getIconSvg(item.icon, 'w-5 h-5')}</span>
                  <span class="hidden md:inline">${item.label}</span>
                </span>
                ${item.badge ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black ${item.badgeColor || 'bg-zinc-100 text-zinc-600'}">${item.badge}</span>` : ''}
              </button>
            `).join('')}
            <button onclick="window.accountPage.handleLogout()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider text-red-650 hover:bg-red-50 transition focus:outline-none border-t border-zinc-100/80 mt-4 pt-4">
              <span class="w-5 h-5 flex items-center justify-center text-red-600">${getIconSvg('logout', 'w-5 h-5')}</span>
              <span class="hidden md:inline">Đăng Xuất</span>
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="md:col-span-3 lg:col-span-4 bg-white border border-zinc-100/80 rounded-2xl p-6 md:p-8 shadow-sm">
          <div id="account-tab-content"></div>
        </div>
      </div>
    </div>
  `;

  this._renderTabContent();

  // Auto-open order details modal if order_id is present in the URL query
  const params = new URLSearchParams(window.location.search);
  const orderIdParam = params.get('order_id');
  if (orderIdParam) {
    const orderId = Number(orderIdParam);
    setTimeout(() => {
      if (typeof this.compOrders.openOrderDetails === 'function') {
        this.compOrders.openOrderDetails(orderId);
        // Remove order_id from URL search query to avoid reopen on page reload
        const url = new URL(window.location.href);
        url.searchParams.delete('order_id');
        window.history.replaceState({}, '', url.toString());
      }
    }, 350);
  }
},

_renderTabContent() {
  const container = document.getElementById('account-tab-content');
  if (!container) return;

  if (this._activeTab === 'orders') {
    container.innerHTML = this.compOrders.render();
    this.compOrders.bindEvents(container);
  } else if (this._activeTab === 'returns') {
    container.innerHTML = this.compReturns.render();
    this.compReturns.bindEvents(container);
  } else if (this._activeTab === 'points') {
    container.innerHTML = this.compPoints.render();
    this.compPoints.bindEvents(container);
  } else if (this._activeTab === 'vouchers') {
    container.innerHTML = this.compVouchers.render();
    this.compVouchers.bindEvents(container);
  } else if (this._activeTab === 'addresses') {
    container.innerHTML = this.compAddresses.render();
    this.compAddresses.bindEvents(container);
  } else if (this._activeTab === 'profile') {
    container.innerHTML = this.compProfile.render();
    this.compProfile.bindEvents(container);
  }
},

setTab(tab) {
  this._activeTab = tab;
  if (typeof this._closeModal === 'function') {
    this._closeModal(true);
  }
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  window.history.pushState({}, '', url.toString());
  this._renderDashboard(this._wrap);
},

_field(label, type, id, placeholder, required = false, value = '', pattern = '', maxlength = '') {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-[10px] font-black uppercase tracking-wider text-zinc-700 mb-1.5">${label}</label>
      <input type="${type}" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''} ${pattern ? `pattern="${pattern}"` : ''} ${maxlength ? `maxlength="${maxlength}"` : ''}
        value="${value}"
        class="w-full h-11 px-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white" />
    </div>
  `;
},

handleLogout() {
  const confirmHtml = `
    <div class="text-center py-3">
      <div class="w-12 h-12 rounded-full bg-red-50 text-red-650 flex items-center justify-center mx-auto mb-4">
        ${getIconSvg('logout', 'w-6 h-6 text-red-600')}
      </div>
      <p class="text-xs font-bold text-zinc-800 leading-relaxed mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
      <div class="flex items-center gap-3">
        <button id="btn-logout-confirm-yes" class="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-widest uppercase transition focus:outline-none">
          Đăng Xuất
        </button>
        <button id="btn-logout-confirm-no" class="flex-1 h-11 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-black tracking-widest uppercase transition focus:outline-none">
          Hủy Bỏ
        </button>
      </div>
    </div>
  `;

  this._openModal('Xác Nhận Đăng Xuất', confirmHtml, (sheet) => {
    sheet.querySelector('#btn-logout-confirm-yes').addEventListener('click', () => {
      this._closeModal();
      logout();
      this.compAuth.render();
      navigate('/account');
    });
    sheet.querySelector('#btn-logout-confirm-no').addEventListener('click', () => {
      this._closeModal();
    });
  });
},

_finishAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    navigate(redirect);
  }
},

copyToClipboard(text) {
  const performCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      return new Promise((resolve, reject) => {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.top = '0';
          textArea.style.left = '0';
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) {
            resolve();
          } else {
            reject(new Error('Fallback copy failed'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  };

  performCopy()
    .then(() => alert('Đã sao chép mã voucher vào bộ nhớ tạm.'))
    .catch(() => alert('Không thể sao chép mã voucher.'));
}

};
