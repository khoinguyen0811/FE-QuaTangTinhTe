import { renderBreadcrumb } from './AdminBreadcrumb.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';
import { applyAdminTheme, getCurrentAdminTheme, toggleAdminTheme } from './theme.js?v=1.0.0';

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN);
}

export function renderTopbar(container, title) {
  const token = getAdminToken();
  let userName = 'Admin';
  let userEmail = '';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userName = payload.name || payload.email || 'Admin';
      userEmail = payload.email || '';
    }
  } catch {}

  container.innerHTML = `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-20 sticky top-0">
      <div class="flex items-center gap-1.5">
        <button id="sidebar-toggle-btn" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden" title="Toggle Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div id="topbar-breadcrumb"></div>
      </div>
      <div class="flex items-center gap-4">
        <button id="theme-toggle-btn" class="admin-theme-toggle inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors" title="Switch theme" aria-label="Switch theme">
          <svg id="theme-icon-sun" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg id="theme-icon-moon" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span id="theme-toggle-label" class="hidden sm:inline">Light</span>
        </button>

        <button id="notif-btn" class="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Thông báo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span id="notif-dot" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 hidden"></span>
        </button>
        <div class="relative" id="user-menu-wrap">
          <button id="user-menu-btn" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="w-8 h-8 rounded-full bg-[#5d87ff]/20 flex items-center justify-center text-[#5d87ff] font-bold text-sm">
              ${userName.charAt(0).toUpperCase()}
            </div>
            <div class="text-left hidden sm:block">
              <div class="text-sm font-medium text-gray-800 leading-none">${userName}</div>
              <div class="text-xs text-gray-500 mt-0.5">${userEmail}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div id="user-dropdown" class="hidden absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
            <div class="px-4 py-2 border-b border-gray-100">
              <div class="text-sm font-medium text-gray-800">${userName}</div>
              <div class="text-xs text-gray-500">${userEmail}</div>
            </div>
            <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Hồ sơ
            </a>
            <a href="/" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Xem Trang chủ
            </a>
            <button id="topbar-logout" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  `;

  renderBreadcrumb(container.querySelector('#topbar-breadcrumb'), title);

  const toggleBtn = container.querySelector('#sidebar-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const aside = document.getElementById('admin-sidebar-aside');
      const backdrop = document.getElementById('admin-sidebar-backdrop');
      if (aside && backdrop) {
        const isOpen = aside.classList.contains('translate-x-0');
        if (isOpen) {
          aside.classList.add('-translate-x-full');
          aside.classList.remove('translate-x-0');
          backdrop.classList.remove('opacity-100');
          setTimeout(() => {
            backdrop.classList.add('hidden');
          }, 300);
        } else {
          aside.classList.remove('-translate-x-full');
          aside.classList.add('translate-x-0');
          backdrop.classList.remove('hidden');
          setTimeout(() => {
            backdrop.classList.add('opacity-100');
          }, 50);
        }
      }
    });
  }

  // Theme toggler
  const themeToggle = container.querySelector('#theme-toggle-btn');
  const sunIcon = container.querySelector('#theme-icon-sun');
  const moonIcon = container.querySelector('#theme-icon-moon');
  const themeLabel = container.querySelector('#theme-toggle-label');
  
  function syncThemeToggle(theme) {
    const isDark = theme === 'dark';
    sunIcon?.classList.toggle('hidden', !isDark);
    moonIcon?.classList.toggle('hidden', isDark);
    if (themeLabel) {
      themeLabel.textContent = isDark ? 'Light' : 'Dark';
    }
    if (themeToggle) {
      const nextMode = isDark ? 'Light mode' : 'Dark mode';
      themeToggle.title = `Switch to ${nextMode}`;
      themeToggle.setAttribute('aria-label', `Switch to ${nextMode}`);
    }
  }

  syncThemeToggle(applyAdminTheme(getCurrentAdminTheme()));

  themeToggle?.addEventListener('click', () => {
    syncThemeToggle(toggleAdminTheme());
  });

  const handleThemeChanged = (event) => {
    syncThemeToggle(event.detail?.theme || getCurrentAdminTheme());
  };
  document.addEventListener('admin:theme-changed', handleThemeChanged);

  const menuBtn = container.querySelector('#user-menu-btn');
  const dropdown = container.querySelector('#user-dropdown');
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  const closeDropdown = () => {
    if (dropdown) dropdown.classList.add('hidden');
  };
  document.addEventListener('click', closeDropdown);

  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeDropdown);
    document.removeEventListener('admin:theme-changed', handleThemeChanged);
  });

  container.querySelector('#topbar-logout').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('admin:logout'));
  });

  loadNotifications(container);
}

async function loadNotifications(container) {
  const token = getAdminToken();
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const stats = data.data || data;
    if (stats.pending_orders > 0) {
      const dot = container.querySelector('#notif-dot');
      if (dot) dot.classList.remove('hidden');
    }
  } catch {}
}
