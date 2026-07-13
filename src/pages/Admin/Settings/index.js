import { showToast } from '../shared/ui.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';
import { renderBrandTab, bindBrandTab } from './BrandTab.js';
import { renderMenuTab, bindMenuTab } from './MenuTab.js';
import { renderBannerTab, bindBannerTab } from './BannerTab.js?v=1.0.94';
import { renderSectionsTab, bindSectionsTab } from './SectionsTab.js';
import { renderColorsTab, bindColorsTab } from './ColorsTab.js?v=1.0.84';
import { renderHistoryTab, bindHistoryTab } from './HistoryTab.js';

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN) || localStorage.getItem('sly_admin_auth_token');
}

export function renderSettings(container) {
  let activeTab = 'brand'; // 'brand' | 'menu' | 'banner' | 'sections' | 'colors' | 'security' | 'history'
  let settings = {
    brand_name: 'Thương hiệu',
    logo_url: '',
    hero_banners: [],
    theme_colors: {}
  };
  let historyLogs = [];
  let currentPage = 1;

  // Local copy of color & typography configurations for real-time preview
  let localColors = {};
  let localTypography = {};

  const token = getAdminToken();

  async function loadData() {
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-500 text-sm font-medium">Đang tải cấu hình...</span>
      </div>
    `;

    try {
      // 1. Fetch current settings with cache buster
      const res = await fetch(`${API_BASE}/api/settings?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          settings = json.data;
          
          // Restore draft settings if exists
          const draft = localStorage.getItem('sly_draft_settings');
          if (draft) {
            try {
              const draftData = JSON.parse(draft);
              settings = { ...settings, ...draftData };
              window.adminFormIsDirty = true;
              setTimeout(() => {
                showToast('Đã tự động khôi phục bản nháp cài đặt chưa lưu!', 'success');
              }, 200);
            } catch (e) {
              console.error('Failed to parse settings draft:', e);
            }
          }
          
          localColors = { ...settings.theme_colors };
          localTypography = { ...settings.theme_typography };
        }
      }

      // 2. Fetch audit history logs with cache buster
      const historyRes = await fetch(`${API_BASE}/api/admin/settings/history?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const json = await historyRes.json();
        if (json.success) {
          historyLogs = json.data;
        }
      }

      renderUI();
    } catch (err) {
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm max-w-lg mx-auto mt-8">
          <h4 class="font-bold mb-1">Lỗi tải dữ liệu</h4>
          <p class="mb-4">Không thể kết nối đến máy chủ API.</p>
          <button id="retry-load-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors">THỬ LẠI</button>
        </div>
      `;
      container.querySelector('#retry-load-btn')?.addEventListener('click', loadData);
    }
  }

  function renderUI() {
    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Cài Đặt Hệ Thống</h1>
            <p class="text-sm text-gray-500 mt-1">Cấu hình tên thương hiệu, hình ảnh logo, banners và tông màu của trang web.</p>
          </div>
          <button id="save-all-settings" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Lưu Tất Cả
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="bg-white border border-gray-200 p-1.5 rounded-xl flex gap-1 shadow-sm flex-wrap">
          <button data-tab="brand" class="flex-1 min-w-[120px] py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'brand' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Thương Hiệu & Logo
          </button>
          <button data-tab="menu" class="flex-1 min-w-[120px] py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'menu' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Cấu Hình Menu
          </button>
          <button data-tab="banner" class="flex-1 min-w-[120px] py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'banner' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Quản Lý Hero Section
          </button>
          <button data-tab="sections" class="flex-1 min-w-[120px] py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'sections' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Section Trang Chủ
          </button>
          <button data-tab="colors" class="flex-1 min-w-[120px] py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'colors' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Màu Sắc Giao Diện (Kèm Live Preview)
          </button>
          <button data-tab="history" class="flex-1 min-w-[120px] py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Lịch Sử Thay Đổi
          </button>
        </div>

        <!-- Tab Contents -->
        <div id="tab-content" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 min-h-[400px]">
          ${renderTabContent()}
        </div>
      </div>
    `;

    bindTabEvents();
    bindActionEvents();
    updateMockupColors();

    const tabContent = container.querySelector('#tab-content');
    if (tabContent) {
      const handleInput = () => {
        window.adminFormIsDirty = true;
        localStorage.setItem('sly_draft_settings', JSON.stringify(settings));
        updateMockupColors();
      };
      tabContent.addEventListener('input', handleInput);
      tabContent.addEventListener('change', handleInput);
    }
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'brand':
        return renderBrandTab(settings);
      case 'menu':
        return renderMenuTab(settings);
      case 'banner':
        return renderBannerTab(settings);
      case 'sections':
        return renderSectionsTab(settings);
      case 'colors':
        return renderColorsTab(settings, localColors, localTypography);
      case 'history':
        return renderHistoryTab(historyLogs, currentPage);
    }
  }

  function bindTabEvents() {
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        currentPage = 1;
        renderUI();
      });
    });
  }

  function updateMockupColors() {
    // 1. Pack current settings
    const previewSettings = {
      ...settings,
      theme_colors: { ...localColors },
      theme_typography: { ...localTypography }
    };
    localStorage.setItem('sly_preview_settings', JSON.stringify(previewSettings));

    // 2. Post message to iframe
    const iframe = container.querySelector('#mockup-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'sly_preview_update',
        theme_colors: localColors,
        theme_typography: localTypography,
        home_sections: settings.home_sections,
        hero_banners: settings.hero_banners,
        navigation_menu: settings.navigation_menu
      }, '*');
    }
  }

  function bindActionEvents() {
    const saveSettingsDraft = () => {
      window.adminFormIsDirty = true;
      localStorage.setItem('sly_draft_settings', JSON.stringify(settings));
    };

    const ctx = {
      loadData,
      renderUI,
      updateMockupColors,
      setCurrentPage: (p) => { currentPage = p; },
      saveSettingsDraft,
      saveSettingsToServer: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/admin/settings`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(settings)
          });
          const json = await res.json();
          const ok = res.ok && json.success;
          if (ok) {
            localStorage.removeItem('sly_draft_settings');
            window.adminFormIsDirty = false;
          }
          return ok;
        } catch (err) {
          console.error('[Settings] Failed to save settings to server:', err);
          return false;
        }
      }
    };

    if (activeTab === 'brand') {
      bindBrandTab(container, settings, token, API_BASE, ctx);
    } else if (activeTab === 'menu') {
      bindMenuTab(container, settings, token, API_BASE, ctx);
    } else if (activeTab === 'banner') {
      bindBannerTab(container, settings, token, API_BASE, ctx);
    } else if (activeTab === 'sections') {
      bindSectionsTab(container, settings, token, API_BASE, ctx);
    } else if (activeTab === 'colors') {
      bindColorsTab(container, settings, localColors, localTypography, ctx);
    } else if (activeTab === 'history') {
      bindHistoryTab(container, token, API_BASE, historyLogs, currentPage, ctx);
    }

    // Save All Settings Button
    container.querySelector('#save-all-settings')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...`;

      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(settings)
        });
        const json = await res.json();
        if (res.ok && json.success) {
          localStorage.removeItem('sly_draft_settings');
          window.adminFormIsDirty = false;
          showToast('Lưu toàn bộ thay đổi cấu hình thành công!', 'success');
          // Reload settings into runtime environment
          window.APP_SETTINGS = settings;

          loadData(); // Refresh history table
        } else {
          showToast(json.error || 'Có lỗi xảy ra khi lưu cấu hình.', 'error');
          btn.disabled = false;
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu Tất Cả`;
        }
      } catch {
        showToast('Lỗi kết nối máy chủ API.', 'error');
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu Tất Cả`;
      }
    });
  }

  // Trigger loading
  loadData();
}
