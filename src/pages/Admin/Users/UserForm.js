import { showToast } from '../shared/ui.js';
import { createUser, updateUser, getRoles } from '../../../services/adminService.js';

export function openUserForm(user, onSaved) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in';
  overlay.setAttribute('data-lenis-prevent', 'true');
  
  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 md:scale-100 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 class="text-base font-bold text-gray-900">${user ? 'Phân quyền người dùng' : 'Thêm người dùng mới'}</h2>
          <p class="text-xs text-gray-500 mt-0.5">${user ? 'Điều chỉnh các vai trò truy cập hệ thống' : 'Tạo mới một tài khoản hệ thống'}</p>
        </div>
        <button id="uf-close" class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div id="uf-form-container">
        <div class="p-10 flex flex-col items-center justify-center min-h-[250px] space-y-4">
          <div class="spinner"></div>
          <div class="text-xs font-bold text-gray-400 tracking-widest uppercase animate-pulse">Đang tải danh sách vai trò...</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#uf-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Load roles and render the form asynchronously
  (async () => {
    let rolesList = [];
    try {
      const res = await getRoles();
      rolesList = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }

    if (rolesList.length === 0) {
      rolesList = [
        { name: 'super_admin', display_name: 'Super Admin' },
        { name: 'admin', display_name: 'Admin' },
        { name: 'editor', display_name: 'Editor' },
        { name: 'viewer', display_name: 'Viewer' },
      ];
    }

    const formContainer = overlay.querySelector('#uf-form-container');
    if (!formContainer) return;

    const userRoles = (user?.roles || []).map(r => typeof r === 'string' ? r : (r.name || r.value || ''));

    if (user) {
      // Edit / Role Assignment Mode
      formContainer.innerHTML = `
        <form id="user-form" class="p-6 space-y-5">
          <!-- User Profile Summary Info Card -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="font-bold text-gray-900 text-sm">${user.full_name || user.name || '-'}</div>
            <div class="text-xs text-gray-500 font-mono mt-0.5">${user.email}</div>
            ${user.phone ? `<div class="text-xs text-gray-400 mt-1 flex items-center gap-1"><svg class="inline" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${user.phone}</div>` : ''}
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vai trò hệ thống *</label>
            <div class="relative">
              <select name="role" required class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] appearance-none cursor-pointer pr-10">
                <option value="" disabled ${userRoles.length === 0 ? 'selected' : ''}>Chọn vai trò...</option>
                ${rolesList.map(r => `
                  <option value="${r.name}" ${userRoles.includes(r.name) ? 'selected' : ''}>${r.display_name || r.name}</option>
                `).join('')}
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" id="uf-cancel" class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors">Hủy</button>
            <button type="submit" id="uf-submit" class="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-white hover:bg-[#b8963e] text-sm font-semibold shadow-sm hover:shadow transition-all">Lưu phân quyền</button>
          </div>
        </form>
      `;
    } else {
      // Create Mode (Normal registration fields)
      formContainer.innerHTML = `
        <form id="user-form" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên *</label>
            <input name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]" placeholder="Nhập họ và tên"/>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
            <input name="email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]" placeholder="email@example.com"/>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
            <input name="phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]" placeholder="Ví dụ: 0901234567"/>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu *</label>
            <input name="password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]" placeholder="••••••••"/>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò *</label>
            <div class="relative">
              <select name="role" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] appearance-none cursor-pointer pr-10">
                <option value="" disabled selected>Chọn vai trò...</option>
                ${rolesList.map(r => `
                  <option value="${r.name}">${r.display_name || r.name}</option>
                `).join('')}
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div class="pb-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="is_active" class="w-4 h-4 accent-[#C9A84C]" checked>
              <span class="text-sm font-semibold text-gray-700">Kích hoạt tài khoản</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" id="uf-cancel" class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors">Hủy</button>
            <button type="submit" id="uf-submit" class="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-white hover:bg-[#b8963e] text-sm font-semibold shadow-sm hover:shadow transition-colors">Thêm</button>
          </div>
        </form>
      `;
    }

    // Now bind all button and form listeners after elements are created
    overlay.querySelector('#uf-cancel').addEventListener('click', close);

    overlay.querySelector('#user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = overlay.querySelector('#uf-submit');
      const oldText = btn.textContent;
      btn.textContent = 'Đang lưu...'; btn.disabled = true;
      try {
        const fd = new FormData(e.target);
        let body = {};
        const selectedRole = fd.get('role');
        
        if (user) {
          // Edit mode sends only roles array
          body = {
            roles: selectedRole ? [selectedRole] : []
          };
        } else {
          // Create mode sends full details and maps name -> full_name
          body = {
            full_name: fd.get('name'),
            email: fd.get('email'),
            phone: fd.get('phone'),
            is_active: fd.has('is_active'),
            roles: selectedRole ? [selectedRole] : [],
          };
          const pw = fd.get('password');
          if (pw) body.password = pw;
        }
        
        if (user) await updateUser(user.id, body);
        else await createUser(body);
        showToast(user ? 'Cập nhật phân quyền thành công!' : 'Thêm người dùng thành công!');
        close();
        if (onSaved) onSaved();
      } catch (err) {
        showToast(err.message || 'Có lỗi xảy ra', 'error');
      } finally {
        btn.textContent = oldText; btn.disabled = false;
      }
    });
  })();
}
