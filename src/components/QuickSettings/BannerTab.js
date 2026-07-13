import { API_BASE } from '../../services/config.js';
import { showToast } from '../../pages/Admin/shared/ui.js';
import { openImagePicker } from '../../pages/Admin/Products/ImagePicker.js';

export function renderBannerForm(settings, selectedSlideIndex) {
  const banners = settings.hero_banners || [];
  if (banners.length === 0) {
    return `
      <div class="space-y-4">
        <div class="text-center py-6 text-gray-400">Không có dữ liệu banner để chỉnh sửa.</div>
        <div class="flex justify-center">
          <button id="quick-add-slide" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 border-0 cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm Slide Mới
          </button>
        </div>
      </div>
    `;
  }

  const slide = banners[selectedSlideIndex] || banners[0];

  return `
    <div class="space-y-4">
      <!-- Slide selector & Actions -->
      <div class="flex items-end gap-3">
        <div class="flex-1">
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Chọn Slide Banner cần sửa</label>
          <select id="quick-slide-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] font-semibold text-gray-700 bg-white">
            ${banners.map((_, i) => `
              <option value="${i}" ${i === selectedSlideIndex ? 'selected' : ''}>Slide Banner #${i + 1} (${banners[i].title || 'Chưa có tiêu đề'})</option>
            `).join('')}
          </select>
        </div>
        <div class="flex gap-1.5">
          <button id="quick-move-up-slide" class="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold h-10 w-9 rounded-lg transition-colors flex items-center justify-center cursor-pointer bg-white ${selectedSlideIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Di chuyển lên" ${selectedSlideIndex === 0 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button id="quick-move-down-slide" class="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold h-10 w-9 rounded-lg transition-colors flex items-center justify-center cursor-pointer bg-white ${selectedSlideIndex === banners.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" title="Di chuyển xuống" ${selectedSlideIndex === banners.length - 1 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button id="quick-add-slide" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold h-10 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer border-0" title="Thêm slide mới">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm
          </button>
          <button id="quick-delete-slide" class="border border-red-200 hover:bg-red-50 text-red-600 font-semibold h-10 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer bg-white" title="Xóa slide hiện tại">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Xóa
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
          <input type="text" id="quick-slide-title" value="${slide.title || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mô tả phụ (Subtitle)</label>
          <input type="text" id="quick-slide-subtitle" value="${slide.subtitle || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Liên kết nút bấm (CTA Link)</label>
          <input type="text" id="quick-slide-ctaHref" value="${slide.ctaHref || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hình ảnh nền banner (Desktop)</label>
          <div class="flex items-center gap-3">
            <div class="w-20 h-12 border rounded-lg bg-zinc-950 overflow-hidden relative">
              <img id="quick-slide-preview-img" src="${slide.img || ''}" class="absolute top-1/2 left-1/2 max-w-none max-h-none opacity-70 origin-center" style="min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate3d(calc(-50% + ${slide.panX || 0}%), calc(-50% + ${slide.panY || 0}%), 0) scale(${slide.zoom || 1});" />
            </div>
            <div class="flex-1 space-y-1.5">
              <input type="file" id="quick-slide-image-file" accept="image/*" class="hidden" />
              <button id="quick-upload-slide-img" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors border-0 cursor-pointer">Tải ảnh lên</button>
              <input type="text" id="quick-slide-img-url" value="${slide.img || ''}" class="w-full px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-500 focus:outline-none mt-1" />
            </div>
          </div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hình ảnh nền banner (Mobile)</label>
          <div class="flex items-center gap-3">
            <div class="w-12 h-16 border rounded-lg bg-zinc-950 overflow-hidden relative">
              <img id="quick-slide-preview-mobile-img" src="${slide.mobile_img || slide.img || ''}" class="absolute top-1/2 left-1/2 max-w-none max-h-none opacity-70 origin-center" style="min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate3d(calc(-50% + ${slide.mobile_panX || 0}%), calc(-50% + ${slide.mobile_panY || 0}%), 0) scale(${slide.mobile_zoom || 1});" />
            </div>
            <div class="flex-1 space-y-1.5">
              <input type="file" id="quick-slide-mobile-image-file" accept="image/*" class="hidden" />
              <button id="quick-upload-slide-mobile-img" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors border-0 cursor-pointer">Tải ảnh lên</button>
              <input type="text" id="quick-slide-mobile-img-url" value="${slide.mobile_img || ''}" class="w-full px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-500 focus:outline-none mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindBannerEvents(modalEl, settings, renderModal, token, selectedSlideIndex, setSlideIndex) {
  // Move slide up
  modalEl.querySelector('#quick-move-up-slide')?.addEventListener('click', () => {
    if (selectedSlideIndex === 0) return;
    const temp = settings.hero_banners[selectedSlideIndex];
    settings.hero_banners[selectedSlideIndex] = settings.hero_banners[selectedSlideIndex - 1];
    settings.hero_banners[selectedSlideIndex - 1] = temp;
    setSlideIndex(selectedSlideIndex - 1);
    showToast('Đã di chuyển slide lên.', 'success');
    renderModal();
  });

  // Move slide down
  modalEl.querySelector('#quick-move-down-slide')?.addEventListener('click', () => {
    if (selectedSlideIndex === settings.hero_banners.length - 1) return;
    const temp = settings.hero_banners[selectedSlideIndex];
    settings.hero_banners[selectedSlideIndex] = settings.hero_banners[selectedSlideIndex + 1];
    settings.hero_banners[selectedSlideIndex + 1] = temp;
    setSlideIndex(selectedSlideIndex + 1);
    showToast('Đã di chuyển slide xuống.', 'success');
    renderModal();
  });

  // Add slide
  modalEl.querySelector('#quick-add-slide')?.addEventListener('click', () => {
    settings.hero_banners.push({
      img: '../backend/public/image/banner/sale_online_w.webp',
      mobile_img: '../backend/public/image/banner/sale_online_m.webp',
      title: `${settings.brand_name || 'Mắt Bão WS'} — Only Sell Online`,
      subtitle: 'Thời trang thiết kế độc quyền. Only Sell Online.',
      ctaHref: '/products'
    });
    setSlideIndex(settings.hero_banners.length - 1);
    showToast('Đã thêm một slide mới ở cuối.', 'success');
    renderModal();
  });

  // Delete slide
  modalEl.querySelector('#quick-delete-slide')?.addEventListener('click', () => {
    if (settings.hero_banners.length <= 1) {
      showToast('Bạn phải giữ lại ít nhất 1 slide banner.', 'warning');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa Slide #${selectedSlideIndex + 1}?`)) return;
    settings.hero_banners.splice(selectedSlideIndex, 1);
    setSlideIndex(Math.max(0, selectedSlideIndex - 1));
    showToast('Đã xóa slide banner.', 'info');
    renderModal();
  });

  const select = modalEl.querySelector('#quick-slide-select');
  if (select) {
    select.addEventListener('change', (e) => {
      setSlideIndex(parseInt(e.target.value, 10));
      renderModal();
    });
  }

  const slide = settings.hero_banners[selectedSlideIndex];
  if (slide) {
    modalEl.querySelector('#quick-slide-title')?.addEventListener('input', (e) => {
      slide.title = e.target.value.trim();
    });
    modalEl.querySelector('#quick-slide-subtitle')?.addEventListener('input', (e) => {
      slide.subtitle = e.target.value.trim();
    });
    modalEl.querySelector('#quick-slide-ctaHref')?.addEventListener('input', (e) => {
      slide.ctaHref = e.target.value.trim();
    });
    modalEl.querySelector('#quick-slide-img-url')?.addEventListener('input', (e) => {
      slide.img = e.target.value.trim();
      const preview = modalEl.querySelector('#quick-slide-preview-img');
      if (preview) preview.src = e.target.value.trim();
    });
    modalEl.querySelector('#quick-slide-mobile-img-url')?.addEventListener('input', (e) => {
      slide.mobile_img = e.target.value.trim();
      const preview = modalEl.querySelector('#quick-slide-preview-mobile-img');
      if (preview) preview.src = e.target.value.trim();
    });

    // Slide desktop image upload
    const uploadSlideImgBtn = modalEl.querySelector('#quick-upload-slide-img');

    uploadSlideImgBtn?.addEventListener('click', () => {
      openImagePicker((url) => {
        slide.img = url;
        slide.zoom = 1.0;
        slide.panX = 0;
        slide.panY = 0;
        showToast('Đã chọn ảnh slide thành công!', 'success');
        renderModal();
      }, false, slide.img);
    });

    // Slide mobile image upload
    const uploadSlideMobileImgBtn = modalEl.querySelector('#quick-upload-slide-mobile-img');

    uploadSlideMobileImgBtn?.addEventListener('click', () => {
      openImagePicker((url) => {
        slide.mobile_img = url;
        slide.mobile_zoom = 1.0;
        slide.mobile_panX = 0;
        slide.mobile_panY = 0;
        showToast('Đã chọn ảnh slide di động thành công!', 'success');
        renderModal();
      }, false, slide.mobile_img || slide.img);
    });
  }
}
