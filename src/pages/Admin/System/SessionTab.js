import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderSessionTab() {
  return `
    <div class="space-y-6">
      <!-- Session Settings Card -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div class="border-b pb-4">
          <h3 class="text-base font-bold text-gray-900">Cấu Hình Phiên Đăng Nhập (Session Settings)</h3>
          <p class="text-xs text-gray-500 mt-1">Thiết lập thời gian hết hạn, số thiết bị đăng nhập đồng thời và thời gian tự động logout khi không hoạt động.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Hạn phiên đăng nhập (Giờ)</label>
            <input type="number" id="se-timeout" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 8 giờ</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Số thiết bị đồng thời tối đa</label>
            <input type="number" id="se-max-devices" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 3 thiết bị</p>
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-xs font-bold text-gray-700 uppercase">Tự logout khi treo máy (Phút)</label>
              <label class="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" id="se-idle-enabled" class="sr-only peer">
                <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C]"></div>
              </label>
            </div>
            <input type="number" id="se-idle" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 30 phút. Tắt switch để duy trì lâu dài.</p>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button id="save-session-settings-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-xs px-5 py-2 rounded-lg shadow transition">
            Lưu Cài Đặt Phiên
          </button>
        </div>
      </div>

      <!-- Active Sessions Card -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 class="text-base font-bold text-gray-900">Các Phiên Đăng Nhập Hoạt Động</h3>
            <p class="text-xs text-gray-500 mt-1">Danh sách các thiết bị/trình duyệt đang đăng nhập tài khoản của bạn.</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                <th class="p-3">Thiết bị / Trình duyệt</th>
                <th class="p-3">Địa chỉ IP</th>
                <th class="p-3">Vị trí</th>
                <th class="p-3">Hoạt động cuối</th>
                <th class="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody id="active-sessions-tbody" class="divide-y divide-gray-100">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function bindSessionTab(container, token) {
  let settings = {};
  let sessions = [];

  const timeoutInput = container.querySelector('#se-timeout');
  const maxDevicesInput = container.querySelector('#se-max-devices');
  const idleInput = container.querySelector('#se-idle');
  const idleEnabledToggle = container.querySelector('#se-idle-enabled');
  const saveSettingsBtn = container.querySelector('#save-session-settings-btn');
  const tbody = container.querySelector('#active-sessions-tbody');

  async function loadData() {
    tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">Đang tải dữ liệu...</td></tr>`;
    try {
      const [setRes, sesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/security/settings?key=session&t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/security/sessions?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (setRes.ok) {
        const json = await setRes.json();
        if (json.success && json.data) settings = json.data;
      }
      if (sesRes.ok) {
        const json = await sesRes.json();
        if (json.success) sessions = json.data || [];
      }

      updateUI();
    } catch {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">Lỗi kết nối máy chủ.</td></tr>`;
    }
  }

  function updateUI() {
    idleEnabledToggle.checked = settings.idle_enabled ?? true;
    timeoutInput.value = settings.timeout_hours ?? 8;
    maxDevicesInput.value = settings.max_devices ?? 3;
    idleInput.value = settings.idle_timeout_minutes ?? 30;

    if (idleEnabledToggle.checked) {
      idleInput.disabled = false;
      idleInput.classList.remove('opacity-50', 'bg-gray-50');
    } else {
      idleInput.disabled = true;
      idleInput.classList.add('opacity-50', 'bg-gray-50');
    }

    if (sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">Không tìm thấy phiên đăng nhập hoạt động.</td></tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(ses => {
      const deviceDisp = `${ses.os || 'Unknown OS'} • ${ses.browser || 'Unknown Browser'}`;
      const lastActiveDisp = ses.last_active_at || 'Mới hoạt động';
      
      return `
        <tr class="hover:bg-gray-50/50">
          <td class="p-3 font-semibold text-gray-900 flex items-center gap-2">
            <i class="ti ti-device-laptop text-base text-gray-400"></i>
            ${deviceDisp}
          </td>
          <td class="p-3 font-mono">${ses.ip_address || '127.0.0.1'}</td>
          <td class="p-3 text-gray-600">${ses.city || 'Việt Nam'}</td>
          <td class="p-3 text-gray-500 font-mono">${lastActiveDisp}</td>
          <td class="p-3 text-right">
            <button class="revoke-session-btn text-red-600 hover:text-red-700 font-semibold transition" data-id="${ses.id}">Thu Hồi</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.revoke-session-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (!confirm('Bạn có chắc chắn muốn thu hồi phiên đăng nhập này (Thiết bị này sẽ bị đăng xuất)?')) return;
        try {
          const res = await fetch(`${API_BASE}/api/admin/security/sessions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (res.ok && json.success) {
            showToast('Đã thu hồi phiên đăng nhập thành công!', 'success');
            loadData();
          } else {
            showToast(json.error || 'Lỗi khi thu hồi phiên.', 'error');
          }
        } catch {
          showToast('Lỗi kết nối máy chủ.', 'error');
        }
      });
    });
  }

  idleEnabledToggle.addEventListener('change', () => {
    if (idleEnabledToggle.checked) {
      idleInput.disabled = false;
      idleInput.classList.remove('opacity-50', 'bg-gray-50');
    } else {
      idleInput.disabled = true;
      idleInput.classList.add('opacity-50', 'bg-gray-50');
    }
  });

  saveSettingsBtn.addEventListener('click', async () => {
    settings.timeout_hours = parseInt(timeoutInput.value) || 8;
    settings.max_devices = parseInt(maxDevicesInput.value) || 3;
    settings.idle_timeout_minutes = parseInt(idleInput.value) >= 0 ? parseInt(idleInput.value) : 30;
    settings.idle_enabled = idleEnabledToggle.checked;

    saveSettingsBtn.disabled = true;
    saveSettingsBtn.innerText = 'Đang lưu...';

    try {
      const res = await fetch(`${API_BASE}/api/admin/security/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'session', value: settings })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Lưu cấu hình phiên thành công!', 'success');
        loadData();
      } else {
        showToast(json.error || 'Lỗi lưu cấu hình.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.innerText = 'Lưu Cài Đặt Phiên';
    }
  });

  loadData();
}
