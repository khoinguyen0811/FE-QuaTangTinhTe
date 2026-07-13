import { STORAGE_KEYS } from '../../../services/config.js';
import { hasPermission, isSuperAdmin, isSystem } from './ui.js';
import { NAV_ITEMS } from './navItems.js';
import { loadBadges } from './sidebarBadges.js';

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
}

export function renderSidebar(container, activeRoute) {
  const token = getAdminToken();
  let userName = 'Admin';
  let roleText = 'Quản trị viên';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userName = payload.full_name || payload.name || payload.email || 'Admin';

      const displayNames = payload.role_display_names || payload.roles || [];
      if (displayNames.length > 0) {
        const mapping = {
          'system': 'Quản trị viên hệ thống',
          'super_admin': 'Quản trị viên cấp cao',
          'admin': 'Quản trị viên',
          'editor': 'Biên tập viên',
          'viewer': 'Người xem',
          'seller': 'Nhân viên bán hàng',
          'Super Administrator': 'Quản trị viên cấp cao',
          'Administrator': 'Quản trị viên',
          'Editor': 'Biên tập viên',
          'Viewer': 'Người xem'
        };
        roleText = displayNames.map(r => mapping[r] || r).join(', ');
      }
    }
  } catch { }

  const brandName = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';
  document.title = `Admin — ${brandName}`;
  const logoUrl = window.APP_SETTINGS?.logo_url || '';

  let activeGroup = localStorage.getItem('sly_active_sidebar_group');
  const lastRoute = localStorage.getItem('sly_last_rendered_route');
  
  // Detect group based on activeRoute
  const belongsToHome = ['dashboard', 'analytics'].some(r => activeRoute.startsWith(r));
  const belongsToEcommerce = ['products', 'variants', 'categories', 'orders', 'returns', 'vouchers', 'flash-sales', 'reviews', 'members', 'ranks', 'products_group', 'orders_group', 'vouchers_group'].some(r => activeRoute.startsWith(r));
  const belongsToContent = ['blogs', 'blog_categories', 'blog_tags', 'reviews', 'languages', 'translations', 'blogs_group', 'languages_group'].some(r => activeRoute.startsWith(r));
  const belongsToSystem = ['users', 'roles', 'settings', 'api-settings', 'system', 'system-model', 'system-ip-block', 'system_group'].some(r => activeRoute.startsWith(r));

  let routeGroup = 'HOME';
  if (belongsToEcommerce) routeGroup = 'ECOMMERCE';
  else if (belongsToContent) routeGroup = 'NỘI DUNG';
  else if (belongsToSystem) routeGroup = 'HỆ THỐNG';

  // Sync group automatically ONLY when activeRoute changes (meaning actual navigation happened)
  if (activeRoute !== lastRoute) {
    activeGroup = routeGroup;
    localStorage.setItem('sly_active_sidebar_group', activeGroup);
    localStorage.setItem('sly_last_rendered_route', activeRoute);
  } else if (!activeGroup) {
    activeGroup = routeGroup;
    localStorage.setItem('sly_active_sidebar_group', activeGroup);
  }

  const getRailBtnClass = (isActive) => isActive 
    ? 'p-2.5 rounded-xl bg-[#5d58f0] text-white transition-all shadow-md shadow-[#5d58f0]/15 border-none cursor-pointer flex items-center justify-center' 
    : 'p-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all border-none cursor-pointer flex items-center justify-center';

  container.innerHTML = `
    <aside id="admin-sidebar-aside" class="w-80 h-screen bg-[#0c0f1d] border-r border-[#1e2945] flex flex-row fixed left-0 top-0 z-30 transition-transform duration-300 transform -translate-x-full lg:translate-x-0">
      
      <!-- COLUMN 1: Slim Left Rail -->
      <div class="w-[70px] bg-[#080b16] border-r border-[#1e2945]/45 flex flex-col items-center py-4 justify-between flex-shrink-0">
        
        <!-- Top Icons -->
        <div class="w-full flex flex-col items-center gap-6">
          <!-- Toggle Hamburger -->
          <button id="sidebar-toggle-mini" class="p-2 text-gray-400 hover:text-white rounded-lg transition-colors border-none bg-transparent cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          
          <div class="w-full h-px bg-[#1e2945]/30"></div>
          
          <!-- Category Icons -->
          <!-- 1. Layers (Dashboards) -->
          <button id="rail-btn-home" class="${getRailBtnClass(activeGroup === 'HOME')}" title="Dashboard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </button>
          
          <!-- 2. Catalog / E-commerce -->
          <button id="rail-btn-ecommerce" class="${getRailBtnClass(activeGroup === 'ECOMMERCE')}" title="E-commerce & Bán hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
          
          <!-- 3. Content / Blogs -->
          <button id="rail-btn-content" class="${getRailBtnClass(activeGroup === 'NỘI DUNG')}" title="Nội dung bài viết">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </button>
          
          <!-- 4. System / Config -->
          <button id="rail-btn-system" class="${getRailBtnClass(activeGroup === 'HỆ THỐNG')}" title="Hệ thống & Cấu hình">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
        
        <!-- Bottom Theme Config Icon Link -->
        <a href="#settings" class="p-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all border-none cursor-pointer" title="Cài đặt chung">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        </a>
        
      </div>
      
      <!-- COLUMN 2: Extended Navigation Menu -->
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        
        <!-- Brand Header -->
        <div class="px-5 py-4 border-b border-[#1e2945]/45 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <!-- Stylized M logo -->
            <svg class="w-6 h-6 text-[#8762f9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20V8l8 6 8-6v12"/>
            </svg>
            <span class="text-base font-extrabold tracking-tight text-white select-none">MatBaoWS</span>
          </div>
        </div>
        
        <!-- Navigation Link list -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1" id="sidebar-nav"></nav>
        
        <!-- Bottom Logout / User Box -->
        <div class="p-3 border-t border-[#1e2945]/45 flex-shrink-0 bg-[#0a0d18]/30">
          <div class="flex items-center justify-between p-2 rounded-xl bg-[#11162a]/40 gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#8762f9]/20 flex items-center justify-center text-[#8762f9] font-extrabold text-xs flex-shrink-0">
                ${userName.charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-white truncate leading-tight">${userName}</div>
                <div class="text-[9px] text-[#8e94bb] truncate mt-0.5">${roleText}</div>
              </div>
            </div>
            <button id="sidebar-logout" class="p-1 rounded-lg hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer" title="Đăng xuất">
              <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
        
      </div>
      
    </aside>
    <div id="admin-sidebar-backdrop" class="fixed inset-0 bg-black/50 z-20 hidden opacity-0 transition-opacity duration-300 lg:hidden"></div>
    <div id="admin-sidebar-spacer" class="hidden lg:block w-80 flex-shrink-0"></div>
  `;

  const backdrop = container.querySelector('#admin-sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      const aside = container.querySelector('#admin-sidebar-aside');
      if (aside) {
        aside.classList.add('-translate-x-full');
        aside.classList.remove('translate-x-0');
      }
      backdrop.classList.remove('opacity-100');
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 300);
    });
  }

  // Sidebar mini collapsing toggle on desktop
  const toggleMini = container.querySelector('#sidebar-toggle-mini');
  if (toggleMini) {
    toggleMini.addEventListener('click', () => {
      const aside = container.querySelector('#admin-sidebar-aside');
      const spacer = container.querySelector('#admin-sidebar-spacer');
      if (aside && spacer) {
        aside.classList.toggle('collapsed');
        spacer.classList.toggle('collapsed');
        const isCollapsed = aside.classList.contains('collapsed');
        localStorage.setItem('sly_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      }
    });
  }

  // Restores sidebar collapsed state on reload
  const isCollapsed = localStorage.getItem('sly_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    setTimeout(() => {
      const aside = container.querySelector('#admin-sidebar-aside');
      const spacer = container.querySelector('#admin-sidebar-spacer');
      if (aside && spacer) {
        aside.classList.add('collapsed');
        spacer.classList.add('collapsed');
      }
    }, 10);
  }

  const bindRailBtn = (selector, group) => {
    const btn = container.querySelector(selector);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('sly_active_sidebar_group', group);
        renderSidebar(container, activeRoute);
      });
    }
  };
  bindRailBtn('#rail-btn-home', 'HOME');
  bindRailBtn('#rail-btn-ecommerce', 'ECOMMERCE');
  bindRailBtn('#rail-btn-content', 'NỘI DUNG');
  bindRailBtn('#rail-btn-system', 'HỆ THỐNG');

  const isEcommerce = window.APP_SETTINGS?.is_ecommerce !== 0;

  const nav = container.querySelector('#sidebar-nav');
  nav.innerHTML = ''; // Clear existing navigation items first

  NAV_ITEMS.filter(section => section.title === activeGroup).forEach(section => {
    // Filter items inside this section that the user has permission to see
    const allowedItems = section.items.filter(item => {
      if (!isEcommerce) {
        if (item.id === 'orders_group' || item.id === 'vouchers_group') {
          return false;
        }
      }
      const isDisabled = window.APP_SETTINGS?.disabled_modules?.includes(item.id);
      if (isDisabled && !isSystem()) {
        return false;
      }
      if (item.roleRequired === 'super_admin' && !isSuperAdmin()) return false;
      if (item.roleRequired === 'system' && !isSystem()) return false;
      if (item.permission && !hasPermission(item.permission)) return false;
      return true;
    });

    if (allowedItems.length === 0) return;

    // Render section title
    const titleEl = document.createElement('div');
    titleEl.className = 'text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wider px-3 mt-6 mb-2 select-none';
    titleEl.textContent = section.title;
    nav.appendChild(titleEl);

    // Render allowed section items
    allowedItems.forEach(item => {
      if (item.children) {
        const allowedChildren = item.children.filter(child => {
          if (child.roleRequired === 'super_admin' && !isSuperAdmin()) return false;
          if (child.roleRequired === 'system' && !isSystem()) return false;
          if (child.permission && !hasPermission(child.permission)) return false;
          
          const isDisabledChild = window.APP_SETTINGS?.disabled_modules?.includes(child.id);
          if (isDisabledChild && !isSystem()) return false;
          
          return true;
        });
        
        if (allowedChildren.length === 0) return;

        const hasActiveChild = allowedChildren.some(child => activeRoute === child.id);
        
        const parentBtn = document.createElement('button');
        const isDisabledGroup = window.APP_SETTINGS?.disabled_modules?.includes(item.id);
        parentBtn.className = `w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ease-in-out transform group ${
          hasActiveChild 
            ? 'text-[#5d58f0] bg-[#5d58f0]/10 font-semibold' 
            : 'text-gray-400 hover:text-[#5d58f0] hover:bg-[#5d58f0]/10 hover:translate-x-1'
        } ${isDisabledGroup ? 'text-red-500 hover:text-red-400' : ''}`;
        parentBtn.innerHTML = `
          <div class="flex items-center gap-3 min-w-0">
            <span class="transition-colors flex-shrink-0 flex items-center justify-center" style="${hasActiveChild ? 'color: #5d58f0;' : ''}">${item.icon}</span>
            <span class="truncate pr-1">${item.label}</span>
          </div>
          <div class="flex items-center gap-1.5 ml-auto mr-2">
            ${allowedChildren.some(c => c.badge === 'pending') ? `<span id="parent-badge-${item.id}-pending" class="bg-yellow-550 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden"></span>` : ''}
            ${allowedChildren.some(c => c.badge === 'lowstock') ? `<span id="parent-badge-${item.id}-lowstock" class="w-2 h-2 rounded-full bg-red-500 hidden"></span>` : ''}
          </div>
          <span class="chevron-icon transition-transform duration-200 ${hasActiveChild ? 'rotate-90' : ''}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        `;

        const subList = document.createElement('div');
        subList.className = `pl-9 space-y-1 overflow-hidden transition-all duration-300 ${
          hasActiveChild ? 'max-h-40 opacity-100 mb-2' : 'max-h-0 opacity-0'
        }`;

        allowedChildren.forEach(child => {
          const isActiveChild = activeRoute === child.id;
          const isDisabledChild = window.APP_SETTINGS?.disabled_modules?.includes(child.id);
          const subLink = document.createElement('a');
          subLink.href = child.hash;
          
          let subLinkClass = `flex items-center gap-2 pl-0 pr-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ease-in-out transform relative `;
          if (isActiveChild) {
            subLinkClass += `bg-[#5d58f0] text-white font-bold shadow-md pl-[11px]`;
          } else if (isDisabledChild) {
            subLinkClass += `text-red-500 hover:text-red-450 font-semibold`;
          } else {
            subLinkClass += `text-gray-400 hover:text-[#5d58f0] hover:translate-x-1`;
          }
          
          subLink.className = subLinkClass;
          subLink.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-current mr-2.5 flex-shrink-0 opacity-60 transition-all duration-200"></span>
            <span class="truncate pr-1">${child.label}</span>
            ${isDisabledChild ? '<span class="ml-auto bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">ĐÃ TẮT</span>' : ''}
            ${child.badge === 'lowstock' && !isDisabledChild ? '<span id="badge-lowstock" class="ml-auto w-2 h-2 rounded-full bg-red-500 hidden"></span>' : ''}
            ${child.badge === 'pending' && !isDisabledChild ? '<span id="badge-pending" class="ml-auto bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden"></span>' : ''}
          `;
          subList.appendChild(subLink);
        });

        parentBtn.addEventListener('click', () => {
          const isCollapsed = subList.classList.contains('max-h-0');
          if (isCollapsed) {
            subList.classList.remove('max-h-0', 'opacity-0');
            subList.classList.add('max-h-40', 'opacity-100', 'mb-2');
            parentBtn.querySelector('.chevron-icon').classList.add('rotate-90');
          } else {
            subList.classList.add('max-h-0', 'opacity-0');
            subList.classList.remove('max-h-40', 'opacity-100', 'mb-2');
            parentBtn.querySelector('.chevron-icon').classList.remove('rotate-90');
          }
        });

        nav.appendChild(parentBtn);
        nav.appendChild(subList);
      } else {
        const isActive = activeRoute === item.id;
        const isDisabled = window.APP_SETTINGS?.disabled_modules?.includes(item.id);
        const li = document.createElement('a');
        li.href = item.hash;
        
        let liClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ease-in-out transform group relative ';
        if (isActive) {
          liClass += `bg-[#5d58f0] text-white shadow-md pl-[12px]`;
        } else if (isDisabled) {
          liClass += `text-red-500 hover:text-red-405 font-semibold`;
        } else {
          liClass += `text-gray-450 hover:text-[#5d58f0] hover:bg-[#5d58f0]/10 hover:translate-x-1`;
        }
        
        li.className = liClass;
        li.innerHTML = `
          <span class="transition-colors flex-shrink-0 flex items-center justify-center" style="${isActive ? 'color: #ffffff;' : ''}">${item.icon}</span>
          <span class="truncate pr-1">${item.label}</span>
          ${isDisabled ? '<span class="ml-auto bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">ĐÃ TẮT</span>' : ''}
          ${item.badge === 'lowstock' && !isDisabled ? '<span id="badge-lowstock" class="ml-auto w-2 h-2 rounded-full bg-red-500 hidden"></span>' : ''}
          ${item.badge === 'pending' && !isDisabled ? '<span id="badge-pending" class="ml-auto bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full hidden"></span>' : ''}
        `;
        nav.appendChild(li);
      }
    });
  });

  container.querySelector('#sidebar-logout').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('admin:logout'));
  });

  loadBadges(container);
}
