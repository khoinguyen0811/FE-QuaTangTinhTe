import { showToast } from '../shared/ui.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';
import { renderIntegrationsTab, bindIntegrationsTab } from '../Settings/IntegrationsTab.js?v=1.0.81';
import { renderPaymentTab, bindPaymentTab } from '../Settings/PaymentTab.js?v=1.0.81';
import { renderShippingTab, bindShippingTab } from '../Settings/ShippingTab.js?v=1.0.81';

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN) || localStorage.getItem('sly_admin_auth_token');
}

export function renderAPISettings(container) {
  let activeTab = 'integrations'; // 'integrations' | 'payment' | 'shipping'
  let integrations = {
    zalo: { oa_id: '', access_token: '', secret_key: '' },
    sms: { api_key: '', sender_name: '' },
    gmail: { smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_user: '', smtp_pass: '' },
    google_login: { client_id: '', client_secret: '' },
    facebook_login: { app_id: '', app_secret: '' },
    momo: { partner_code: '', access_key: '', secret_key: '', phone_number: '' },
    bank_transfer: { bank_name: '', account_number: '', account_holder: '' },
    cloudinary: { cloud_name: '', api_key: '', api_secret: '', upload_preset: '' }
  };

  const token = getAdminToken();

  async function loadData() {
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-500 text-sm font-medium">Đang tải cấu hình bảo mật...</span>
      </div>
    `;

    try {
      // 1. Fetch current sensitive integrations
      const res = await fetch(`${API_BASE}/api/admin/integrations?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          integrations = json.data;
        }
      } else {
        throw new Error('Unauthorized or server error');
      }

      renderUI();
    } catch (err) {
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm max-w-lg mx-auto mt-8">
          <h4 class="font-bold mb-1">Lỗi truy cập cấu hình</h4>
          <p class="mb-4">Bạn không có quyền xem cấu hình này hoặc đã có lỗi xảy ra.</p>
          <button id="retry-load-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors">THỬ LẠI</button>
        </div>
      `;
      container.querySelector('#retry-load-btn')?.addEventListener('click', loadData);
    }
  }

  function renderUI() {
    const isSaveable = activeTab === 'integrations' || activeTab === 'payment';

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Cấu Hình Kết Nối & API</h1>
            <p class="text-sm text-gray-500 mt-1">Quản lý kết nối bên thứ ba, tích hợp thanh toán tự động và hãng vận chuyển (Chỉ Superadmin).</p>
          </div>
          ${isSaveable ? `
            <button id="save-integrations-settings" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Lưu Cấu Hình
            </button>
          ` : ''}
        </div>

        <!-- Navigation Tabs -->
        <div class="bg-white border border-gray-200 p-1.5 rounded-xl flex gap-1 shadow-sm flex-wrap max-w-lg">
          <button data-tab="integrations" class="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'integrations' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Tích Hợp API
          </button>
          <button data-tab="payment" class="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'payment' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Thanh Toán Online
          </button>
          <button data-tab="shipping" class="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-lg transition-all ${activeTab === 'shipping' ? 'bg-[#3b92ab]/10 text-[#245f70] font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}">
            Đơn Vị Vận Chuyển
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
  }

  function renderTabContent() {
    if (activeTab === 'integrations') {
      return renderIntegrationsTab({ third_party_integrations: integrations });
    } else if (activeTab === 'payment') {
      return renderPaymentTab({ third_party_integrations: integrations });
    } else {
      return renderShippingTab();
    }
  }

  function bindTabEvents() {
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        renderUI();
      });
    });
  }

  function bindActionEvents() {
    if (activeTab === 'integrations' || activeTab === 'payment') {
      // Pass a fake settings object containing integrations to bind functions
      const fakeSettings = { third_party_integrations: integrations };
      if (activeTab === 'integrations') {
        bindIntegrationsTab(container, fakeSettings);
      } else {
        bindPaymentTab(container, fakeSettings);
      }

      // Save integrations button handler
      container.querySelector('#save-integrations-settings')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...`;

        try {
          const res = await fetch(`${API_BASE}/api/admin/integrations`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(fakeSettings.third_party_integrations)
          });
          const json = await res.json();
          if (res.ok && json.success) {
            showToast('Cập nhật cấu hình bảo mật thành công!', 'success');
            loadData();
          } else {
            showToast(json.error || 'Có lỗi xảy ra khi lưu cấu hình.', 'error');
            btn.disabled = false;
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu Cấu Hình`;
          }
        } catch {
          showToast('Lỗi kết nối máy chủ API.', 'error');
          btn.disabled = false;
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu Cấu Hình`;
        }
      });
    } else {
      bindShippingTab(container, token, API_BASE);
    }
  }

  // Initial load
  loadData();
}
