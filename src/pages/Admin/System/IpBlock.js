import { showToast } from '../shared/ui.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';
import { renderSecurityStats } from './SecurityStats.js';


function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN) || localStorage.getItem('sly_admin_auth_token');
}

export function renderIpBlockSettings(container) {
  const token = getAdminToken();
  let currentTab = 'dashboard';
  let stats = {};

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-dashboard' },
    { id: 'geo', label: 'Geo-blocking', icon: 'ti-world' },
    { id: 'ip_rules', label: 'IP Rules', icon: 'ti-shield' },
    { id: 'spam', label: 'Chống Spam', icon: 'ti-ban' },
    { id: '2fa', label: 'Xác Thực 2FA', icon: 'ti-key' },
    { id: 'session', label: 'Quản Lý Phiên', icon: 'ti-device-laptop' },
    { id: 'headers', label: 'Security Headers', icon: 'ti-code' },
    { id: 'audit', label: 'Nhật Ký Bảo Mật', icon: 'ti-history' }
  ];

  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/stats?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) stats = json.data;
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }

  function renderLayout() {
    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Trung Tâm Bảo Mật Hệ Thống</h1>
          <p class="text-sm text-gray-500 mt-1">Cấu hình các lớp bảo mật, theo dõi đăng nhập và ngăn chặn các cuộc tấn công mạng.</p>
        </div>

        <!-- Dashboard Stats Row -->
        <div id="security-stats-wrapper"></div>

        <!-- Tabs Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex flex-wrap -mb-px gap-1" aria-label="Tabs">
            ${tabs.map(tab => `
              <button id="tab-nav-${tab.id}" class="tab-nav-btn py-3 px-4 inline-flex items-center gap-2 border-b-2 font-semibold text-xs transition duration-150">
                <i class="ti ${tab.icon} text-sm"></i>
                ${tab.label}
              </button>
            `).join('')}
          </nav>
        </div>

        <!-- Tab Content Wrapper -->
        <div id="security-tab-content" class="transition-opacity duration-150"></div>
      </div>
    `;

    // Bind tab events
    tabs.forEach(tab => {
      container.querySelector(`#tab-nav-${tab.id}`).addEventListener('click', () => {
        switchTab(tab.id);
      });
    });

    switchTab('dashboard');
  }

  async function switchTab(tabId) {
    currentTab = tabId;

    // Update active tab nav styles
    tabs.forEach(t => {
      const btn = container.querySelector(`#tab-nav-${t.id}`);
      if (t.id === tabId) {
        btn.className = "tab-nav-btn py-3 px-4 inline-flex items-center gap-2 border-b-2 border-[#C9A84C] text-[#C9A84C] font-semibold text-xs transition duration-150";
      } else {
        btn.className = "tab-nav-btn py-3 px-4 inline-flex items-center gap-2 border-b-2 border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-semibold text-xs transition duration-150";
      }
    });

    const contentWrapper = container.querySelector('#security-tab-content');
    contentWrapper.style.opacity = '0';

    // Wait for transition
    setTimeout(async () => {
      try {
        if (tabId === 'dashboard') {
          await loadStats();
          const statsWrapper = container.querySelector('#security-stats-wrapper');
          if (statsWrapper) statsWrapper.innerHTML = renderSecurityStats(stats);
          
          contentWrapper.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center py-12">
              <i class="ti ti-shield-check text-5xl text-green-500 mb-3 block"></i>
              <h3 class="text-base font-bold text-gray-900">Hệ thống đang hoạt động an toàn</h3>
              <p class="text-xs text-gray-500 mt-1 max-w-md mx-auto">Tất cả các lớp bảo mật đang chạy ngầm để giám sát và bảo vệ website của bạn 24/7.</p>
            </div>
          `;
        } else if (tabId === 'geo') {
          const mod = await import(`./GeoBlockingTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderGeoBlockingTab();
          mod.bindGeoBlockingTab(contentWrapper, token);
        } else if (tabId === 'ip_rules') {
          const mod = await import(`./IpRulesTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderIpRulesTab();
          mod.bindIpRulesTab(contentWrapper, token);
        } else if (tabId === 'spam') {
          const mod = await import(`./SpamPreventionTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderSpamPreventionTab();
          mod.bindSpamPreventionTab(contentWrapper, token);
        } else if (tabId === '2fa') {
          const mod = await import(`./TwoFactorTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderTwoFactorTab();
          mod.bindTwoFactorTab(contentWrapper, token);
        } else if (tabId === 'session') {
          const mod = await import(`./SessionTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderSessionTab();
          mod.bindSessionTab(contentWrapper, token);
        } else if (tabId === 'headers') {
          const mod = await import(`./HeadersTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderHeadersTab();
          mod.bindHeadersTab(contentWrapper, token);
        } else if (tabId === 'audit') {
          const mod = await import(`./AuditLogTab.js?v=${Date.now()}`);
          contentWrapper.innerHTML = mod.renderAuditLogTab();
          mod.bindAuditLogTab(contentWrapper, token);
        }
      } catch (err) {
        console.error(`Error loading/rendering tab ${tabId}:`, err);
        contentWrapper.innerHTML = `
          <div class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm text-center">
            <i class="ti ti-alert-triangle text-3xl text-red-500 mb-2 block"></i>
            <h3 class="text-sm font-bold">Lỗi hiển thị phân hệ</h3>
            <p class="text-xs text-gray-500 mt-1">${err.message || err}</p>
          </div>
        `;
      } finally {
        contentWrapper.style.opacity = '1';
      }
    }, 150);
  }

  // Initial load
  loadStats().then(() => {
    renderLayout();
  });
}
