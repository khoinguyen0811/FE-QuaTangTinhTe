import { isLoggedIn, getToken, persistAuthSession } from '../../services/authService.js?v=1.0.20';
import { getOrders } from '../../services/orderService.js?v=1.0.20';
import { 
  getUserProfile, 
  getUserVouchers, 
  getUserAddresses, 
  getUserReturns,
  getRanksList
} from '../../services/userService.js?v=1.0.20';

// Component imports
import { ProfileAuth } from './components/ProfileAuth.js?v=1.0.20';
import { ProfileOrders } from './components/ProfileOrders.js?v=1.0.20';
import { ProfileReturns } from './components/ProfileReturns.js?v=1.0.20';
import { ProfilePoints } from './components/ProfilePoints.js?v=1.0.20';
import { ProfileVouchers } from './components/ProfileVouchers.js?v=1.0.20';
import { ProfileAddresses } from './components/ProfileAddresses.js?v=1.0.20';
import { ProfileDetails } from './components/ProfileDetails.js?v=1.0.20';
import { accountDashboardMethods } from './AccountDashboard.js?v=1.0.20';
import { accountModalMethods } from './AccountModal.js?v=1.0.20';
export default class AccountPage {
  constructor() {
    const params = new URLSearchParams(window.location.search);
    this._tab = params.get('tab') === 'register' ? 'register' : 'login';
    const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;
    const defaultTab = isEcommerce ? 'orders' : 'profile';
    this._activeTab = params.get('tab') || defaultTab;
    if (this._activeTab === 'points') {
      this._activeTab = defaultTab;
    }
    const validTabs = isEcommerce 
      ? ['orders', 'returns', 'points', 'vouchers', 'profile', 'addresses']
      : ['profile', 'addresses'];
    if (!validTabs.includes(this._activeTab)) {
      this._activeTab = defaultTab;
    }
    this._wrap = null;

    // Data lists
    this._userProfile = null;
    this._pointsHistory = [];
    this._vouchers = [];
    this._addresses = [];
    this._orders = [];
    this._returns = [];
    this._ranks = [];
    
    // UI Filters
    this._orderFilter = 'all';
    this._orderSearchQuery = '';
    this._orderPage = 1;
    this._orderPerPage = 5;
    this._returnFilter = 'all';
    this._voucherFilter = 'active';
    this._voucherSort = 'default';
    this._voucherMinOrderRange = 'all';
    this._voucherPage = 1;

    // Sub-components
    this.compAuth = new ProfileAuth(this);
    this.compOrders = new ProfileOrders(this);
    this.compReturns = new ProfileReturns(this);
    this.compPoints = new ProfilePoints(this);
    this.compVouchers = new ProfileVouchers(this);
    this.compAddresses = new ProfileAddresses(this);
    this.compProfile = new ProfileDetails(this);
  }

