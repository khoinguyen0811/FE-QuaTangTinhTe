import { showToast } from '../shared/ui.js';

export function renderBrandTab(settings) {
  return `
    <div class="space-y-8">
      <h3 class="text-base font-bold text-gray-900 border-b pb-3">Cấu Hình Thương Hiệu & Logo</h3>
      <div class="max-w-2xl space-y-6">
        <!-- Brand Settings Form -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tên thương hiệu</label>
          <input type="text" id="setting-brand-name" value="${settings.brand_name}" 
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 focus:border-[#C9A84C]" />
        </div>
        
        <!-- Navbar Logo Section -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Logo thanh điều hướng (Logo trên Nav)</label>
          <div class="flex items-start gap-4">
            <div id="logo-preview-box" class="w-20 h-20 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
              ${settings.logo_url 
                ? `<img id="admin-logo-img" src="${settings.logo_url}" class="max-h-full max-w-full object-contain" />` 
                : `<span class="text-xs text-gray-400">Trống</span>`
              }
            </div>
            <div class="flex-1 space-y-2">
              <input type="file" id="logo-file-input" accept="image/*" class="hidden" />
              <div class="flex gap-2">
                <button id="upload-logo-trigger" class="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors">Tải ảnh lên</button>
                ${settings.logo_url ? `<button id="delete-logo-btn" class="border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs px-3 py-2 rounded-lg transition-colors">Xóa logo</button>` : ''}
              </div>
              <p class="text-[11px] text-gray-400">Khuyên dùng logo dạng nằm ngang, kích cỡ tối đa 3MB, nền trong suốt (PNG).</p>
            </div>
          </div>
        </div>

        <!-- Favicon Section -->
        <div class="border-t border-gray-100 pt-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Logo Tab trình duyệt (Favicon - Web Logo)</label>
          <div class="flex items-start gap-4">
            <div id="favicon-preview-box" class="w-20 h-20 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
              ${settings.favicon_url 
                ? `<img src="${settings.favicon_url}" class="w-10 h-10 object-contain" />` 
                : `<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
              }
            </div>
            <div class="flex-1 space-y-2">
              <input type="file" id="favicon-file-input" accept="image/*" class="hidden" />
              <div class="flex gap-2">
                <button id="upload-favicon-trigger" class="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors">Tải ảnh lên</button>
                ${settings.favicon_url ? `<button id="delete-favicon-btn" class="border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs px-3 py-2 rounded-lg transition-colors">Xóa Favicon</button>` : ''}
              </div>
              <p class="text-[11px] text-gray-400">Favicon là biểu tượng nhỏ xuất hiện ở tiêu đề trình duyệt. Tỷ lệ khuyên dùng 1:1 (Ví dụ: 32x32 hoặc 48x48).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindBrandTab(container, settings, token, API_BASE, ctx) {
  const logoPreview = container.querySelector('#logo-preview-box');
  if (settings.logo_url && logoPreview) {
    applyContrastBackground(settings.logo_url, logoPreview);
  }

  const brandInput = container.querySelector('#setting-brand-name');
  if (brandInput) {
    brandInput.addEventListener('input', (e) => {
      settings.brand_name = e.target.value.trim();
    });
  }

  // Upload Logo Action
  const uploadTrigger = container.querySelector('#upload-logo-trigger');
  const fileInput = container.querySelector('#logo-file-input');
  const deleteLogoBtn = container.querySelector('#delete-logo-btn');

  uploadTrigger?.addEventListener('click', () => fileInput.click());

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    uploadTrigger.textContent = 'Đang tải lên...';
    uploadTrigger.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/upload-logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        settings.logo_url = data.data.url;
        showToast('Tải lên ảnh logo thành công và lưu cấu hình!', 'success');
        ctx.loadData(); // Reload all info
      } else {
        showToast(data.error || 'Lỗi tải logo.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối khi tải logo.', 'error');
    } finally {
      uploadTrigger.textContent = 'Tải ảnh lên';
      uploadTrigger.disabled = false;
    }
  });

  // Delete logo immediately
  deleteLogoBtn?.addEventListener('click', async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa logo và chuyển về logo chữ mặc định?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ logo_url: '' })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Đã xóa logo thành công.', 'success');
        ctx.loadData();
      } else {
        showToast(json.error || 'Lỗi khi xóa logo.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi xóa logo.', 'error');
    }
  });

  // Upload Favicon Action
  const uploadFaviconTrigger = container.querySelector('#upload-favicon-trigger');
  const faviconFileInput = container.querySelector('#favicon-file-input');
  const deleteFaviconBtn = container.querySelector('#delete-favicon-btn');

  uploadFaviconTrigger?.addEventListener('click', () => faviconFileInput.click());

  faviconFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('favicon', file);

    uploadFaviconTrigger.textContent = 'Đang tải lên...';
    uploadFaviconTrigger.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/upload-favicon`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        settings.favicon_url = data.data.url;
        showToast('Tải lên ảnh favicon thành công và lưu cấu hình!', 'success');
        ctx.loadData(); // Reload all info
      } else {
        showToast(data.error || 'Lỗi tải favicon.', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối khi tải favicon.', 'error');
    } finally {
      uploadFaviconTrigger.textContent = 'Tải ảnh lên';
      uploadFaviconTrigger.disabled = false;
    }
  });

  // Delete favicon immediately
  deleteFaviconBtn?.addEventListener('click', async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa favicon và khôi phục về mặc định?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ favicon_url: '' })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Đã xóa favicon thành công.', 'success');
        ctx.loadData();
      } else {
        showToast(json.error || 'Lỗi khi xóa favicon.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi xóa favicon.', 'error');
    }
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
