import { showToast, isSystem } from '../shared/ui.js';
import { API_BASE, STORAGE_KEYS } from '../../../services/config.js';

const MODULE_HIERARCHY = [
  {
    id: 'products_group',
    label: 'Mô-đun Sản Phẩm & Tồn Kho (Products)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    children: [
      { id: 'products', label: 'Quản lý Sản phẩm (Products list)' },
      { id: 'variants', label: 'Quản lý Biến thể sản phẩm (Variants)' },
      { id: 'categories', label: 'Quản lý Danh mục (Categories)' }
    ]
  },
  {
    id: 'orders_group',
    label: 'Mô-đun Bán Hàng & Vận Đơn (Orders)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    children: [
      { id: 'orders', label: 'Quản lý Đơn hàng (Orders list)' },
      { id: 'returns', label: 'Quản lý Đổi trả hàng (Returns requests)' }
    ]
  },
  {
    id: 'members_group',
    label: 'Mô-đun Khách Hàng & Thẻ Thành Viên (Customers)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    children: [
      { id: 'members', label: 'Quản lý Khách hàng (Members list)' },
      { id: 'ranks', label: 'Hạng VIP & Tích điểm (VIP Ranks)' }
    ]
  },
  {
    id: 'vouchers_group',
    label: 'Mô-đun Khuyến Mãi & Quà Tặng (Marketing)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    children: [
      { id: 'vouchers', label: 'Quản lý Khuyến mãi & Voucher' },
      { id: 'flash-sales', label: 'Quản lý Flash Sales' },
      { id: 'reviews', label: 'Quản lý Đánh giá / Bình luận (Reviews)' }
    ]
  },
  {
    id: 'users_group',
    label: 'Mô-đun Phân Quyền & Nhân Sự (Staff)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    children: [
      { id: 'users', label: 'Phân quyền Nhân viên (Staff privileges)' },
      { id: 'roles', label: 'Vai trò chức danh (Roles management)' }
    ]
  },
  {
    id: 'blogs_group',
    label: 'Mô-đun Bài Viết & Tin Tức (Blogs)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a2.5 2.5 0 0 1 2.5-2.5H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>`,
    children: [
      { id: 'blogs', label: 'Quản lý bài viết (Posts)' },
      { id: 'blog_categories', label: 'Danh mục bài viết (Blog Categories)' },
      { id: 'blog_tags', label: 'Thẻ bài viết (Tags)' }
    ]
  },
  {
    id: 'languages_group',
    label: 'Mô-đun Đa Ngôn Ngữ (Languages)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    children: [
      { id: 'languages', label: 'Quản lý ngôn ngữ (Languages)' },
      { id: 'translations', label: 'Quản lý bản dịch (Translations)' }
    ]
  },
  {
    id: 'analytics',
    label: 'Mô-đun Thống Kê & Báo Cáo (Analytics)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    children: []
  },
  {
    id: 'settings',
    label: 'Cài Đặt Cửa Hàng (Store Settings)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    children: []
  }
];

function getAdminToken() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH_TOKEN) || localStorage.getItem('sly_admin_auth_token');
}

