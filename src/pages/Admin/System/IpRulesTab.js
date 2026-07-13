import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

export function renderIpRulesTab() {
  return `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div class="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 class="text-base font-bold text-gray-900">Danh Sách Địa Chỉ IP (Whitelist / Blacklist)</h3>
          <p class="text-xs text-gray-500 mt-1">Thiết lập danh sách IP tin cậy (để bypass bảo mật) hoặc danh sách đen bị chặn.</p>
        </div>
        <button id="add-ip-rule-btn" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition duration-200 flex items-center gap-1.5">
          <i class="ti ti-plus"></i> Thêm Địa Chỉ IP / CIDR
        </button>
      </div>

      <div class="flex gap-2 border-b pb-px">
        <button id="tab-sub-blacklist" class="px-4 py-2 text-xs font-bold border-b-2 border-[#C9A84C] text-[#C9A84C]">BLACKLIST (CHẶN)</button>
        <button id="tab-sub-whitelist" class="px-4 py-2 text-xs font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-900">WHITELIST (TIN CẬY)</button>
      </div>

      <!-- Add Form Modal (hidden by default) -->
      <div id="add-ip-rule-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl mx-4">
          <h4 class="text-sm font-bold text-gray-900" id="modal-title">Thêm Quy Tắc IP</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Địa chỉ IP hoặc CIDR</label>
              <input type="text" id="new-ip-address" placeholder="Ví dụ: 1.2.3.4 hoặc 1.2.3.0/24" class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]">
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Thời gian hết hạn (Giờ)</label>
              <select id="new-ip-expiry" class="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C]">
                <option value="0">Vĩnh viễn</option>
                <option value="1">1 Giờ</option>
                <option value="24">24 Giờ</option>
                <option value="72">3 Ngày</option>
                <option value="168">7 Ngày</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Ghi chú / Lý do</label>
              <textarea id="new-ip-reason" rows="2" placeholder="Nhập lý do..." class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button id="cancel-ip-rule-btn" class="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
            <button id="save-ip-rule-btn" class="px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg text-xs font-semibold shadow">Thêm Quy Tắc</button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <th class="p-3">Địa chỉ IP / CIDR</th>
              <th class="p-3">Nguồn</th>
              <th class="p-3">Lý do / Ghi chú</th>
              <th class="p-3">Thời hạn</th>
              <th class="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody id="ip-rules-tbody" class="divide-y divide-gray-100">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function bindIpRulesTab(container, token) {
  let activeTab = 'blacklist'; // 'blacklist' or 'whitelist'
  let rules = [];

  const tbody = container.querySelector('#ip-rules-tbody');
  const btnBlacklist = container.querySelector('#tab-sub-blacklist');
  const btnWhitelist = container.querySelector('#tab-sub-whitelist');
  const addBtn = container.querySelector('#add-ip-rule-btn');
  const modal = container.querySelector('#add-ip-rule-modal');
  const cancelModalBtn = container.querySelector('#cancel-ip-rule-btn');
  const saveModalBtn = container.querySelector('#save-ip-rule-btn');

  async function loadRules() {
    tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">Đang tải danh sách...</td></tr>`;
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/ip-rules?type=${activeTab}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          rules = json.data || [];
          renderList();
        }
      }
    } catch {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">Lỗi tải dữ liệu.</td></tr>`;
    }
  }

  function renderList() {
    if (rules.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400">Danh sách trống.</td></tr>`;
      return;
    }

    tbody.innerHTML = rules.map(rule => {
      const ipDisp = rule.ip_address + (rule.cidr_prefix ? '/' + rule.cidr_prefix : '');
      const sourceBadge = rule.source === 'auto' 
        ? `<span class="px-2 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-semibold border border-red-100">Tự Động</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] bg-gray-50 text-gray-600 font-semibold border border-gray-100">Thủ Công</span>`;

      const expiryDisp = rule.expires_at 
        ? `<span class="text-gray-500 font-mono">${rule.expires_at}</span>`
        : `<span class="text-green-600 font-bold">Vĩnh Viễn</span>`;

      let unblockRequest = '';
      if (rule.status === 'requested_unblock') {
        unblockRequest = `
          <div class="mt-1 bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded text-[10px] space-y-1">
            <div class="font-bold">Yêu cầu mở khóa từ: ${rule.contact_email || 'Ẩn danh'}</div>
            <div>Lý do: ${rule.unblock_request_reason || 'Không có'}</div>
          </div>
        `;
      }

      return `
        <tr class="hover:bg-gray-50/50">
          <td class="p-3 font-mono font-bold text-gray-900">${ipDisp}</td>
          <td class="p-3">${sourceBadge}</td>
          <td class="p-3 text-gray-600 max-w-xs break-words">
            ${rule.reason || ''}
            ${unblockRequest}
          </td>
          <td class="p-3">${expiryDisp}</td>
          <td class="p-3 text-right">
            <button class="delete-rule-btn text-red-600 hover:text-red-700 font-semibold text-xs transition" data-id="${rule.id}">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind action buttons
    tbody.querySelectorAll('.delete-rule-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (!confirm('Bạn có chắc chắn muốn xóa quy tắc IP này?')) return;
        try {
          const res = await fetch(`${API_BASE}/api/admin/security/ip-rules/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (res.ok && json.success) {
            showToast('Đã xóa quy tắc IP thành công!', 'success');
            loadRules();
          } else {
            showToast(json.error || 'Lỗi khi xóa.', 'error');
          }
        } catch {
          showToast('Lỗi kết nối máy chủ.', 'error');
        }
      });
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'blacklist') {
      btnBlacklist.className = "px-4 py-2 text-xs font-bold border-b-2 border-[#C9A84C] text-[#C9A84C]";
      btnWhitelist.className = "px-4 py-2 text-xs font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-900";
    } else {
      btnWhitelist.className = "px-4 py-2 text-xs font-bold border-b-2 border-[#C9A84C] text-[#C9A84C]";
      btnBlacklist.className = "px-4 py-2 text-xs font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-900";
    }
    loadRules();
  }

  btnBlacklist.addEventListener('click', () => switchTab('blacklist'));
  btnWhitelist.addEventListener('click', () => switchTab('whitelist'));

  addBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    container.querySelector('#new-ip-address').value = '';
    container.querySelector('#new-ip-reason').value = '';
    container.querySelector('#new-ip-expiry').value = '0';
  });

  cancelModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

  saveModalBtn.addEventListener('click', async () => {
    const ip = container.querySelector('#new-ip-address').value.trim();
    const expiry = parseInt(container.querySelector('#new-ip-expiry').value);
    const reason = container.querySelector('#new-ip-reason').value.trim();

    if (!ip) {
      showToast('Vui lòng nhập địa chỉ IP hoặc dải CIDR!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/security/ip-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ip_address: ip,
          rule_type: activeTab,
          expires_in_hours: expiry,
          reason: reason
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(json.message || 'Thêm quy tắc IP thành công!', 'success');
        modal.classList.add('hidden');
        loadRules();
      } else {
        showToast(json.error || 'Lỗi khi thêm quy tắc IP.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  });

  loadRules();
}
