import { showToast } from '../shared/ui.js';
import { createCategory, updateCategory, getCategories, createSubCategory, updateSubCategory } from '../../../services/adminService.js';
import { openImagePicker } from '../Products/ImagePicker.js';

export function openCategoryForm(category, onSaved) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.setAttribute('data-lenis-prevent', 'true');

  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">${category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</h2>
        <button id="cf-close" class="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form id="cat-form" class="p-6 space-y-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Tên danh mục *</label>
          <input name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
            value="${category?.name || ''}" placeholder="Đồng hồ nam..."/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
          <div class="flex gap-2">
            <input name="slug" id="cf-slug"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
              value="${category?.slug || ''}"/>
            <button type="button" id="cf-gen-slug"
              class="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              Tự động
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Danh mục cha</label>
          <select name="parent_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]" id="cf-parent">
            <option value="">-- Không có --</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Ảnh Banner Desktop</label>
          <div class="flex gap-2">
            <input name="image_url" id="cf-image-url"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
              value="${category?.image_url || ''}" placeholder="Nhập link ảnh hoặc chọn từ thư viện..."/>
            <button type="button" id="cf-select-image"
              class="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap">
              Chọn ảnh
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Ảnh Banner Mobile</label>
          <div class="flex gap-2">
            <input name="banner_mobile_url" id="cf-banner-mobile-url"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
              value="${category?.banner_mobile_url || ''}" placeholder="Nhập link ảnh hoặc chọn từ thư viện..."/>
            <button type="button" id="cf-select-banner-mobile"
              class="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap">
              Chọn ảnh
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Mô tả danh mục</label>
          <textarea name="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C] h-20 resize-none" placeholder="Nhập mô tả cho danh mục...">${category?.description || ''}</textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Vị trí hiển thị *</label>
          <input type="number" name="sort_order" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9A84C]"
            value="1" min="1" placeholder="1, 2, 3..."/>
        </div>

        <div class="flex items-center pb-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" class="w-4 h-4 accent-[#C9A84C]" ${category?.is_active !== false ? 'checked' : ''}>
            <span class="text-sm text-gray-700">Kích hoạt</span>
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" id="cf-cancel" class="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
          <button type="submit" id="cf-submit" class="px-5 py-2 rounded-lg bg-[#C9A84C] text-white hover:bg-[#b8963e] text-sm font-medium">Lưu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#cf-close').addEventListener('click', close);
  overlay.querySelector('#cf-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const nameInput = overlay.querySelector('[name="name"]');
  const slugInput = overlay.querySelector('#cf-slug');
  const parentSelect = overlay.querySelector('#cf-parent');
  const sortInput = overlay.querySelector('[name="sort_order"]');

  nameInput.addEventListener('input', () => {
    if (!category) slugInput.value = slugify(nameInput.value);
  });

  overlay.querySelector('#cf-gen-slug').addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) slugInput.value = slugify(name);
  });

  const imageUrlInput = overlay.querySelector('#cf-image-url');
  overlay.querySelector('#cf-select-image').addEventListener('click', () => {
    openImagePicker((url) => {
      if (url) imageUrlInput.value = url;
    });
  });

  const bannerMobileInput = overlay.querySelector('#cf-banner-mobile-url');
  overlay.querySelector('#cf-select-banner-mobile').addEventListener('click', () => {
    openImagePicker((url) => {
      if (url) bannerMobileInput.value = url;
    });
  });

  let categoryTree = [];

  // Fetch full tree to build parent options and compute dynamic position numbers
  getCategories({ tree: true }).then((res) => {
    categoryTree = res.data || res;

    // 1. Populate parent choices
    categoryTree.forEach(c => {
      if (category && c.id == category.id) return; // Cannot set itself as parent
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (category && category.parent_id == c.id) {
        opt.selected = true;
      }
      parentSelect.appendChild(opt);
    });

    // Handle disables like before
    if (category) {
      if (category.parent_id) {
        const noParentOpt = parentSelect.querySelector('option[value=""]');
        if (noParentOpt) noParentOpt.disabled = true;
      } else {
        parentSelect.disabled = true;
      }
    }

    // 2. Setup Position calculation
    function updatePositionInput() {
      const parentId = parentSelect.value;
      if (!parentId) {
        // Parent category (categories table)
        const parents = categoryTree;
        if (category && !category.parent_id) {
          const idx = parents.findIndex(c => c.id === category.id);
          sortInput.value = idx !== -1 ? idx + 1 : parents.length + 1;
        } else {
          sortInput.value = parents.length + 1;
        }
      } else {
        // Subcategory (sub_categories table under parentId)
        const parent = categoryTree.find(c => c.id == parentId);
        const subs = parent ? (parent.children || []) : [];
        if (category && category.parent_id == parentId) {
          const idx = subs.findIndex(c => c.id === category.id);
          sortInput.value = idx !== -1 ? idx + 1 : subs.length + 1;
        } else {
          sortInput.value = subs.length + 1;
        }
      }
    }

    parentSelect.addEventListener('change', updatePositionInput);
    updatePositionInput();
  }).catch((err) => {
    console.error('Error fetching categories tree:', err);
  });

  overlay.querySelector('#cat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = overlay.querySelector('#cf-submit');
    btn.textContent = 'Đang lưu...'; btn.disabled = true;
    try {
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      body.is_active = fd.has('is_active');
      body.image_url = body.image_url?.trim() || null;
      body.banner_mobile_url = body.banner_mobile_url?.trim() || null;
      body.description = body.description?.trim() || null;
      body.sort_order = Number(body.sort_order || 1);

      const isSub = !!body.parent_id || (category && !!category.parent_id);

      if (body.parent_id) {
        body.category_id = Number(body.parent_id);
        delete body.parent_id;
      }

      if (category) {
        if (isSub) {
          await updateSubCategory(category.id, body);
        } else {
          await updateCategory(category.id, body);
        }
      } else {
        if (isSub) {
          await createSubCategory(body);
        } else {
          await createCategory(body);
        }
      }
      showToast(category ? 'Cập nhật thành công!' : 'Thêm danh mục thành công!');
      close();
      if (onSaved) onSaved();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      btn.textContent = 'Lưu'; btn.disabled = false;
    }
  });
}

function slugify(text) {
  const map = {
    'àáạảãâầấậẩẫăằắặẳẵ': 'a', 'èéẹẻẽêềếệểễ': 'e', 'ìíịỉĩ': 'i',
    'òóọỏõôồốộổỗơờớợởỡ': 'o', 'ùúụủũưừứựửữ': 'u', 'ỳýỵỷỹ': 'y', 'đ': 'd',
  };
  let s = text.toLowerCase().trim();
  for (const [chars, rep] of Object.entries(map)) {
    for (const ch of [...chars]) s = s.replaceAll(ch, rep);
  }
  return s.replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');
}
