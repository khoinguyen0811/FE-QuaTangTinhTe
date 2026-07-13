import { showToast } from '../shared/ui.js';
import { createVariantType, updateVariantType } from '../../../services/adminService.js';

export function openVariantTypeForm(type, onSaved) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');

  const isEdit = !!type;

  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">${isEdit ? 'Chỉnh sửa loại biến thể' : 'Thêm loại biến thể mới'}</h2>
        <button id="vtf-close" class="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form id="vt-form" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Tên hiển thị *</label>
          <input name="display_name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
            value="${type?.display_name || ''}" placeholder="Ví dụ: Kích cỡ, Màu sắc, Chất liệu..."/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Mã code (Name) *</label>
          <input name="name" id="vtf-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
            value="${type?.name || ''}" ${isEdit ? 'disabled' : ''} placeholder="Ví dụ: size, color, material..."/>
          <p class="text-xs text-gray-400 mt-1">Chỉ sử dụng chữ thường không dấu, số, gạch ngang và gạch dưới. Không thể thay đổi sau khi tạo.</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Các giá trị tùy chọn (cách nhau bằng dấu phẩy)</label>
          <textarea name="predefined_values" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" rows="2"
            placeholder="Ví dụ: S, M, L, XL (để trống nếu muốn nhập tự do)...">${type?.predefined_values || ''}</textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" id="vtf-cancel" class="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
          <button type="submit" id="vtf-submit" class="px-5 py-2 rounded-lg bg-[#C9A84C] text-white hover:bg-[#b8963e] text-sm font-medium">Lưu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#vtf-close').addEventListener('click', close);
  overlay.querySelector('#vtf-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const nameInput = overlay.querySelector('#vtf-name');
  const displayNameInput = overlay.querySelector('[name="display_name"]');

  // Auto-slugify display_name into name code during creation
  if (!isEdit) {
    displayNameInput.addEventListener('input', (e) => {
      // If user hasn't manually modified nameInput or it's empty, auto-fill it
      nameInput.value = slugifyCode(e.target.value);
    });

    nameInput.addEventListener('input', (e) => {
      e.target.value = slugifyCode(e.target.value);
    });
  }

  overlay.querySelector('#vt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = overlay.querySelector('#vtf-submit');
    btn.textContent = 'Đang lưu...'; btn.disabled = true;

    try {
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());

      // If edit mode, name is disabled, so we manually include it from type
      if (isEdit) {
        body.name = type.name;
      } else {
        body.name = slugifyCode(body.name);
      }

      if (isEdit) {
        await updateVariantType(type.id, body);
        showToast('Cập nhật loại biến thể thành công!');
      } else {
        await createVariantType(body);
        showToast('Thêm loại biến thể thành công!');
      }
      close();
      if (onSaved) onSaved();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      btn.textContent = 'Lưu'; btn.disabled = false;
    }
  });
}

function slugifyCode(text) {
  const map = {
    'àáạảãâầấậẩẫăằắặẳẵ': 'a', 'èéẹẻẽêềếệểễ': 'e', 'ìíịỉĩ': 'i',
    'òóọỏõôồốộổỗơờớợởỡ': 'o', 'ùúụủũưừứựửữ': 'u', 'ỳýỵỷỹ': 'y', 'đ': 'd',
  };
  let s = text.toLowerCase().trim();
  for (const [chars, rep] of Object.entries(map)) {
    for (const ch of [...chars]) s = s.replaceAll(ch, rep);
  }
  return s.replace(/[^a-z0-9_-]/g, '').replace(/[\s-]+/g, '_').replace(/^-+|-+$/g, '');
}
