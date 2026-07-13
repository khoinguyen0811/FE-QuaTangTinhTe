import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderHeadersTab() {
  return `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div class="border-b pb-4 flex justify-between items-center">
        <div>
          <h3 class="text-base font-bold text-gray-900">Thiết Lập HTTP Security Headers</h3>
          <p class="text-xs text-gray-500 mt-1">Bảo vệ website chống lại Clickjacking, XSS, MIME Sniffing bằng cấu hình HTTP response headers.</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer select-none">
          <input type="checkbox" id="headers-enabled" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
        </label>
      </div>

      <div id="headers-form" class="space-y-4 transition-all duration-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">X-Frame-Options (Clickjacking)</label>
            <select id="hd-xframe" class="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
              <option value="DENY">DENY (Không cho phép iframe ở bất kỳ đâu)</option>
              <option value="SAMEORIGIN">SAMEORIGIN (Chỉ cho phép cùng domain)</option>
              <option value="">Tắt Header</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">X-Content-Type-Options (MIME Sniffing)</label>
            <select id="hd-xcontent" class="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
              <option value="nosniff">nosniff (Chặn tải script/style không đúng MIME)</option>
              <option value="">Tắt Header</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Strict-Transport-Security (HSTS - Ép buộc HTTPS)</label>
          <input type="text" id="hd-hsts" placeholder="Ví dụ: max-age=31536000; includeSubDomains" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Content-Security-Policy (CSP - Ngăn chặn XSS)</label>
          <textarea id="hd-csp" rows="2" placeholder="Ví dụ: default-src 'self' 'unsafe-inline'..." class="w-full px-4 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:border-[#C9A84C]"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Referrer-Policy</label>
            <select id="hd-referrer" class="w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
              <option value="strict-origin-when-cross-origin">strict-origin-when-cross-origin</option>
              <option value="no-referrer">no-referrer</option>
              <option value="same-origin">same-origin</option>
              <option value="">Tắt Header</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Permissions-Policy</label>
            <input type="text" id="hd-permissions" placeholder="Ví dụ: camera=(), microphone=()" class="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t">
        <button id="save-headers-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow transition duration-200">
          Lưu Cấu Hình
        </button>
      </div>
    </div>
  `;
}

export function bindHeadersTab(container, token) {
  let settings = {};

  const enabled = container.querySelector('#headers-enabled');
  const xframe = container.querySelector('#hd-xframe');
  const xcontent = container.querySelector('#hd-xcontent');
  const hsts = container.querySelector('#hd-hsts');
  const csp = container.querySelector('#hd-csp');
  const referrer = container.querySelector('#hd-referrer');
  const permissions = container.querySelector('#hd-permissions');
  const form = container.querySelector('#headers-form');
  const saveBtn = container.querySelector('#save-headers-btn');

  async function loadData() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/settings?key=security_headers&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) settings = json.data;
      }
    } catch {
      showToast('Lỗi khi tải cấu hình security headers.', 'error');
    }
    updateUI();
  }

  function updateUI() {
    enabled.checked = !!settings.enabled;
    xframe.value = settings.x_frame ?? 'DENY';
    xcontent.value = settings.x_content ?? 'nosniff';
    hsts.value = settings.hsts ?? 'max-age=31536000; includeSubDomains';
    csp.value = settings.csp ?? "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; img-src 'self' data: https:;";
    referrer.value = settings.referrer ?? 'strict-origin-when-cross-origin';
    permissions.value = settings.permissions ?? 'camera=(), microphone=(), geolocation=()';

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
    settings.x_frame = xframe.value;
    settings.x_content = xcontent.value;
    settings.hsts = hsts.value.trim();
    settings.csp = csp.value.trim();
    settings.referrer = referrer.value;
    settings.permissions = permissions.value.trim();

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
          key: 'security_headers',
          value: settings
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Lưu cấu hình Security Headers thành công!', 'success');
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
