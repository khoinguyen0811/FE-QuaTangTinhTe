import { isLoggedIn, getUser } from '../services/authService.js?v=1.0.20';
import { hasAdminPermission } from '../utils/adminAuth.js';

export function renderMainNavbarHtml() {
  const user = isLoggedIn() ? getUser() : null;
  const accountText = user ? (user.full_name || user.name || 'Tài khoản').toUpperCase() : 'ĐĂNG NHẬP / ĐĂNG KÝ';
  const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;

  const canEditSettings = hasAdminPermission('settings:write');

  const socials = window.APP_SETTINGS?.home_sections?.footer?.socials || {
    facebook: 'https://facebook.com',
    shopee: 'https://shopee.vn',
    tiktok: 'https://tiktok.com',
    instagram: 'https://instagram.com'
  };

  const brandName = window.APP_SETTINGS?.brand_name || 'Thương hiệu';
  const logoUrl = window.APP_SETTINGS?.logo_url || '';

  const announcementMessages = window.APP_SETTINGS?.home_sections?.announcement_bar?.messages || [
    "FREESHIP TOÀN QUỐC",
    "MỌI ĐƠN HÀNG",
    "FREESHIP TOÀN QUỐC",
    "MỌI ĐƠN HÀNG"
  ];
  const announcementText = announcementMessages.join(' &nbsp;·&nbsp; ');

  const menuItems = window.APP_SETTINGS?.navigation_menu || [
    {
      label: "TOPS",
      href: "/products?category_slug=tops",
      children: [
        { label: "TEE", href: "/products?subcategory_slug=tee" },
        { label: "POLO", href: "/products?subcategory_slug=polo" },
        { label: "SHIRT", href: "/products?subcategory_slug=shirt" }
      ]
    },
    {
      label: "OUTWEARS",
      href: "/products?category_slug=outwears",
      children: []
    },
    {
      label: "BOTTOMS",
      href: "/products?category_slug=bottoms",
      children: [
        { label: "SHORT", href: "/products?subcategory_slug=short" },
        { label: "PANT", href: "/products?subcategory_slug=pant" }
      ]
    },
    {
      label: "ACCESSORIES",
      href: "/products?category_slug=accessories",
      children: [
        { label: "WALLET", href: "/products?subcategory_slug=wallet" },
        { label: "CAP", href: "/products?subcategory_slug=cap" },
        { label: "BACKPACKS", href: "/products?subcategory_slug=backpacks" }
      ]
    },
    {
      label: "BRAND MASSAGE",
      href: "/policies/brand-massage",
      children: []
    }
  ];

  const menuHtml = menuItems
    .filter(item => item.visible !== false)
    .map(item => {
      const visibleChildren = (item.children || []).filter(child => child.visible !== false);
      const hasChildren = visibleChildren.length > 0;
      if (hasChildren) {
        return `
            <div class="space-y-1.5 text-left">
              <button class="category-toggle-btn inline-flex items-center gap-2.5 text-lg font-black tracking-widest text-black hover:opacity-75 transition outline-none">
                <span>${item.label}</span>
                <span class="submenu-arrow text-[20px] text-[#ff3b30] select-none transition-transform duration-200 inline-block">▸</span>
              </button>
              <div class="submenu-content max-h-0 overflow-hidden transition-all duration-300 pl-1 mt-1">
                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold tracking-wider text-zinc-500 uppercase pb-1">
                  ${visibleChildren.map((child, idx) => `
                    <a href="${child.href}" class="hover:text-black transition">${child.label}</a>
                    ${idx < visibleChildren.length - 1 ? '<span class="text-zinc-300">|</span>' : ''}
                  `).join('')}
                </div>
              </div>
            </div>
          `;
      } else {
        return `
            <div class="space-y-1.5 text-left">
              <a href="${item.href}" class="inline-flex items-center gap-2.5 text-lg font-black tracking-widest text-black hover:opacity-75 transition">
                <span>${item.label}</span>
              </a>
            </div>
          `;
      }
    }).join('\n');

  return `
      <!-- ANNOUNCEMENT BAR -->
      <div id="announcement-bar" class="w-full bg-black text-white py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-all duration-300 overflow-hidden relative group">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span>${announcementText}</span>
            <span>&nbsp;·&nbsp; ${announcementText} &nbsp;·&nbsp;</span>
          </div>
        </div>
        ${canEditSettings ? `
          <button id="nav-edit-announcement-btn" class="absolute right-4 top-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition flex items-center gap-1 text-[9px] font-bold text-[#C9A84C] hover:text-white bg-black/60 px-2 py-1 rounded border border-[#C9A84C]/30 cursor-pointer select-none outline-none z-10" title="Chỉnh sửa dòng thông báo">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Sửa tin</span>
          </button>
        ` : ''}
      </div>

      <!-- DESKTOP NAVBAR -->
      <div id="navbar-container" class="hidden w-full items-center justify-between gap-8 px-6 lg:flex py-6 transition-all duration-300">
        <div class="flex items-center gap-10">
          <button id="nav-menu-btn" class="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-black outline-none hover:opacity-75 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            MENU
          </button>
          <div class="relative w-48 border-b border-zinc-400 focus-within:border-black transition duration-200">
            <input id="nav-search-input" type="text" placeholder="Tìm kiếm..." class="w-full bg-transparent text-sm py-1 outline-none text-zinc-800 placeholder-zinc-500 font-bold" />
          </div>
        </div>

        <div class="relative group flex items-center justify-center">
          <a href="/" id="nav-logo" class="font-sans text-3xl font-black uppercase tracking-[0.16em] text-black hover:opacity-75 transition flex items-center justify-center">
            ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-10 max-h-12 max-w-full object-contain" />` : brandName}
          </a>
          ${canEditSettings ? `
            <button id="nav-edit-logo-btn" class="absolute -right-16 top-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition flex items-center gap-1 text-[9px] font-bold text-[#C9A84C] hover:text-black bg-white/80 backdrop-blur-xs px-2 py-1 rounded border border-[#C9A84C]/30 cursor-pointer select-none outline-none z-10 shadow-sm" title="Chỉnh sửa logo thương hiệu">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Sửa logo</span>
            </button>
          ` : ''}
        </div>

        <div class="flex items-center gap-8">
          <a href="/account" id="nav-account-link" class="text-sm font-black uppercase tracking-wider text-black hover:opacity-75 transition flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span id="nav-account-text">${accountText}</span>
          </a>
          ${isEcommerce ? `
          <button id="nav-cart-btn" class="relative text-black hover:opacity-75 transition outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span id="nav-cart-badge" class="absolute -right-2.5 -top-2 hidden min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black text-white px-1 text-[10px] font-black leading-none">0</span>
          </button>
          ` : ''}
        </div>
      </div>

      <!-- MOBILE NAVBAR -->
      <div id="mobile-navbar-container" class="lg:hidden flex w-full items-center justify-between px-6 py-4 transition-all duration-300">
        <button id="mobile-hamburger" class="inline-flex h-10 w-10 items-center justify-start text-black outline-none" title="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="relative group flex items-center justify-center">
          <a href="/" id="mobile-logo-link" class="font-sans text-2xl font-black uppercase tracking-[0.16em] text-black flex items-center justify-center">
            ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="h-8 max-h-10 max-w-full object-contain" />` : brandName}
          </a>
          ${canEditSettings ? `
            <button id="mobile-edit-logo-btn" class="absolute -right-14 top-1/2 -translate-y-1/2 opacity-100 transition flex items-center gap-1 text-[8px] font-bold text-[#C9A84C] hover:text-black bg-white/85 px-1.5 py-0.5 rounded border border-[#C9A84C]/30 cursor-pointer select-none outline-none z-10 shadow-xs" title="Chỉnh sửa logo thương hiệu">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Sửa</span>
            </button>
          ` : ''}
        </div>
        <div class="flex items-center gap-1">
          <a href="/account" id="mobile-account-btn" class="relative inline-flex h-10 w-9 items-center justify-center outline-none ${isLoggedIn() ? 'text-emerald-500' : 'text-black'} transition" title="Tài khoản">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
          ${isEcommerce ? `
          <button id="mobile-cart-btn" class="relative inline-flex h-10 w-9 items-center justify-center text-black outline-none" title="Giỏ hàng">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span id="mobile-cart-badge" class="absolute -right-1 -top-1 hidden min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black text-white px-1 text-[10px] font-black leading-none">0</span>
          </button>
          ` : ''}
        </div>
      </div>

      <!-- SIDEBAR MENU DRAWER -->
      <div id="sidebar-overlay" class="fixed inset-0 z-[60] hidden bg-black/40 opacity-0 transition-opacity duration-300"></div>
      
      <aside id="mobile-sidebar" class="fixed inset-y-0 left-0 z-[70] hidden w-full max-w-[420px] -translate-x-full bg-white transition-transform duration-300 ease-out flex flex-col p-10 pb-8 shadow-[15px_0_30px_rgba(0,0,0,0.05)] border-r border-zinc-100 overflow-x-hidden">
        <!-- Search & Close Header -->
        <div class="flex items-center justify-between pb-8 shrink-0">
          <div class="flex-1 flex items-center gap-2 mr-6 border-b border-black pb-1.5 focus-within:border-zinc-400 transition-colors">
            <svg class="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="drawer-search-input" type="text" placeholder="Tìm kiếm..." class="w-full bg-transparent text-sm font-bold uppercase tracking-wider outline-none text-black placeholder-zinc-400" />
          </div>
          <button id="close-sidebar" class="flex items-center gap-1.5 text-sm font-black text-black hover:opacity-75 outline-none shrink-0 transition">
            <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Đóng</span>
          </button>
        </div>

        <!-- Categories & Subcategories List -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-6 font-sans scrollbar-none">
          ${canEditSettings ? `
            <div class="flex items-center justify-between border-b border-zinc-100 pb-2 mb-4">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DANH MỤC MENU</span>
              <button id="sidebar-edit-menu-btn" class="flex items-center gap-1.5 text-[10px] font-black text-[#C9A84C] hover:text-black transition cursor-pointer select-none bg-transparent border-0 outline-none" title="Chỉnh sửa menu">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>Sửa Menu</span>
              </button>
            </div>
          ` : ''}
          ${menuHtml}
        </div>

        <!-- Policies Links -->
        <div class="pt-10 space-y-4shrink-0 text-left">
          ${canEditSettings ? `
            <div class="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CHÍNH SÁCH</span>
              <button id="sidebar-edit-policies-btn" class="flex items-center gap-1 text-[10px] font-black text-[#C9A84C] hover:text-black transition cursor-pointer select-none bg-transparent border-0 outline-none" title="Chỉnh sửa chính sách">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>Sửa chính sách</span>
              </button>
            </div>
          ` : ''}
          ${(window.APP_SETTINGS?.policies_menu || [
      { label: 'WORLDWIDE SHIPPING', href: '/policies/worldwide-shipping', visible: true },
      { label: 'BẢO QUẢN SẢN PHẨM', href: '/policies/product-care', visible: true },
      { label: 'CHÍNH SÁCH ĐỔI – TRẢ HÀNG', href: '/policies/exchange-policy', visible: true },
      { label: 'CHÍNH SÁCH BẢO MẬT', href: '/policies/privacy-policy', visible: true },
      { label: 'HỆ THỐNG THÀNH VIÊN', href: '/member/system', visible: true },
      { label: 'HỆ THỐNG CỬA HÀNG', href: '/policies/store-system', visible: true }
    ])
      .filter(item => item.visible !== false)
      .map(item => `
              <a href="${item.href}" class="block text-[14px] font-black tracking-widest text-black uppercase hover:opacity-75 transition">${item.label}</a>
            `).join('\n')}
        </div>

        <!-- Social Media & Copyright -->
        <div class="pt-8 space-y-3 font-sans shrink-0 text-left">
          <div class="flex flex-wrap items-center gap-4 text-[9px] font-black tracking-widest text-zinc-500 uppercase">
            <a href="${socials.facebook || 'https://facebook.com'}" target="_blank" class="hover:text-black transition">FACEBOOK</a>
            <a href="${socials.shopee || 'https://shopee.vn'}" target="_blank" class="hover:text-black transition">SHOPEE</a>
            <a href="${socials.tiktok || 'https://tiktok.com'}" target="_blank" class="hover:text-black transition">TIKTOK</a>
            <a href="${socials.instagram || 'https://instagram.com'}" target="_blank" class="hover:text-black transition">INSTAGRAM</a>
          </div>
          <p class="text-[9px] font-bold text-zinc-400 tracking-wider">thelstudio</p>
        </div>
      </aside>
      ${(function() {
        const showBottomNav = isLoggedIn() && (window.APP_SETTINGS?.is_ecommerce !== 0);
        if (!showBottomNav) return '';
        const ordersCount = parseInt(localStorage.getItem('tls_orders_count') || '0', 10);
        const vouchersCount = parseInt(localStorage.getItem('tls_vouchers_count') || '0', 10);
        const returnsActive = localStorage.getItem('tls_returns_active') === '1';

        const pathname = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const isAccountPage = pathname === '/account' || pathname === '/member';
        const activeTab = isAccountPage ? (params.get('tab') || 'orders') : '';
        const displayClass = isAccountPage ? 'flex' : 'hidden';

        return `
          <!-- Mobile Bottom Tab Bar -->
          <div id="global-mobile-bottom-nav" class="${displayClass} md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-150 z-[100001] justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)]" style="height: calc(64px + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px);">
            <button id="global-btn-tab-orders" class="flex flex-col items-center justify-center w-16 h-full focus:outline-none relative">
              <span class="w-6 h-6 flex items-center justify-center ${activeTab === 'orders' ? 'text-zinc-950 scale-110' : 'text-zinc-400'} transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /><path d="M16 5.25l-8 4.5" /></svg>
              </span>
              <span class="text-[9px] font-black uppercase mt-1 tracking-wider ${activeTab === 'orders' ? 'text-zinc-950' : 'text-zinc-400'} font-sans">Đơn</span>
              <span id="tab-orders-badge" class="absolute top-2 right-3 w-4 h-4 bg-zinc-900 text-white rounded-full text-[8px] font-bold flex items-center justify-center ${ordersCount > 0 ? '' : 'hidden'}">${ordersCount}</span>
            </button>
            <button id="global-btn-tab-returns" class="flex flex-col items-center justify-center w-16 h-full focus:outline-none relative">
              <span class="w-6 h-6 flex items-center justify-center ${activeTab === 'returns' ? 'text-zinc-950 scale-110' : 'text-zinc-400'} transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
              </span>
              <span class="text-[9px] font-black uppercase mt-1 tracking-wider ${activeTab === 'returns' ? 'text-zinc-950' : 'text-zinc-400'} font-sans">Đổi/Trả</span>
              <span id="tab-returns-badge" class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ${returnsActive ? '' : 'hidden'}"></span>
            </button>
            <button id="global-btn-tab-vouchers" class="flex flex-col items-center justify-center w-16 h-full focus:outline-none relative">
              <span class="w-6 h-6 flex items-center justify-center ${activeTab === 'vouchers' ? 'text-zinc-950 scale-110' : 'text-zinc-400'} transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 5l0 2" /><path d="M15 11l0 2" /><path d="M15 17l0 2" /><path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" /></svg>
              </span>
              <span class="text-[9px] font-black uppercase mt-1 tracking-wider ${activeTab === 'vouchers' ? 'text-zinc-950' : 'text-zinc-400'} font-sans">Voucher</span>
              <span id="tab-vouchers-badge" class="absolute top-2 right-2 w-4 h-4 bg-amber-500 text-zinc-950 rounded-full text-[8px] font-bold flex items-center justify-center ${vouchersCount > 0 ? '' : 'hidden'}">${vouchersCount}</span>
            </button>
            <button id="global-btn-tab-menu" class="flex flex-col items-center justify-center w-16 h-full focus:outline-none">
              <span class="w-6 h-6 flex items-center justify-center text-zinc-450">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
              </span>
              <span class="text-[9px] font-black uppercase mt-1 tracking-wider text-zinc-400 font-sans">Khác</span>
            </button>
          </div>
        `;
      })()}
    `;
}