  render() {
    window.accountPage = this;
    const wrap = document.createElement('div');
    wrap.className = 'w-full min-h-[65vh] bg-zinc-50/50 pb-20 md:pb-10 pt-32 md:pt-40';
    this._wrap = wrap;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .custom-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 10, 10, 0.4); backdrop-filter: blur(8px); z-index: 99998; opacity: 0; transition: opacity 0.3s ease-out; pointer-events: none; }
      .custom-modal-backdrop.open { opacity: 1; pointer-events: auto; }
      .custom-modal-sheet { position: fixed; left: 0; right: 0; bottom: 0; background: white; border-top-left-radius: 24px; border-top-right-radius: 24px; z-index: 99999; box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.08); transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); max-height: 85vh; display: flex; flex-direction: column; pointer-events: none; }
      .custom-modal-sheet.open { transform: translateY(0); pointer-events: auto; }
      @media (max-width: 767px) {
        .custom-modal-sheet {
          padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px)) !important;
        }
      }
      @media (min-width: 768px) {
        .custom-modal-sheet { top: 50%; left: 50%; bottom: auto; right: auto; transform: translate(-50%, -45%) scale(0.95); border-radius: 20px; max-width: 540px; width: 90%; opacity: 0; pointer-events: none; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out; }
        .custom-modal-sheet.open { transform: translate(-50%, -50%) scale(1); opacity: 1; pointer-events: auto; }
      }
      .timeline-dot { transition: all 0.25s ease; }
      .timeline-node.active .timeline-dot { background-color: #1a1a1a; }
      .timeline-node.current .timeline-dot { background-color: #C9A84C; box-shadow: 0 0 0 5px rgba(201, 168, 76, 0.25); }
      .timeline-line { position: absolute; top: 10px; left: 50%; width: 100%; height: 2px; background-color: #e4e4e7; z-index: 1; }
      .timeline-node:last-child .timeline-line { display: none; }
      .timeline-node.active .timeline-line { background-color: #1a1a1a; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    // Append styles to head so they persist across dashboard innerHTML updates
    document.head.appendChild(styleEl);

    if (isLoggedIn()) {
      this._renderDashboardWrapper();
    } else {
      wrap.innerHTML = `<h1 class="sr-only">Tài Khoản Khách Hàng ${window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'}</h1>`;
      
      const authDiv = document.createElement('div');
      authDiv.innerHTML = this.compAuth.render();
      wrap.appendChild(authDiv);
      this.compAuth.bindEvents(authDiv);

      const params = new URLSearchParams(window.location.search);
      const orderIdParam = params.get('order_id');
      if (orderIdParam) {
        const orderId = Number(orderIdParam);
        setTimeout(() => {
          if (typeof this.openOrderDetails === 'function') {
            this.openOrderDetails(orderId);
            // Remove order_id from URL search query to avoid reopen on page reload
            const url = new URL(window.location.href);
            url.searchParams.delete('order_id');
            window.history.replaceState({}, '', url.toString());
          }
        }, 350);
      }
    }

    const handleAuthChange = () => {
      if (!wrap.isConnected) {
        window.removeEventListener('auth-changed', handleAuthChange);
        return;
      }
      if (isLoggedIn()) {
        this._renderDashboardWrapper();
      } else {
        wrap.innerHTML = '';
        
        const authDiv = document.createElement('div');
        authDiv.innerHTML = this.compAuth.render();
        wrap.appendChild(authDiv);
        this.compAuth.bindEvents(authDiv);
      }
    };
    window.addEventListener('auth-changed', handleAuthChange);

    // Global error listener to display runtime JS errors on screen
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      const errBanner = document.createElement('div');
      errBanner.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white p-4 z-[99999] text-xs font-mono';
      errBanner.innerHTML = `<strong>JS Error:</strong> ${msg} at ${lineNo}:${columnNo}`;
      document.body.appendChild(errBanner);
      return false;
    };

    return wrap;
  }

  async _renderDashboardWrapper() {
    this._wrap.innerHTML = `
      <h1 class="sr-only">Tài Khoản Khách Hàng ${window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'}</h1>
      <div class="max-width-container mx-auto px-4 py-8">
        <!-- Desktop Layout Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
          <!-- Sidebar Skeleton -->
          <div class="hidden md:block md:col-span-1 lg:col-span-1 bg-white border border-zinc-100 rounded-2xl p-6 space-y-6 sticky top-28">
            <div class="text-center pb-5 border-b border-zinc-100 space-y-3">
              <div class="skeleton-shimmer h-5 w-24 mx-auto" style="height: 20px; width: 96px; margin-left: auto; margin-right: auto;"></div>
              <div class="skeleton-shimmer h-4 w-16 mx-auto rounded-full" style="height: 16px; width: 64px; border-radius: 9999px; margin-left: auto; margin-right: auto;"></div>
              <div class="skeleton-shimmer h-2 w-full rounded-full" style="height: 8px; width: 100%; border-radius: 9999px;"></div>
            </div>
            <div class="space-y-3">
              <div class="skeleton-shimmer h-10 w-full rounded-xl" style="height: 40px; width: 100%; border-radius: 12px;"></div>
              <div class="skeleton-shimmer h-10 w-full rounded-xl" style="height: 40px; width: 100%; border-radius: 12px;"></div>
              <div class="skeleton-shimmer h-10 w-full rounded-xl" style="height: 40px; width: 100%; border-radius: 12px;"></div>
              <div class="skeleton-shimmer h-10 w-full rounded-xl" style="height: 40px; width: 100%; border-radius: 12px;"></div>
            </div>
          </div>
          <!-- Content Skeleton -->
          <div class="md:col-span-3 lg:col-span-4 bg-white border border-zinc-100 rounded-2xl p-6 md:p-8 space-y-6">
            <div class="skeleton-shimmer h-6 w-48" style="height: 24px; width: 192px;"></div>
            <div class="space-y-4">
              <div class="skeleton-shimmer h-12 w-full rounded-xl" style="height: 48px; width: 100%; border-radius: 12px;"></div>
              <div class="skeleton-shimmer h-12 w-full rounded-xl" style="height: 48px; width: 100%; border-radius: 12px;"></div>
              <div class="skeleton-shimmer h-12 w-full rounded-xl" style="height: 48px; width: 100%; border-radius: 12px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this._loadData();
    this._renderDashboard(this._wrap);
  }

  async _loadData() {
    try {
      const results = await Promise.allSettled([
        getUserProfile(),
        getUserVouchers(),
        getUserAddresses(),
        getOrders(),
        getUserReturns(),
        getRanksList()
      ]);

      if (results[0].status === 'fulfilled') {
        const profileRes = results[0].value;
        this._userProfile = profileRes?.data?.profile || null;
        this._pointsHistory = profileRes?.data?.points_history || [];
        if (this._userProfile) {
          persistAuthSession(getToken(), this._userProfile, false);
          this._syncNavbarUser(this._userProfile);
        }
      } else {
        console.error('Failed to load profile:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        this._vouchers = results[1].value?.data || [];
        localStorage.setItem('tls_vouchers_count', this._vouchers.filter(v => v.status === 'active').length);
      } else {
        console.error('Failed to load vouchers:', results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        this._addresses = results[2].value?.data || [];
      } else {
        console.error('Failed to load addresses:', results[2].reason);
      }

      if (results[3].status === 'fulfilled') {
        const ordersRes = results[3].value;
        this._orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || ordersRes?.orders || []);
        localStorage.setItem('tls_orders_count', this._orders.length);
      } else {
        console.error('Failed to load orders:', results[3].reason);
      }

      if (results[4].status === 'fulfilled') {
        this._returns = results[4].value?.data || [];
        const activeReturns = this._returns.filter(r => ['requested', 'approved', 'approved_shipping', 'shipper_pickup', 'received_checking'].includes(r.status)).length;
        localStorage.setItem('tls_returns_active', activeReturns ? '1' : '0');
      } else {
        console.error('Failed to load returns:', results[4].reason);
      }

      if (results[5].status === 'fulfilled') {
        this._ranks = results[5].value?.data || [];
      } else {
        console.error('Failed to load ranks:', results[5].reason);
      }
      window.dispatchEvent(new CustomEvent('tls-account-counts-updated'));
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  }

}

Object.assign(AccountPage.prototype, accountDashboardMethods, accountModalMethods);
