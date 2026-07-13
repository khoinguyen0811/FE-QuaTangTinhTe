import { API_BASE } from '../../services/config.js';
import { showToast } from '../../pages/Admin/shared/ui.js';

export function renderBrandForm(settings) {
  return `
    <div class="space-y-4">
      <div>
        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tên thương hiệu</label>
        <input type="text" id="quick-brand-name" value="${settings.brand_name || ''}" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]" />
      </div>
      
      <!-- Navbar Logo -->
      <div class="border-t border-gray-100 pt-3">
        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ảnh Logo thanh điều hướng (Navbar Logo)</label>
        <div class="flex items-center gap-4">
          <div id="quick-logo-preview" class="w-16 h-16 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
            ${settings.logo_url 
              ? `<img id="quick-logo-img" src="${settings.logo_url}" class="max-h-full max-w-full object-contain" />` 
              : `<span class="text-[10px] text-gray-400">Logo mặc định</span>`
            }
          </div>
          <div class="flex-1 space-y-2">
            <input type="file" id="quick-logo-input" accept="image/*" class="hidden" />
            <div class="flex gap-2">
              <button id="quick-upload-logo" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0">Tải ảnh lên</button>
              ${settings.logo_url ? `<button id="quick-delete-logo" class="border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white">Xóa logo</button>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Favicon Logo -->
      <div class="border-t border-gray-100 pt-3">
        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Logo Tab Trình Duyệt (Favicon - Web Logo)</label>
        <div class="flex items-center gap-4">
          <div id="quick-favicon-preview" class="w-16 h-16 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
            ${settings.favicon_url 
              ? `<img src="${settings.favicon_url}" class="w-8 h-8 object-contain" />` 
              : `<svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
            }
          </div>
          <div class="flex-1 space-y-2">
            <input type="file" id="quick-favicon-input" accept="image/*" class="hidden" />
            <div class="flex gap-2">
              <button id="quick-upload-favicon" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0">Tải ảnh lên</button>
              ${settings.favicon_url ? `<button id="quick-delete-favicon" class="border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white">Xóa Favicon</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindBrandEvents(modalEl, settings, renderModal, token) {
  const logoPreview = modalEl.querySelector('#quick-logo-preview');
  if (settings.logo_url && logoPreview) {
    applyContrastBackground(settings.logo_url, logoPreview);
  }

  const brandInput = modalEl.querySelector('#quick-brand-name');
  brandInput?.addEventListener('input', (e) => {
    settings.brand_name = e.target.value.trim();
  });

  // 1. Navbar Logo upload
  const logoInput = modalEl.querySelector('#quick-logo-input');
  const uploadBtn = modalEl.querySelector('#quick-upload-logo');
  const deleteBtn = modalEl.querySelector('#quick-delete-logo');

  uploadBtn?.addEventListener('click', () => logoInput?.click());

  logoInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    uploadBtn.textContent = 'Đang tải...';
    uploadBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/upload-logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        settings.logo_url = data.data.url;
        if (window.APP_SETTINGS) window.APP_SETTINGS.logo_url = data.data.url;
        showToast('Tải lên ảnh logo thành công!', 'success');
        renderModal();
      } else {
        showToast(data.error || 'Lỗi tải ảnh logo.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi tải logo.', 'error');
    } finally {
      uploadBtn.textContent = 'Tải ảnh lên';
      uploadBtn.disabled = false;
    }
  });

  deleteBtn?.addEventListener('click', () => {
    if (!confirm('Bạn có chắc muốn xóa ảnh logo thương hiệu?')) return;
    settings.logo_url = '';
    renderModal();
  });

  // 2. Favicon Logo upload
  const faviconInput = modalEl.querySelector('#quick-favicon-input');
  const uploadFaviconBtn = modalEl.querySelector('#quick-upload-favicon');
  const deleteFaviconBtn = modalEl.querySelector('#quick-delete-favicon');

  uploadFaviconBtn?.addEventListener('click', () => faviconInput?.click());

  faviconInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('favicon', file);

    uploadFaviconBtn.textContent = 'Đang tải...';
    uploadFaviconBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/upload-favicon`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        settings.favicon_url = data.data.url;
        if (window.APP_SETTINGS) window.APP_SETTINGS.favicon_url = data.data.url;
        showToast('Tải lên favicon thành công!', 'success');
        renderModal();
      } else {
        showToast(data.error || 'Lỗi tải favicon.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi tải favicon.', 'error');
    } finally {
      uploadFaviconBtn.textContent = 'Tải ảnh lên';
      uploadFaviconBtn.disabled = false;
    }
  });

  deleteFaviconBtn?.addEventListener('click', () => {
    if (!confirm('Bạn có chắc muốn xóa favicon thương hiệu?')) return;
    settings.favicon_url = '';
    renderModal();
  });
}

function applyContrastBackground(imgUrl, previewEl) {
  if (!imgUrl || !previewEl) return;
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 30;
      canvas.height = 30;
      ctx.drawImage(img, 0, 0, 30, 30);
      const imgData = ctx.getImageData(0, 0, 30, 30);
      const data = imgData.data;
      
      let totalR = 0, totalG = 0, totalB = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        if (a > 30) {
          totalR += r;
          totalG += g;
          totalB += b;
          count++;
        }
      }
      
      let isLightLogo = true;
      if (count > 0) {
        const avgR = totalR / count;
        const avgG = totalG / count;
        const avgB = totalB / count;
        const brightness = Math.sqrt(
          0.299 * (avgR * avgR) +
          0.587 * (avgG * avgG) +
          0.114 * (avgB * avgB)
        );
        isLightLogo = brightness > 140;
      }
      
      if (isLightLogo) {
        previewEl.style.backgroundColor = '#09090b'; // bg-zinc-950
        previewEl.style.backgroundImage = 'none';
        previewEl.style.padding = '8px';
      } else {
        previewEl.style.backgroundColor = '#ffffff'; // bg-white
        previewEl.style.backgroundImage = 'none';
        previewEl.style.padding = '8px';
      }
    } catch (e) {
      console.warn("Lỗi phân tích logo, sử dụng nền kẻ ô mặc định:", e);
      previewEl.style.backgroundImage = 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)';
      previewEl.style.backgroundSize = '12px 12px';
      previewEl.style.backgroundColor = 'transparent';
      previewEl.style.padding = '8px';
    }
  };
  img.onerror = function () {
    previewEl.style.backgroundImage = 'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)';
    previewEl.style.backgroundSize = '12px 12px';
    previewEl.style.backgroundColor = 'transparent';
    previewEl.style.padding = '8px';
  };
  img.src = imgUrl;
}
