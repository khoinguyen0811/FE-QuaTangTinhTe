import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderAuditLogTab() {
  return `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div class="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 class="text-base font-bold text-gray-900">Nhật Ký Bảo Mật (Audit Logs)</h3>
          <p class="text-xs text-gray-500 mt-1">Lưu trữ toàn bộ các hoạt động bảo mật, đăng nhập thất bại và thiết lập hệ thống.</p>
        </div>
        <button id="export-audit-btn" class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition flex items-center gap-1.5">
          <i class="ti ti-download"></i> Xuất CSV
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loại sự kiện</label>
          <select id="fl-type" class="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:border-[#C9A84C]">
            <option value="">Tất cả</option>
            <option value="block">Chặn IP / Quốc Gia</option>
            <option value="login">Đăng Nhập</option>
            <option value="setting">Thay Đổi Cấu Hình</option>
            <option value="api">API Security</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Từ ngày</label>
          <input type="date" id="fl-from" class="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-[#C9A84C]">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Đến ngày</label>
          <input type="date" id="fl-to" class="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-[#C9A84C]">
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <th class="p-3">Thời gian</th>
              <th class="p-3">Loại</th>
              <th class="p-3">Chi tiết sự kiện</th>
              <th class="p-3">Địa chỉ IP</th>
              <th class="p-3">Người thực hiện</th>
            </tr>
          </thead>
          <tbody id="audit-logs-tbody" class="divide-y divide-gray-100">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between pt-4 border-t text-xs">
        <span class="text-gray-500" id="pagination-info">Hiển thị 0 dòng</span>
        <div class="flex gap-2">
          <button id="prev-page-btn" class="px-3 py-1.5 border rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:pointer-events-none">Trước</button>
          <button id="next-page-btn" class="px-3 py-1.5 border rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:pointer-events-none">Sau</button>
        </div>
      </div>
    </div>
  `;
}

export function bindAuditLogTab(container, token) {
  let logs = [];
  let page = 1;
  let totalPages = 1;
  let totalLogs = 0;

  const tbody = container.querySelector('#audit-logs-tbody');
  const flType = container.querySelector('#fl-type');
  const flFrom = container.querySelector('#fl-from');
  const flTo = container.querySelector('#fl-to');
  
  const prevBtn = container.querySelector('#prev-page-btn');
  const nextBtn = container.querySelector('#next-page-btn');
  const pagInfo = container.querySelector('#pagination-info');
  const exportBtn = container.querySelector('#export-audit-btn');

  async function loadLogs() {
    tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">Đang tải lịch sử...</td></tr>`;
    
    const type = flType.value;
    const from = flFrom.value;
    const to = flTo.value;
    
    try {
      const url = `${API_BASE}/api/admin/security/audit-logs?page=${page}&limit=20&type=${type}&from=${from}&to=${to}&t=${Date.now()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          logs = json.data.logs || [];
          totalPages = json.data.pages || 1;
          totalLogs = json.data.total || 0;
          renderList();
        }
      }
    } catch {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">Lỗi kết nối máy chủ.</td></tr>`;
    }
  }

  function renderList() {
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">Không tìm thấy bản ghi nhật ký.</td></tr>`;
      pagInfo.innerText = 'Hiển thị 0 dòng';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    tbody.innerHTML = logs.map(log => {
      let typeBadge = '';
      if (log.event_type === 'block') {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-semibold border border-red-100">BLOCK</span>`;
      } else if (log.event_type === 'login') {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 font-semibold border border-blue-100">LOGIN</span>`;
      } else if (log.event_type === 'setting') {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-yellow-50 text-yellow-600 font-semibold border border-yellow-100">SETTING</span>`;
      } else {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-purple-600 font-semibold border border-purple-100">API</span>`;
      }

      return `
        <tr class="hover:bg-gray-50/50">
          <td class="p-3 text-gray-500 font-mono">${log.created_at}</td>
          <td class="p-3">${typeBadge}</td>
          <td class="p-3 text-gray-700 font-medium max-w-sm break-words">${log.event_detail || ''}</td>
          <td class="p-3 font-mono text-gray-600">${log.ip_address || '127.0.0.1'}</td>
          <td class="p-3 text-gray-800 font-semibold">${log.user_name || 'Hệ thống'}</td>
        </tr>
      `;
    }).join('');

    pagInfo.innerText = `Trang ${page} / ${totalPages} (Tổng cộng ${totalLogs} sự kiện)`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  }

  flType.addEventListener('change', () => { page = 1; loadLogs(); });
  flFrom.addEventListener('change', () => { page = 1; loadLogs(); });
  flTo.addEventListener('change', () => { page = 1; loadLogs(); });

  prevBtn.addEventListener('click', () => {
    if (page > 1) {
      page--;
      loadLogs();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (page < totalPages) {
      page++;
      loadLogs();
    }
  });

  exportBtn.addEventListener('click', () => {
    const type = flType.value;
    const from = flFrom.value;
    const to = flTo.value;
    const url = `${API_BASE}/api/admin/security/audit-logs/export?type=${type}&from=${from}&to=${to}&token=${token}`;
    
    // Download via window.open or iframe since it has auth token query param for convenience
    window.open(url, '_blank');
  });

  loadLogs();
}
