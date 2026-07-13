import { showToast } from '../shared/ui.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';
import { renderGeneralTab, bindGeneralTab } from './GeneralTab.js';

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN) || localStorage.getItem('sly_admin_auth_token');
}

export function renderSystemSettings(container) {
  let settings = {};
  let packageInfo = null;
  const token = getAdminToken();

  async function loadData() {
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-500 text-sm font-medium">Đang tải cấu hình...</span>
      </div>
    `;
    try {
      const [setRes, pkgRes] = await Promise.all([
        fetch(`${API_BASE}/api/settings?t=${Date.now()}`),
        fetch(`${API_BASE}/api/admin/settings/package-info?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
      ]);

      if (setRes && setRes.ok) {
        const json = await setRes.json();
        if (json.success) {
          settings = json.data;
          
          // Restore draft settings if exists
          const draft = localStorage.getItem('sly_draft_settings');
          if (draft) {
            try {
              settings = { ...settings, ...JSON.parse(draft) };
              window.adminFormIsDirty = true;
            } catch (e) {
              console.error('Failed to parse settings draft:', e);
            }
          }
        }
      }
      if (pkgRes && pkgRes.ok) {
        const json = await pkgRes.json();
        if (json.success) packageInfo = json.data;
      }
      renderUI();
    } catch (err) {
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm max-w-lg mx-auto mt-8 text-center">
          <h4 class="font-bold mb-1">Lỗi tải dữ liệu</h4>
          <p class="mb-4">Không thể kết nối đến máy chủ API.</p>
          <button id="retry-sys-load" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors">THỬ LẠI</button>
        </div>
      `;
      container.querySelector('#retry-sys-load')?.addEventListener('click', loadData);
    }
  }

  function renderUI() {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Cấu HÌnh Hệ Thống</h1>
            <p class="text-sm text-gray-500 mt-1">Cấu hình thông tin cơ bản, múi giờ, định dạng và giới hạn hệ thống.</p>
          </div>
          <button id="save-sys-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Lưu Cấu Hình
          </button>
        </div>

        <!-- Content -->
        <div id="tab-content" class="space-y-6">
          ${renderGeneralTab(settings, packageInfo)}
        </div>
      </div>
    `;
    bindEvents();
  }

  function bindEvents() {
    const saveSettingsDraft = () => {
      window.adminFormIsDirty = true;
      localStorage.setItem('sly_draft_settings', JSON.stringify(settings));
    };

    const ctx = {
      saveSettingsDraft
    };

    bindGeneralTab(container, settings, ctx);
    
    container.querySelector('#copy-pkg-api-btn')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const input = container.querySelector('#sys-package-api-url');
      const val = input ? input.value : '';
      navigator.clipboard.writeText(val).then(() => {
        const oldText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = oldText, 2000);
      });
    });

    container.querySelector('#save-sys-btn')?.addEventListener('click', async (e) => {
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
          showToast('Cập nhật cấu hình hệ thống thành công!', 'success');
          window.APP_SETTINGS = settings;
          loadData();
        } else {
          showToast(json.error || 'Có lỗi xảy ra khi lưu cấu hình.', 'error');
        }
      } catch {
        showToast('Lỗi kết nối máy chủ API.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu Cấu Hình`;
      }
    });
  }

  loadData();
}
