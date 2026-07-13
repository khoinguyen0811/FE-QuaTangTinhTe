import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderGeoBlockingTab() {
  return `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div class="border-b pb-4 flex justify-between items-center">
        <div>
          <h3 class="text-base font-bold text-gray-900">Quản Lý Quốc Gia (Geo-blocking)</h3>
          <p class="text-xs text-gray-500 mt-1">Chặn hoặc chỉ cho phép các quốc gia cụ thể truy cập trang web dựa trên vị trí địa lý của IP.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-gray-500">Trạng thái:</span>
          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" id="geo-enabled-toggle" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
          </label>
        </div>
      </div>
      
      <div id="geo-config-form" class="space-y-4 opacity-50 pointer-events-none transition-all duration-200">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Chế độ giới hạn Quốc gia</label>
          <select id="geo-mode-select" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C] bg-white">
            <option value="blacklist">Chế độ Blacklist (Chặn các quốc gia được chọn)</option>
            <option value="whitelist">Chế độ Whitelist (Chỉ cho phép các quốc gia được chọn)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" id="geo-list-label">Danh sách quốc gia bị chặn</label>
          <textarea id="geo-countries-list" rows="4" placeholder="Ví dụ: US, CN, RU (mỗi quốc gia phân cách bằng dấu phẩy hoặc xuống dòng)" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C]"></textarea>
          <p class="text-[11px] text-gray-400 mt-1">Nhập danh sách mã quốc gia ISO 2 ký tự (Alpha-2). Ví dụ: VN (Việt Nam), US (Mỹ), CN (Trung Quốc).</p>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t">
        <button id="save-geo-tab-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow transition duration-200 flex items-center gap-2">
          Lưu Cấu Hình
        </button>
      </div>
    </div>
  `;
}

export function bindGeoBlockingTab(container, token) {
  let geoSettings = { enabled: false, mode: 'blacklist', countries: [] };

  const enabledToggle = container.querySelector('#geo-enabled-toggle');
  const modeSelect = container.querySelector('#geo-mode-select');
  const countriesTextarea = container.querySelector('#geo-countries-list');
  const formWrapper = container.querySelector('#geo-config-form');
  const label = container.querySelector('#geo-list-label');
  const saveBtn = container.querySelector('#save-geo-tab-btn');

  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/settings?key=geo_blocking&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          geoSettings = { ...geoSettings, ...json.data };
        }
      }
    } catch (err) {
      showToast('Lỗi khi tải cấu hình Geo-blocking.', 'error');
    }
    updateUI();
  }

  function updateUI() {
    enabledToggle.checked = !!geoSettings.enabled;
    modeSelect.value = geoSettings.mode || 'blacklist';
    countriesTextarea.value = (geoSettings.countries || []).join(', ');

    if (geoSettings.enabled) {
      formWrapper.classList.remove('opacity-50', 'pointer-events-none');
    } else {
      formWrapper.classList.add('opacity-50', 'pointer-events-none');
    }

    if (modeSelect.value === 'whitelist') {
      label.innerText = 'Danh sách quốc gia được phép (Whitelist)';
    } else {
      label.innerText = 'Danh sách quốc gia bị chặn (Blacklist)';
    }
  }

  enabledToggle.addEventListener('change', () => {
    geoSettings.enabled = enabledToggle.checked;
    updateUI();
  });

  modeSelect.addEventListener('change', () => {
    geoSettings.mode = modeSelect.value;
    updateUI();
  });

  saveBtn.addEventListener('click', async () => {
    // Parse countries
    const countriesStr = countriesTextarea.value || '';
    const countries = countriesStr
      .split(/[\n,;]+/)
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length === 2);

    geoSettings.enabled = enabledToggle.checked;
    geoSettings.mode = modeSelect.value;
    geoSettings.countries = countries;

    saveBtn.disabled = true;
    saveBtn.innerText = 'Đang lưu...';

    try {
      const res = await fetch(`${API_BASE}/api/admin/security/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          key: 'geo_blocking',
          value: geoSettings
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Lưu cấu hình Geo-blocking thành công!', 'success');
        loadSettings();
      } else {
        showToast(json.error || 'Lỗi lưu cấu hình.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ API.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = 'Lưu Cấu Hình';
    }
  });

  loadSettings();
}
