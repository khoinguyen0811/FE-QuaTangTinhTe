import { cartService } from '../services/cartService.js';
import { navigate } from '../utils/helpers.js';
import { isLoggedIn, getUser, getToken } from '../services/authService.js?v=1.0.20';
import { renderMainNavbarHtml } from './MainNavbarTemplate.js?v=1.0.96';
import { API_BASE } from '../services/config.js';

export class MainNavbar {
  constructor() {
    this._el = null;
    this._cartListener = () => this.updateCartCount();
  }

  updateCartCount() {
    const count = cartService.getCount();
    ['nav-cart-badge', 'mobile-cart-badge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = count;
        el.classList.toggle('hidden', count <= 0);
        el.classList.toggle('flex', count > 0);
      }
    });
    ['nav-cart-btn', 'mobile-cart-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el && count > 0) {
        el.classList.remove('animate-cart-bounce');
        void el.offsetWidth;
        el.classList.add('animate-cart-bounce');
        setTimeout(() => el.classList.remove('animate-cart-bounce'), 650);
      }
    });
  }

  render() {
    const nav = document.createElement('nav');
    nav.id = 'main-navbar';
    nav.className = 'absolute top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 py-0';
    nav.innerHTML = this._html();
    this._el = nav;
    
    this._bindEvents(nav);

    const overlay = nav.querySelector('#sidebar-overlay');
    const sidebar = nav.querySelector('#mobile-sidebar');
    const bottomNav = nav.querySelector('#global-mobile-bottom-nav');
    document.getElementById('sidebar-overlay')?.remove();
    document.getElementById('mobile-sidebar')?.remove();
    document.getElementById('global-mobile-bottom-nav')?.remove();
    if (overlay) document.body.appendChild(overlay);
    if (sidebar) document.body.appendChild(sidebar);
    if (bottomNav) document.body.appendChild(bottomNav);

    const onScroll = () => {
      const bar = nav.querySelector('#announcement-bar');
      const deskContainer = nav.querySelector('#navbar-container');
      const mobileContainer = nav.querySelector('#mobile-navbar-container');
      
      const isHome = window.location.pathname === '/' || 
                     window.location.pathname === '/index.html' || 
                     window.location.pathname.endsWith('/frontend/') || 
                     window.location.pathname.endsWith('/frontend/index.html') ||
                     window.location.pathname.endsWith('/public/') ||
                     window.location.pathname.endsWith('/public/index.html');

      if (window.scrollY > 40) {
        nav.className = 'fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 transition-all duration-300 py-0';
        if (bar) { bar.style.maxHeight = '0'; bar.style.paddingTop = '0'; bar.style.paddingBottom = '0'; bar.style.opacity = '0'; }
        if (deskContainer) { deskContainer.classList.remove('py-6'); deskContainer.classList.add('py-4'); }
        if (mobileContainer) { mobileContainer.classList.remove('py-4'); mobileContainer.classList.add('py-2'); }
      } else {
        if (isHome) {
          nav.className = 'absolute top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 py-0';
        } else {
          nav.className = 'absolute top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200 transition-all duration-300 py-0';
        }
        if (bar) { bar.style.maxHeight = ''; bar.style.paddingTop = ''; bar.style.paddingBottom = ''; bar.style.opacity = ''; }
        if (deskContainer) { deskContainer.classList.remove('py-4'); deskContainer.classList.add('py-6'); }
        if (mobileContainer) { mobileContainer.classList.remove('py-2'); mobileContainer.classList.add('py-4'); }
      }
    };
    onScroll();
    if (this._scrollListener) {
      window.removeEventListener('scroll', this._scrollListener);
    }
    this._scrollListener = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.removeEventListener('cart-updated', this._cartListener);
    window.addEventListener('cart-updated', this._cartListener);
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('auth-changed', {
        detail: { user: isLoggedIn() ? getUser() : null },
      }));
    });
    return nav;
  }

  _html() {

    return renderMainNavbarHtml.call(this);

  }

  _bindEvents(nav) {
    window.addEventListener('auth-changed', (e) => {
      const user = e.detail?.user;
      if (user === undefined && isLoggedIn()) {
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: getUser() } }));
        return;
      }
      const textEl = nav.querySelector('#nav-account-text');
      if (textEl) {
        textEl.textContent = user ? (user.full_name || user.name || 'Tài khoản').toUpperCase() : 'ĐĂNG NHẬP / ĐĂNG KÝ';
      }

      // Update mobile account button color
      const mobileAccBtn = nav.querySelector('#mobile-account-btn');
      if (mobileAccBtn) {
        if (user) {
          mobileAccBtn.classList.remove('text-black');
          mobileAccBtn.classList.add('text-emerald-500');
        } else {
          mobileAccBtn.classList.remove('text-emerald-500');
          mobileAccBtn.classList.add('text-black');
        }
      }
      this.updateBottomNavVisibility();
    });

    nav.querySelectorAll('.nav-link-a, #nav-logo, #mobile-logo-link, #nav-account-link, #mobile-account-btn').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#')) {
          e.preventDefault();
          navigate(href);
        }
      });
    });

    const openCart = () => window.dispatchEvent(new CustomEvent('open-cart'));
    nav.querySelector('#nav-cart-btn')?.addEventListener('click', openCart);
    nav.querySelector('#mobile-cart-btn')?.addEventListener('click', openCart);

    const sidebar = nav.querySelector('#mobile-sidebar');
    const overlay = nav.querySelector('#sidebar-overlay');
    const closeSidebar = nav.querySelector('#close-sidebar');

    const openSidebar = () => {
      sidebar.classList.remove('hidden');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
      });
    };

    const closeSidebarFn = () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (sidebar.classList.contains('-translate-x-full')) {
          sidebar.classList.add('hidden');
          overlay.classList.add('hidden');
        }
      }, 300);
    };

    nav.querySelector('#nav-menu-btn')?.addEventListener('click', openSidebar);
    nav.querySelector('#mobile-hamburger')?.addEventListener('click', openSidebar);
    closeSidebar?.addEventListener('click', closeSidebarFn);
    overlay?.addEventListener('click', closeSidebarFn);

    nav.querySelector('#sidebar-edit-menu-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSidebarFn();
      const { openQuickSettings } = await import('./QuickSettingsModal.js?v=1.0.24');
      openQuickSettings('menu');
    });

    nav.querySelector('#sidebar-edit-policies-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSidebarFn();
      const { openQuickSettings } = await import('./QuickSettingsModal.js?v=1.0.24');
      openQuickSettings('policies');
    });

    nav.querySelector('#nav-edit-announcement-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { openQuickSettings } = await import('./QuickSettingsModal.js?v=1.0.24');
      openQuickSettings('sections', 'announcement_bar');
    });

    nav.querySelector('#nav-edit-logo-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { openQuickSettings } = await import('./QuickSettingsModal.js?v=1.0.24');
      openQuickSettings('brand');
    });

    nav.querySelector('#mobile-edit-logo-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { openQuickSettings } = await import('./QuickSettingsModal.js?v=1.0.24');
      openQuickSettings('brand');
    });

    nav.querySelectorAll('#mobile-sidebar a').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http')) {
          e.preventDefault();
          closeSidebarFn();
          navigate(href);
        }
      });
    });



    const handleSearch = q => {
      if (q.trim()) navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    };

    nav.querySelector('#nav-search-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch(e.target.value);
    });

    const drawerSearch = nav.querySelector('#drawer-search-input');
    drawerSearch?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        closeSidebarFn();
        handleSearch(e.target.value);
      }
    });

    nav.querySelectorAll('.category-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        const arrow = btn.querySelector('.submenu-arrow');
        const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

        nav.querySelectorAll('.submenu-content').forEach(c => {
          c.style.maxHeight = '0px';
          c.previousElementSibling.querySelector('.submenu-arrow')?.classList.remove('rotate-90');
        });

        if (isOpen) {
          content.style.maxHeight = '0px';
          arrow?.classList.remove('rotate-90');
        } else {
          content.style.maxHeight = `${content.scrollHeight}px`;
          arrow?.classList.add('rotate-90');
        }
      });
    });

    this.updateCartCount();

    // Global bottom nav event bindings
    const btnOrders = nav.querySelector('#global-btn-tab-orders');
    const btnReturns = nav.querySelector('#global-btn-tab-returns');
    const btnVouchers = nav.querySelector('#global-btn-tab-vouchers');
    const btnMenu = nav.querySelector('#global-btn-tab-menu');

    if (btnOrders) {
      btnOrders.addEventListener('click', () => {
        if (window.location.pathname === '/account' && window.accountPage) {
          window.accountPage.setTab('orders');
          this.updateGlobalBottomNavActive('orders');
        } else {
          navigate('/account?tab=orders');
        }
      });
    }

    if (btnReturns) {
      btnReturns.addEventListener('click', () => {
        if (window.location.pathname === '/account' && window.accountPage) {
          window.accountPage.setTab('returns');
          this.updateGlobalBottomNavActive('returns');
        } else {
          navigate('/account?tab=returns');
        }
      });
    }

    if (btnVouchers) {
      btnVouchers.addEventListener('click', () => {
        if (window.location.pathname === '/account' && window.accountPage) {
          window.accountPage.setTab('vouchers');
          this.updateGlobalBottomNavActive('vouchers');
        } else {
          navigate('/account?tab=vouchers');
        }
      });
    }

    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        if (window.location.pathname === '/account' && window.accountPage) {
          window.accountPage.openMobileMenu();
        } else {
          navigate('/account?tab=profile');
        }
      });
    }

    window.removeEventListener('tls-tab-changed', this._tabChangeListener);
    this._tabChangeListener = (e) => this.updateGlobalBottomNavActive(e.detail.tab);
    window.addEventListener('tls-tab-changed', this._tabChangeListener);

    window.removeEventListener('tls-account-counts-updated', this._countsUpdatedListener);
    this._countsUpdatedListener = () => this.updateMobileBottomNavBadges();
    window.addEventListener('tls-account-counts-updated', this._countsUpdatedListener);

    if (this._popstateListener) {
      window.removeEventListener('popstate', this._popstateListener);
    }
    this._popstateListener = () => this.updateBottomNavVisibility();
    window.addEventListener('popstate', this._popstateListener);

    if (isLoggedIn()) {
      if (localStorage.getItem('tls_orders_count') === null) {
        this._fetchCountsSilently();
      } else {
        this.updateMobileBottomNavBadges();
      }
    }
    this.updateBottomNavVisibility();
  }

  updateMobileBottomNavBadges() {
    const nav = document.getElementById('global-mobile-bottom-nav');
    if (!nav) return;
    const ordersCount = parseInt(localStorage.getItem('tls_orders_count') || '0', 10);
    const vouchersCount = parseInt(localStorage.getItem('tls_vouchers_count') || '0', 10);
    const returnsActive = localStorage.getItem('tls_returns_active') === '1';

    const ordersBadge = nav.querySelector('#tab-orders-badge');
    const returnsBadge = nav.querySelector('#tab-returns-badge');
    const vouchersBadge = nav.querySelector('#tab-vouchers-badge');

    if (ordersBadge) {
      ordersBadge.textContent = ordersCount;
      ordersBadge.classList.toggle('hidden', ordersCount <= 0);
    }
    if (returnsBadge) {
      returnsBadge.classList.toggle('hidden', !returnsActive);
    }
    if (vouchersBadge) {
      vouchersBadge.textContent = vouchersCount;
      vouchersBadge.classList.toggle('hidden', vouchersCount <= 0);
    }
  }

  updateGlobalBottomNavActive(activeTab) {
    const nav = document.getElementById('global-mobile-bottom-nav');
    if (!nav) return;

    const tabs = ['orders', 'returns', 'vouchers'];
    tabs.forEach(tab => {
      const btn = nav.querySelector(`#global-btn-tab-${tab}`);
      if (btn) {
        const iconContainer = btn.firstElementChild;
        const textLabel = btn.querySelector('span.font-sans');

        if (tab === activeTab) {
          iconContainer?.classList.remove('text-zinc-400');
          iconContainer?.classList.add('text-zinc-950', 'scale-110');
          if (textLabel) {
            textLabel.classList.remove('text-zinc-400');
            textLabel.classList.add('text-zinc-950');
          }
        } else {
          iconContainer?.classList.remove('text-zinc-950', 'scale-110');
          iconContainer?.classList.add('text-zinc-400');
          if (textLabel) {
            textLabel.classList.remove('text-zinc-950');
            textLabel.classList.add('text-zinc-400');
          }
        }
      }
    });
  }

  updateBottomNavVisibility() {
    const bottomNav = document.getElementById('global-mobile-bottom-nav');
    if (!bottomNav) return;

    const pathname = window.location.pathname;
    const isAccountPage = pathname === '/account' || pathname === '/member';
    const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;
    const shouldShow = isLoggedIn() && isAccountPage && isEcommerce;

    if (shouldShow) {
      bottomNav.classList.remove('hidden');
      bottomNav.classList.add('flex');
    } else {
      bottomNav.classList.remove('flex');
      bottomNav.classList.add('hidden');
    }
  }

  _fetchCountsSilently() {
    if (!isLoggedIn()) return;
    const token = getToken();
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/orders`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/api/user/vouchers`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/api/user/returns`, { headers }).then(r => r.ok ? r.json() : [])
    ]).then(([ordersRes, vouchersRes, returnsRes]) => {
      const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || ordersRes?.orders || []);
      const vouchers = vouchersRes?.data || [];
      const returns = returnsRes?.data || [];

      localStorage.setItem('tls_orders_count', orders.length);
      localStorage.setItem('tls_vouchers_count', vouchers.filter(v => v.status === 'active').length);
      const activeReturns = returns.filter(r => ['requested', 'approved', 'approved_shipping', 'shipper_pickup', 'received_checking'].includes(r.status)).length;
      localStorage.setItem('tls_returns_active', activeReturns ? '1' : '0');

      this.updateMobileBottomNavBadges();
    }).catch(err => {
      console.warn('Silent counts fetch failed:', err);
    });
  }
}
