import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderSpamPreventionTab() {
  return `
    <div class="space-y-6">
      <!-- Rate Limiting Card -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div class="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-gray-900">Cấu Hình Giới Hạn Tần Suất (Rate Limiting)</h3>
            <p class="text-xs text-gray-500 mt-1">Giới hạn số lượng request tối đa trong mỗi phút của từng loại API.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" id="rl-enabled" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
          </label>
        </div>

        <div id="rl-form" class="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-200">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Request Web (Trang chính)</label>
            <input type="number" id="rl-web-limit" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 200 req/phút</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Request API (Dữ liệu)</label>
            <input type="number" id="rl-api-limit" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 100 req/phút</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Request Đăng Nhập (Login)</label>
            <input type="number" id="rl-login-limit" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 5 req/phút</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Yêu Cầu Gửi Mã OTP (SMS/Email)</label>
            <input type="number" id="rl-otp-limit" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 3 req/phút</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Hành vi khi vượt giới hạn</label>
            <select id="rl-action" class="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
              <option value="429_block_15m">Trả về lỗi 429 và tạm khóa IP 15 phút</option>
              <option value="auto_block_1h">Tự động chặn IP 1 giờ (đưa vào Blacklist)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Brute Force Protection Card -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div class="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-gray-900">Bảo Vệ Đăng Nhập (Chống Brute Force)</h3>
            <p class="text-xs text-gray-500 mt-1">Tự động ngăn chặn các cuộc dò mật khẩu của quản trị viên.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" id="bf-enabled" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
          </label>
        </div>

        <div id="bf-form" class="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-200">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Số lần thử tối đa</label>
            <input type="number" id="bf-max-attempts" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 5 lần đăng nhập sai</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Thời gian khóa IP (Phút)</label>
            <input type="number" id="bf-lockout-duration" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            <p class="text-[10px] text-gray-400 mt-1">Mặc định: 15 phút</p>
          </div>
          <div class="md:col-span-2 flex items-center justify-between py-2 border-b">
            <div>
              <label class="block text-sm font-bold text-gray-800">Lockout Tăng Dần (Progressive Lockout)</label>
              <p class="text-xs text-gray-400 mt-0.5">X2 thời gian khóa mỗi lần vi phạm liên tiếp (15m -> 30m -> 1h -> 24h).</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" id="bf-progressive" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button id="save-spam-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow transition duration-200">
          Lưu Cấu Hình
        </button>
      </div>
    </div>
  `;
}

export function bindSpamPreventionTab(container, token) {
  let rateSettings = {};
  let bruteSettings = {};

  const rlEnabled = container.querySelector('#rl-enabled');
  const rlWeb = container.querySelector('#rl-web-limit');
  const rlApi = container.querySelector('#rl-api-limit');
  const rlLogin = container.querySelector('#rl-login-limit');
  const rlOtp = container.querySelector('#rl-otp-limit');
  const rlAction = container.querySelector('#rl-action');
  const rlForm = container.querySelector('#rl-form');

  const bfEnabled = container.querySelector('#bf-enabled');
  const bfMax = container.querySelector('#bf-max-attempts');
  const bfLockout = container.querySelector('#bf-lockout-duration');
  const bfProgressive = container.querySelector('#bf-progressive');
  const bfForm = container.querySelector('#bf-form');

  const saveBtn = container.querySelector('#save-spam-btn');

  async function loadData() {
    try {
      const [rlRes, bfRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/security/settings?key=rate_limiting&t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/security/settings?key=brute_force&t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (rlRes.ok) {
        const json = await rlRes.json();
        if (json.success && json.data) rateSettings = json.data;
      }
      if (bfRes.ok) {
        const json = await bfRes.json();
        if (json.success && json.data) bruteSettings = json.data;
      }
    } catch {
      showToast('Lỗi khi tải cấu hình spam.', 'error');
    }
    updateUI();
  }

  function updateUI() {
    rlEnabled.checked = !!rateSettings.enabled;
    rlWeb.value = rateSettings.web_limit ?? 200;
    rlApi.value = rateSettings.api_limit ?? 100;
    rlLogin.value = rateSettings.login_limit ?? 5;
    rlOtp.value = rateSettings.otp_limit ?? 3;
    rlAction.value = rateSettings.action || '429_block_15m';

    if (rlEnabled.checked) rlForm.classList.remove('opacity-50', 'pointer-events-none');
    else rlForm.classList.add('opacity-50', 'pointer-events-none');

    bfEnabled.checked = !!bruteSettings.enabled;
    bfMax.value = bruteSettings.max_attempts ?? 5;
    bfLockout.value = bruteSettings.lockout_duration ?? 15;
    bfProgressive.checked = !!bruteSettings.progressive;

    if (bfEnabled.checked) bfForm.classList.remove('opacity-50', 'pointer-events-none');
    else bfForm.classList.add('opacity-50', 'pointer-events-none');
  }

  rlEnabled.addEventListener('change', () => {
    rateSettings.enabled = rlEnabled.checked;
    updateUI();
  });

  bfEnabled.addEventListener('change', () => {
    bruteSettings.enabled = bfEnabled.checked;
    updateUI();
  });

  saveBtn.addEventListener('click', async () => {
    rateSettings.enabled = rlEnabled.checked;
    rateSettings.web_limit = parseInt(rlWeb.value);
    rateSettings.api_limit = parseInt(rlApi.value);
    rateSettings.login_limit = parseInt(rlLogin.value);
    rateSettings.otp_limit = parseInt(rlOtp.value);
    rateSettings.action = rlAction.value;

    bruteSettings.enabled = bfEnabled.checked;
    bruteSettings.max_attempts = parseInt(bfMax.value);
    bruteSettings.lockout_duration = parseInt(bfLockout.value);
    bruteSettings.progressive = bfProgressive.checked;

    saveBtn.disabled = true;
    saveBtn.innerText = 'Đang lưu...';

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE}/api/admin/security/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'rate_limiting', value: rateSettings })
        }),
        fetch(`${API_BASE}/api/admin/security/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: 'brute_force', value: bruteSettings })
        })
      ]);

      if (res1.ok && res2.ok) {
        showToast('Lưu cấu hình thành công!', 'success');
        loadData();
      } else {
        showToast('Có lỗi xảy ra khi lưu cấu hình.', 'error');
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
