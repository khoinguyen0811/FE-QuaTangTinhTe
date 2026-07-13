import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderTwoFactorTab() {
  return `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div class="border-b pb-4 flex justify-between items-center">
        <div>
          <h3 class="text-base font-bold text-gray-900">Xác Thực 2 Lớp (2FA)</h3>
          <p class="text-xs text-gray-500 mt-1">Yêu cầu lớp xác thực bổ sung để bảo vệ tài khoản admin đăng nhập.</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer select-none">
          <input type="checkbox" id="twofa-enabled" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
        </label>
      </div>

      <div id="twofa-form" class="space-y-4 transition-all duration-200">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Phương thức xác thực</label>
          <select id="twofa-method" class="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
            <option value="totp">Ứng dụng xác thực (Google Authenticator, Authy)</option>
            <option value="sms" disabled>Gửi OTP qua SMS (Chưa liên kết Gateway)</option>
            <option value="zalo_zns" disabled>Gửi OTP qua Zalo ZNS (Chưa liên kết Gateway)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Đối tượng bắt buộc áp dụng</label>
          <select id="twofa-required" class="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
            <option value="all">Tất cả tài khoản quản trị (Admins)</option>
            <option value="system_admin">Chỉ System Admin (Tài khoản System)</option>
            <option value="per_account">Không bắt buộc (Thiết lập tùy chọn theo tài khoản)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Tin cậy thiết bị (Remember Device)</label>
          <select id="twofa-trust" class="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
            <option value="30">30 Ngày tin cậy thiết bị</option>
            <option value="7">7 Ngày tin cậy thiết bị</option>
            <option value="0">Không lưu tin cậy (Yêu cầu 2FA mỗi lần login)</option>
          </select>
          <p class="text-[10px] text-gray-400 mt-1">Trình duyệt/thiết bị sau khi xác thực thành công sẽ không cần hỏi lại 2FA trong số ngày đã đặt.</p>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t">
        <button id="save-2fa-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow transition duration-200">
          Lưu Cấu Hình
        </button>
      </div>
    </div>
  `;
}

export function bindTwoFactorTab(container, token) {
  let settings = {};

  const enabled = container.querySelector('#twofa-enabled');
  const method = container.querySelector('#twofa-method');
  const required = container.querySelector('#twofa-required');
  const trust = container.querySelector('#twofa-trust');
  const form = container.querySelector('#twofa-form');
  const saveBtn = container.querySelector('#save-2fa-btn');

  async function loadData() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/settings?key=two_factor&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) settings = json.data;
      }
    } catch {
      showToast('Lỗi khi tải cấu hình 2FA.', 'error');
    }
    updateUI();
  }

  function updateUI() {
    enabled.checked = !!settings.enabled;
    method.value = settings.method || 'totp';
    required.value = settings.required_for || 'system_admin';
    trust.value = settings.trust_device_days ?? 30;

    if (enabled.checked) {
      form.classList.remove('opacity-50', 'pointer-events-none');
    } else {
      form.classList.add('opacity-50', 'pointer-events-none');
    }
  }

  enabled.addEventListener('change', () => {
    settings.enabled = enabled.checked;
    updateUI();
  });

  saveBtn.addEventListener('click', async () => {
    settings.enabled = enabled.checked;
    settings.method = method.value;
    settings.required_for = required.value;
    settings.trust_device_days = parseInt(trust.value);

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
          key: 'two_factor',
          value: settings
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Lưu cấu hình 2FA thành công!', 'success');
        loadData();
      } else {
        showToast(json.error || 'Lỗi khi lưu.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = 'Lưu Cấu Hình';
    }
  });

  loadData();
}
