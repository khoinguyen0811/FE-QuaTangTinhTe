import { showToast } from '../shared/ui.js';

export function renderShippingTab() {
  return `
    <div class="space-y-6">
      <div class="border-b pb-3 flex justify-between items-center">
        <div>
          <h3 class="text-base font-bold text-gray-900">Quản Lý Đơn Vị Vận Chuyển</h3>
          <p class="text-xs text-gray-400">Danh sách hãng vận chuyển, cấu hình API và trạng thái hoạt động</p>
        </div>
        <button id="add-shipping-provider-btn" class="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm Đơn Vị Mới
        </button>
      </div>

      <!-- Provider List Container -->
      <div id="shipping-providers-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Will be loaded dynamically -->
        <div class="col-span-full py-12 flex justify-center items-center">
          <div class="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
          <span class="ml-2 text-xs text-gray-500 font-medium">Đang tải danh sách...</span>
        </div>
      </div>

      <!-- Add/Edit Modal (Overlay hidden by default) -->
      <div id="shipping-modal-overlay" class="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center hidden" data-lenis-prevent="true">
        <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
          <div class="flex items-center justify-between border-b pb-2">
            <h4 id="shipping-modal-title" class="text-sm font-black uppercase text-gray-900">Cấu hình đơn vị vận chuyển</h4>
            <button id="close-shipping-modal" class="text-gray-400 hover:text-gray-600 outline-none">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <form id="shipping-provider-form" class="space-y-3">
            <input type="hidden" id="provider-id-field" />
            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Tên đơn vị vận chuyển</label>
              <input type="text" id="provider-name-field" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Ví dụ: Giao Hàng Nhanh (GHN)" />
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Mã đơn vị (Carrier Code)</label>
                <input type="text" id="provider-code-field" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Ví dụ: GHN" />
              </div>
              <div>
                <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Trạng thái hoạt động</label>
                <select id="provider-active-field" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]">
                  <option value="1">Kích hoạt (Hoạt động)</option>
                  <option value="0">Tắt (Ngừng hoạt động)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">API URL (Đường dẫn kết nối)</label>
              <input type="text" id="provider-url-field" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="https://api..." />
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">API Access Token / Key</label>
              <input type="password" id="provider-token-field" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder="Nhập API Token của đơn vị vận chuyển" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500">Cấu hình bổ sung (JSON Config)</label>
                <span class="text-[9px] text-gray-400">Các tham số như shop_id, client_id</span>
              </div>
              <textarea id="provider-config-field" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]" placeholder='{\n  "shop_id": "123456",\n  "client_id": "987654"\n}'></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button type="button" id="cancel-shipping-modal-btn" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">Hủy</button>
              <button type="submit" class="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors">Lưu Lại</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function bindShippingTab(container, token, API_BASE) {
  let providers = [];

  // DOM Elements
  const listContainer = container.querySelector('#shipping-providers-list');
  const modalOverlay = container.querySelector('#shipping-modal-overlay');
  const modalForm = container.querySelector('#shipping-provider-form');
  const modalTitle = container.querySelector('#shipping-modal-title');
  const addBtn = container.querySelector('#add-shipping-provider-btn');
  const closeBtn = container.querySelector('#close-shipping-modal');
  const cancelBtn = container.querySelector('#cancel-shipping-modal-btn');

  // Input Fields
  const fieldId = container.querySelector('#provider-id-field');
  const fieldName = container.querySelector('#provider-name-field');
  const fieldCode = container.querySelector('#provider-code-field');
  const fieldUrl = container.querySelector('#provider-url-field');
  const fieldToken = container.querySelector('#provider-token-field');
  const fieldConfig = container.querySelector('#provider-config-field');
  const fieldActive = container.querySelector('#provider-active-field');

  async function loadProviders() {
    listContainer.innerHTML = `
      <div class="col-span-full py-12 flex justify-center items-center">
        <div class="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-2 text-xs text-gray-500 font-medium">Đang tải danh sách...</span>
      </div>
    `;

    try {
      const res = await fetch(`${API_BASE}/api/admin/shipping-providers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        providers = json.data || [];
        renderList();
      } else {
        listContainer.innerHTML = `
          <div class="col-span-full text-center text-red-500 text-xs py-12">
            Không thể tải dữ liệu: ${json.error || 'Lỗi không xác định'}
          </div>
        `;
      }
    } catch {
      listContainer.innerHTML = `
        <div class="col-span-full text-center text-red-500 text-xs py-12">
          Lỗi kết nối máy chủ API.
        </div>
      `;
    }
  }

  function renderList() {
    if (providers.length === 0) {
      listContainer.innerHTML = `
        <div class="col-span-full text-center text-gray-400 text-xs py-12 border border-dashed rounded-xl">
          Chưa có đơn vị vận chuyển nào. Nhấn "Thêm Đơn Vị Mới" để bắt đầu.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = providers.map(p => {
      const statusBadge = p.is_active
        ? `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wide">Đang hoạt động</span>`
        : `<span class="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-wide">Ngừng hoạt động</span>`;

      // Formatted config preview
      const configStr = p.additional_config ? JSON.stringify(p.additional_config, null, 2) : '{}';

      return `
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-extrabold text-[#C9A84C] tracking-widest">${p.carrier_code}</span>
              ${statusBadge}
            </div>
            
            <div>
              <h4 class="text-sm font-black text-gray-900">${p.name}</h4>
              <p class="text-[10px] text-gray-450 mt-1 truncate" title="${p.api_url || 'Chưa thiết lập'}">URL: ${p.api_url || 'Chưa thiết lập'}</p>
            </div>

            <div class="border-t border-gray-100 pt-2.5">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Cấu hình JSON:</span>
              <pre class="bg-gray-50 p-2 rounded-lg text-[9px] font-mono text-zinc-650 overflow-x-auto max-h-20 select-all">${configStr}</pre>
            </div>
          </div>

          <div class="flex gap-2 mt-5 border-t border-gray-100 pt-3.5">
            <button data-action="edit" data-id="${p.id}" class="flex-1 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-850 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer">Sửa</button>
            <button data-action="delete" data-id="${p.id}" class="py-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-650 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer">Xóa</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind item actions
    listContainer.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = providers.find(p => p.id === id);
        if (item) openModal(item);
      });
    });

    listContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        const item = providers.find(p => p.id === id);
        if (!item) return;

        if (!confirm(`Bạn có chắc muốn xóa đơn vị vận chuyển "${item.name}"?`)) return;

        try {
          const res = await fetch(`${API_BASE}/api/admin/shipping-providers/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (res.ok && json.success) {
            showToast(json.message || 'Xóa đơn vị vận chuyển thành công.', 'success');
            loadProviders();
          } else {
            showToast(json.error || 'Lỗi khi xóa.', 'error');
          }
        } catch {
          showToast('Lỗi kết nối máy chủ.', 'error');
        }
      });
    });
  }

  function openModal(item = null) {
    if (item) {
      modalTitle.textContent = 'Cấu Hình Đơn Vị Vận Chuyển';
      fieldId.value = item.id;
      fieldName.value = item.name;
      fieldCode.value = item.carrier_code;
      fieldUrl.value = item.api_url || '';
      fieldToken.value = item.api_token || '';
      fieldConfig.value = item.additional_config ? JSON.stringify(item.additional_config, null, 2) : '{}';
      fieldActive.value = item.is_active ? '1' : '0';
    } else {
      modalTitle.textContent = 'Thêm Đơn Vị Vận Chuyển Mới';
      fieldId.value = '';
      fieldName.value = '';
      fieldCode.value = '';
      fieldUrl.value = '';
      fieldToken.value = '';
      fieldConfig.value = '{\n  \n}';
      fieldActive.value = '1';
    }

    modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    modalForm.reset();
  }

  // Modal event bindings
  addBtn.addEventListener('click', () => openModal(null));
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = fieldId.value;
    const isEdit = id !== '';

    let additionalConfig = {};
    try {
      const val = fieldConfig.value.trim();
      additionalConfig = val !== '' ? JSON.parse(val) : {};
    } catch {
      showToast('Cấu hình bổ sung phải là định dạng JSON hợp lệ.', 'error');
      return;
    }

    const payload = {
      name: fieldName.value.trim(),
      carrier_code: fieldCode.value.trim(),
      api_url: fieldUrl.value.trim(),
      api_token: fieldToken.value.trim(),
      additional_config: additionalConfig,
      is_active: parseInt(fieldActive.value)
    };

    const url = isEdit
      ? `${API_BASE}/api/admin/shipping-providers/${id}`
      : `${API_BASE}/api/admin/shipping-providers`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(json.message || 'Lưu đơn vị vận chuyển thành công.', 'success');
        closeModal();
        loadProviders();
      } else {
        showToast(json.error || 'Lỗi khi lưu.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  });

  // Initial load
  loadProviders();
}