export function renderSystemModelSettings(container) {
  let settings = {
    disabled_modules: []
  };

  const token = getAdminToken();

  async function loadData() {
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-500 text-sm font-medium">Đang tải cấu hình mô-đun...</span>
      </div>
    `;

    try {
      const res = await fetch(`${API_BASE}/api/settings?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          settings = {
            brand_name: json.data.brand_name || 'Mắt Bão WS',
            project_domain: json.data.project_domain || 'matbaows.vn',
            is_ecommerce: json.data.is_ecommerce !== undefined ? Number(json.data.is_ecommerce) : 1,
            disabled_modules: json.data.disabled_modules || []
          };
        }
      }
      renderUI();
    } catch (err) {
      container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm max-w-lg mx-auto mt-8 text-center">
          <h4 class="font-bold mb-1">Lỗi tải dữ liệu</h4>
          <p class="mb-4">Không thể kết nối đến máy chủ API.</p>
          <button id="retry-model-load-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors">THỬ LẠI</button>
        </div>
      `;
      container.querySelector('#retry-model-load-btn')?.addEventListener('click', loadData);
    }
  }

  function renderUI() {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Mô-đun Hệ Thống</h1>
            <p class="text-sm text-gray-500 mt-1">Bật/Tắt các chức năng trong trang quản trị. Vô hiệu hóa mô-đun cha sẽ tắt toàn bộ mô-đun con liên quan.</p>
          </div>
          <button id="save-model-settings" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Lưu cấu hình
          </button>
        </div>

        <!-- Search and Filter Bar -->
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div class="flex-1 relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" id="model-search" class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" placeholder="Tìm kiếm nhanh mô-đun...">
          </div>
          <button id="model-expand-all" class="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Bật tất cả</button>
          <button id="model-collapse-all" class="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Tắt tất cả</button>
        </div>

        <!-- Module Groups List -->
        <div class="space-y-6" id="module-groups-container">
          ${MODULE_HIERARCHY.map(group => {
            const isGroupDisabled = settings.disabled_modules.includes(group.id);
            const hasChildren = group.children && group.children.length > 0;

            return `
              <div class="bg-white border ${isGroupDisabled ? 'border-red-200' : 'border-gray-200'} rounded-2xl shadow-sm overflow-hidden transition-all duration-300 group-card" data-group-id="${group.id}">
                <!-- Parent Header -->
                <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-150 ${isGroupDisabled ? 'bg-red-50/30' : ''} transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg ${isGroupDisabled ? 'bg-red-100 text-red-600' : 'bg-gray-200/80 text-gray-700'} flex items-center justify-center transition-colors">
                      ${group.icon}
                    </div>
                    <div>
                      <h3 class="text-sm font-bold ${isGroupDisabled ? 'text-red-700' : 'text-gray-800'}">${group.label}</h3>
                      <p class="text-[10px] ${isGroupDisabled ? 'text-red-500' : 'text-gray-400'} font-medium">Nhóm ID: ${group.id}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase tracking-wider ${isGroupDisabled ? 'text-red-600' : 'text-green-600'}">
                      ${isGroupDisabled ? 'Đã tắt' : 'Đang hoạt động'}
                    </span>
                    <label class="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-parent-toggle="${group.id}" class="sr-only peer parent-checkbox" ${!isGroupDisabled ? 'checked' : ''}>
                      <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C]"></div>
                    </label>
                  </div>
                </div>

                <!-- Children List -->
                ${hasChildren ? `
                  <div class="p-4 bg-white space-y-3 relative child-container">
                    ${group.children.map((child, index) => {
                      const isChildDisabled = settings.disabled_modules.includes(child.id) || isGroupDisabled;
                      const isChildExplicitlyDisabled = settings.disabled_modules.includes(child.id);

                      return `
                        <div class="flex items-center justify-between p-3 rounded-xl border relative transition-all duration-200 ${
                          isChildDisabled 
                            ? 'bg-red-50/40 border-red-100 text-red-600' 
                            : 'bg-white border-gray-150 text-gray-700 hover:border-gray-300'
                        } child-row" data-child-id="${child.id}" style="margin-left: 20px;">
                          <!-- Tree line indicator -->
                          <div class="absolute left-[-20px] top-[-16px] w-[20px] h-[34px] border-l-2 border-b-2 border-gray-200 rounded-bl-lg pointer-events-none"></div>

                          <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold ${isChildDisabled ? 'text-red-700' : 'text-gray-700'}">${child.label}</span>
                            <span class="text-[9px] px-1.5 py-0.5 rounded ${isChildDisabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'} font-bold">ID: ${child.id}</span>
                          </div>

                          <label class="relative inline-flex items-center cursor-pointer select-none">
                            <input type="checkbox" data-child-toggle="${child.id}" data-parent-ref="${group.id}" class="sr-only peer child-checkbox" 
                              ${!isChildExplicitlyDisabled && !isGroupDisabled ? 'checked' : ''} 
                              ${isGroupDisabled ? 'disabled' : ''}>
                            <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C] peer-disabled:opacity-30"></div>
                          </label>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <div class="p-4 bg-white text-center text-xs text-gray-400 italic">Mô-đun đơn lẻ, không có mô-đun con.</div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // 1. Cascading toggle: disabling parent disables all children
    container.querySelectorAll('.parent-checkbox').forEach(parentChk => {
      parentChk.addEventListener('change', () => {
        const groupId = parentChk.dataset.parentToggle;
        const active = parentChk.checked;
        const card = container.querySelector(`.group-card[data-group-id="${groupId}"]`);
        const header = card.querySelector('div');
        const headerText = header.querySelector('span');
        const headerTitle = header.querySelector('h3');
        const headerIconContainer = header.querySelector('.w-8');

        // Update parent visually
        if (active) {
          card.classList.remove('border-red-200');
          card.classList.add('border-gray-200');
          header.classList.remove('bg-red-50/30');
          headerText.textContent = 'Đang hoạt động';
          headerText.className = 'text-[10px] font-black uppercase tracking-wider text-green-600';
          headerTitle.className = 'text-sm font-bold text-gray-800';
          headerIconContainer.className = 'w-8 h-8 rounded-lg bg-gray-200/80 text-gray-700 flex items-center justify-center transition-colors';
          
          // Remove parent from disabled modules
          settings.disabled_modules = (settings.disabled_modules || []).filter(id => id !== groupId);
        } else {
          card.classList.remove('border-gray-200');
          card.classList.add('border-red-200');
          header.classList.add('bg-red-50/30');
          headerText.textContent = 'Đã tắt';
          headerText.className = 'text-[10px] font-black uppercase tracking-wider text-red-600';
          headerTitle.className = 'text-sm font-bold text-red-700';
          headerIconContainer.className = 'w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center transition-colors';
          
          // Add parent to disabled modules
          if (!settings.disabled_modules.includes(groupId)) {
            settings.disabled_modules.push(groupId);
          }
        }

        // Cascade to children
        card.querySelectorAll('.child-checkbox').forEach(childChk => {
          childChk.disabled = !active;
          const childRow = childChk.closest('.child-row');
          const childId = childChk.dataset.childToggle;
          
          if (!active) {
            // Force children off when parent is off
            childChk.checked = false;
            childRow.className = 'flex items-center justify-between p-3 rounded-xl border relative transition-all duration-200 bg-red-50/40 border-red-100 text-red-600 child-row';
            childRow.querySelector('span').className = 'text-xs font-semibold text-red-700';
            childRow.querySelector('.rounded').className = 'text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold';

            if (!settings.disabled_modules.includes(childId)) {
              settings.disabled_modules.push(childId);
            }
          } else {
            // When parent becomes active, children become checkable. Default to checked unless previously disabled.
            // For safety, let's restore them to enabled/checked, but let the user uncheck manually.
            childChk.checked = true;
            childRow.className = 'flex items-center justify-between p-3 rounded-xl border relative transition-all duration-200 bg-white border-gray-150 text-gray-700 hover:border-gray-300 child-row';
            childRow.querySelector('span').className = 'text-xs font-semibold text-gray-700';
            childRow.querySelector('.rounded').className = 'text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-bold';

            settings.disabled_modules = settings.disabled_modules.filter(id => id !== childId);
          }
        });
      });
    });

    // 2. Child toggle logic
    container.querySelectorAll('.child-checkbox').forEach(childChk => {
      childChk.addEventListener('change', () => {
        const childId = childChk.dataset.childToggle;
        const active = childChk.checked;
        const childRow = childChk.closest('.child-row');

        if (active) {
          childRow.className = 'flex items-center justify-between p-3 rounded-xl border relative transition-all duration-200 bg-white border-gray-150 text-gray-700 hover:border-gray-300 child-row';
          childRow.querySelector('span').className = 'text-xs font-semibold text-gray-700';
          childRow.querySelector('.rounded').className = 'text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-bold';

          settings.disabled_modules = (settings.disabled_modules || []).filter(id => id !== childId);
        } else {
          childRow.className = 'flex items-center justify-between p-3 rounded-xl border relative transition-all duration-200 bg-red-50/40 border-red-100 text-red-600 child-row';
          childRow.querySelector('span').className = 'text-xs font-semibold text-red-700';
          childRow.querySelector('.rounded').className = 'text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold';

          if (!settings.disabled_modules.includes(childId)) {
            settings.disabled_modules.push(childId);
          }
        }
      });
    });

    // 3. Expand All / Collapse All buttons
    container.querySelector('#model-expand-all')?.addEventListener('click', () => {
      container.querySelectorAll('.parent-checkbox').forEach(chk => {
        if (!chk.checked) {
          chk.checked = true;
          chk.dispatchEvent(new Event('change'));
        }
      });
    });

    container.querySelector('#model-collapse-all')?.addEventListener('click', () => {
      container.querySelectorAll('.parent-checkbox').forEach(chk => {
        if (chk.checked) {
          chk.checked = false;
          chk.dispatchEvent(new Event('change'));
        }
      });
    });

    // 4. Search Filter
    const searchInput = container.querySelector('#model-search');
    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      container.querySelectorAll('.group-card').forEach(card => {
        const groupText = card.querySelector('h3').textContent.toLowerCase();
        const groupId = card.dataset.groupId.toLowerCase();
        
        let matchChild = false;
        card.querySelectorAll('.child-row').forEach(row => {
          const childText = row.querySelector('span').textContent.toLowerCase();
          const childId = row.dataset.childId.toLowerCase();
          if (childText.includes(q) || childId.includes(q)) {
            row.style.display = '';
            matchChild = true;
          } else {
            row.style.display = 'none';
          }
        });

        if (groupText.includes(q) || groupId.includes(q) || matchChild) {
          card.style.display = '';
          if (q === '') {
            // Restore normal display
            card.querySelectorAll('.child-row').forEach(row => row.style.display = '');
          }
        } else {
          card.style.display = 'none';
        }
      });
    });

    // 5. Save changes
    container.querySelector('#save-model-settings')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang lưu...`;

      const payload = {
        brand_name: settings.brand_name || 'Mắt Bão WS',
        project_domain: settings.project_domain || 'matbaows.vn',
        is_ecommerce: settings.is_ecommerce !== undefined ? settings.is_ecommerce : 1,
        disabled_modules: settings.disabled_modules || []
      };

      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Cập nhật cấu hình mô-đun thành công!', 'success');
          if (!window.APP_SETTINGS) window.APP_SETTINGS = {};
          window.APP_SETTINGS.disabled_modules = payload.disabled_modules;
          
          const sidebarContainer = document.getElementById('admin-sidebar');
          if (sidebarContainer) {
            const currentRoute = window.location.hash.replace('#', '').split('/')[0];
            import('../shared/AdminSidebar.js').then(mod => {
              mod.renderSidebar(sidebarContainer, currentRoute);
            });
          }
          loadData();
        } else {
          showToast(json.error || 'Có lỗi xảy ra khi lưu cấu hình.', 'error');
          btn.disabled = false;
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu cấu hình`;
        }
      } catch {
        showToast('Lỗi kết nối máy chủ API.', 'error');
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu cấu hình`;
      }
    });
  }

  loadData();
}
