import { showToast } from '../shared/ui.js';
import { openImagePicker } from '../Products/ImagePicker.js';

function getNormalizedHero(settings) {
  if (!settings.hero_banners || !Array.isArray(settings.hero_banners)) {
    settings.hero_banners = [];
  }
  if (settings.hero_banners.length === 0) {
    settings.hero_banners.push({
      eyebrow: "Pha lê K9 khắc laser 3D",
      title: "Giữ trọn ký ức trong",
      title_accent: "ánh sáng pha lê",
      description: "Chọn mẫu pha lê thật từ dữ liệu sản phẩm, gửi ảnh chân dung và lời nhắn, đội ngũ chế tác sẽ dựng mẫu 3D miễn phí trước khi khắc.",
      title_color: "#143944",
      accent_color: "#3b92ab",
      eyebrow_color: "#3b92ab",
      description_color: "#5b7076",
      primary_label: "Khám phá bộ sưu tập",
      primary_href: "collection.html",
      primary_bg: "#3b92ab",
      primary_color: "#ffffff",
      secondary_label: "Xem quy trình đặt hàng",
      secondary_href: "#process",
      secondary_bg: "#ffffff",
      secondary_color: "#245f70",
      overlay_color: "#ffffff",
      overlay_opacity: 0.95,
      slides: ["public/images/slider_1.png", "public/images/slider_2.png", "public/images/slider_3.png"],
      metrics: [
        { value: "39", label: "biến thể từ Excel" },
        { value: "3D", label: "dựng mẫu miễn phí" },
        { value: "K9", label: "pha lê trong suốt" }
      ]
    });
  }

  const hero = settings.hero_banners[0];
  if (hero.overlay_color === undefined) hero.overlay_color = "#ffffff";
  if (hero.overlay_opacity === undefined) hero.overlay_opacity = 0.95;
  if (!Array.isArray(hero.slides)) {
    hero.slides = ["public/images/slider_1.png"];
  }
  hero.slides = hero.slides.map(s => {
    if (typeof s === 'string') return { img: s, mobile_img: '' };
    return s || { img: '', mobile_img: '' };
  });
  if (!Array.isArray(hero.metrics)) {
    hero.metrics = [
      { value: "", label: "" },
      { value: "", label: "" },
      { value: "", label: "" }
    ];
  }
  return hero;
}

function renderLinkDropdown(id, currentValue) {
  const options = [
    { value: "/", label: "Trang chủ" },
    { value: "collection.html", label: "Bộ sưu tập" },
    { value: "cart.html", label: "Giỏ hàng" },
    { value: "#collections", label: "Khu sản phẩm trang chủ" },
    { value: "#process", label: "Quy trình đặt hàng" },
    { value: "#quality", label: "Cam kết chế tác" },
    { value: "#footer", label: "Liên hệ" }
  ];

  const found = options.some(opt => opt.value === currentValue);
  if (!found && currentValue) {
    options.push({ value: currentValue, label: `Đường dẫn hiện tại: ${currentValue}` });
  }

  return `
    <select id="${id}" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#3b92ab] h-[34px]">
      ${options.map(opt => `<option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label} (${opt.value})</option>`).join('')}
    </select>
  `;
}

export function renderBannerTab(settings) {
  const hero = getNormalizedHero(settings);
  const prefix = window.location.pathname.includes('/dong-ho-a-tuan') 
    ? '/dong-ho-a-tuan' 
    : (window.location.pathname.includes('/sly 2') || window.location.pathname.includes('/sly%202') ? '/sly%202' : '');

  return `
    <div class="space-y-6 font-sans">
      <div class="border-b pb-4">
        <h3 class="text-lg font-bold text-gray-900">Cấu Hình Hero Section Trang Chủ</h3>
        <p class="text-xs text-gray-500 mt-1">Tùy biến hình ảnh slider, nội dung chữ, màu sắc, nút bấm và tấm nền mờ phía sau nội dung Hero.</p>
      </div>

      <!-- Split Layout: Left Form Editor, Right Live Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Form Controls -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Backdrop Overlay Settings -->
          <div class="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-4">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#3b92ab]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
              Thiết Lập Tấm Nền Mờ Nội Dung (Content Backdrop Overlay)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Màu sắc nền mờ (Overlay Color)</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="hero-overlay-color-picker" class="w-10 h-10 border border-gray-300 rounded-lg p-0.5 cursor-pointer bg-white" value="${hero.overlay_color}" />
                  <input type="text" id="hero-overlay-color-input" class="w-full px-3 py-2 border border-gray-350 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-[#3b92ab]" value="${hero.overlay_color}" placeholder="#FFFFFF" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Độ đậm của nền mờ (Opacity: <span id="hero-overlay-opacity-val" class="font-mono text-[#3b92ab] font-bold">${Math.round(hero.overlay_opacity * 100)}%</span>)</label>
                <div class="flex items-center gap-3 py-1">
                  <input type="range" id="hero-overlay-opacity-slider" class="w-full accent-[#3b92ab]" min="0" max="1" step="0.05" value="${hero.overlay_opacity}" />
                </div>
              </div>
            </div>
          </div>

          <!-- Content Typography & Colors -->
          <div class="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-5">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#3b92ab]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              Nội Dung Chữ & Màu Sắc
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Eyebrow Field -->
              <div class="md:col-span-3 space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Dòng nhỏ (Eyebrow)</label>
                <input type="text" id="hero-eyebrow" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#3b92ab]" value="${hero.eyebrow || ''}" placeholder="Nhập chữ nhỏ hoặc để trống để ẩn..." />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Màu Dòng nhỏ</label>
                <div class="flex items-center gap-1.5">
                  <input type="color" id="hero-eyebrow-color" class="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.eyebrow_color || '#3b92ab'}" />
                  <input type="text" id="hero-eyebrow-color-input" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono uppercase focus:outline-none" value="${hero.eyebrow_color || '#3b92ab'}" />
                </div>
              </div>

              <!-- Title Field -->
              <div class="md:col-span-3 space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Tiêu đề chính (Title)</label>
                <input type="text" id="hero-title" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#3b92ab]" value="${hero.title || ''}" placeholder="Nhập tiêu đề chính..." />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Màu Tiêu đề</label>
                <div class="flex items-center gap-1.5">
                  <input type="color" id="hero-title-color" class="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.title_color || '#143944'}" />
                  <input type="text" id="hero-title-color-input" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono uppercase focus:outline-none" value="${hero.title_color || '#143944'}" />
                </div>
              </div>

              <!-- Accent Title Field -->
              <div class="md:col-span-3 space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Chữ nhấn màu (Title Accent)</label>
                <input type="text" id="hero-title-accent" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#3b92ab]" value="${hero.title_accent || ''}" placeholder="Nhập phần chữ muốn đổi màu nổi bật..." />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Màu Chữ nhấn</label>
                <div class="flex items-center gap-1.5">
                  <input type="color" id="hero-accent-color" class="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.accent_color || '#3b92ab'}" />
                  <input type="text" id="hero-accent-color-input" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono uppercase focus:outline-none" value="${hero.accent_color || '#3b92ab'}" />
                </div>
              </div>

              <!-- Description Field -->
              <div class="md:col-span-3 space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Đoạn mô tả (Description)</label>
                <textarea id="hero-description" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#3b92ab] h-20 resize-none" placeholder="Nhập mô tả hoặc để trống để ẩn...">${hero.description || ''}</textarea>
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-600">Màu Mô tả</label>
                <div class="flex items-center gap-1.5">
                  <input type="color" id="hero-description-color" class="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.description_color || '#5b7076'}" />
                  <input type="text" id="hero-description-color-input" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono uppercase focus:outline-none" value="${hero.description_color || '#5b7076'}" />
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons Settings -->
          <div class="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-5">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#3b92ab]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
              Nút Hành Động (CTA Buttons)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Button 1 (Primary) -->
              <div class="border border-gray-200 rounded-lg p-4 bg-white/80 space-y-3">
                <div class="text-xs font-bold text-[#3b92ab] uppercase tracking-wide">Nút chính (Primary Button)</div>
                <div class="space-y-2">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Tên nút bấm</label>
                    <input type="text" id="hero-primary-label" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${hero.primary_label || ''}" placeholder="Nhập tên nút hoặc để trống để ẩn..." />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Đường dẫn liên kết (Href)</label>
                    ${renderLinkDropdown('hero-primary-href', hero.primary_href)}
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Màu nền nút</label>
                      <div class="flex items-center gap-1.5">
                        <input type="color" id="hero-primary-bg" class="w-7 h-7 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.primary_bg || '#3b92ab'}" />
                        <input type="text" id="hero-primary-bg-input" class="w-full px-2 py-1 border border-gray-300 rounded text-[11px] font-mono uppercase" value="${hero.primary_bg || '#3b92ab'}" />
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Màu chữ nút</label>
                      <div class="flex items-center gap-1.5">
                        <input type="color" id="hero-primary-color" class="w-7 h-7 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.primary_color || '#ffffff'}" />
                        <input type="text" id="hero-primary-color-input" class="w-full px-2 py-1 border border-gray-300 rounded text-[11px] font-mono uppercase" value="${hero.primary_color || '#ffffff'}" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Button 2 (Secondary) -->
              <div class="border border-gray-200 rounded-lg p-4 bg-white/80 space-y-3">
                <div class="text-xs font-bold text-gray-600 uppercase tracking-wide">Nút phụ (Secondary Button)</div>
                <div class="space-y-2">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Tên nút bấm</label>
                    <input type="text" id="hero-secondary-label" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${hero.secondary_label || ''}" placeholder="Nhập tên nút hoặc để trống để ẩn..." />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Đường dẫn liên kết (Href)</label>
                    ${renderLinkDropdown('hero-secondary-href', hero.secondary_href)}
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Màu nền nút</label>
                      <div class="flex items-center gap-1.5">
                        <input type="color" id="hero-secondary-bg" class="w-7 h-7 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.secondary_bg || '#ffffff'}" />
                        <input type="text" id="hero-secondary-bg-input" class="w-full px-2 py-1 border border-gray-300 rounded text-[11px] font-mono uppercase" value="${hero.secondary_bg || '#ffffff'}" />
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Màu chữ nút</label>
                      <div class="flex items-center gap-1.5">
                        <input type="color" id="hero-secondary-color" class="w-7 h-7 p-0.5 border border-gray-300 rounded cursor-pointer bg-white" value="${hero.secondary_color || '#245f70'}" />
                        <input type="text" id="hero-secondary-color-input" class="w-full px-2 py-1 border border-gray-300 rounded text-[11px] font-mono uppercase" value="${hero.secondary_color || '#245f70'}" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Home Metrics Settings -->
          <div class="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-4">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#3b92ab]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Chỉ Số Thống Kê Đi Kèm (Metrics)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${hero.metrics.map((metric, i) => `
                <div class="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
                  <div class="text-[10px] font-bold text-[#3b92ab] uppercase">Chỉ số #${i + 1}</div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">
                      <input type="text" class="hero-metric-value w-full px-2 py-1 border border-gray-300 rounded-lg text-xs text-center font-bold" data-index="${i}" value="${metric.value || ''}" placeholder="K9" />
                    </div>
                    <div class="col-span-2">
                      <input type="text" class="hero-metric-label w-full px-2 py-1 border border-gray-300 rounded-lg text-xs" data-index="${i}" value="${metric.label || ''}" placeholder="pha lê" />
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Slide Background Images -->
          <div class="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#3b92ab]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Danh Sách Ảnh Slide Nền
              </h4>
              <button id="add-hero-slide" class="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Thêm Slide
              </button>
            </div>

            <div class="space-y-3" id="hero-slides-list">
              ${hero.slides.length === 0 
                ? `<div class="text-center py-8 text-gray-400 text-xs">Chưa có ảnh slide nào. Hãy bấm "Thêm Slide".</div>` 
                : hero.slides.map((slideObj, i) => {
                  const desktopUrl = slideObj.img || '';
                  const mobileUrl = slideObj.mobile_img || '';
                  return `
                  <div class="flex flex-col gap-4 border border-gray-200 rounded-xl p-4 bg-white relative group" data-slide-index="${i}">
                    
                    <!-- Top Header Row -->
                    <div class="flex items-center justify-between border-b pb-2 mb-2">
                      <span class="text-xs font-bold text-gray-700">Slide #${i + 1}</span>
                      
                      <!-- Reordering & Delete Controls -->
                      <div class="flex gap-1 z-10">
                        <button class="move-up-slide-btn p-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded transition-colors ${i === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Di chuyển lên" ${i === 0 ? 'disabled' : ''}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                        <button class="move-down-slide-btn p-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded transition-colors ${i === hero.slides.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" title="Di chuyển xuống" ${i === hero.slides.length - 1 ? 'disabled' : ''}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        <button class="delete-slide-btn p-1.5 border border-red-100 bg-white hover:bg-red-50 text-red-600 rounded transition-colors" title="Xóa slide">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                        </button>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Desktop Image Field -->
                      <div class="flex items-center gap-3">
                        <div class="w-20 h-12 border border-gray-200 rounded bg-zinc-900 relative overflow-hidden flex items-center justify-center flex-shrink-0 group/desktop">
                          ${desktopUrl ? `
                            <img class="slide-desktop-image-preview w-full h-full object-cover opacity-80 cursor-pointer hover:opacity-60 transition-all" src="${desktopUrl}" title="Bấm để tải ảnh mới" />
                            <button class="upload-slide-desktop-btn absolute inset-0 bg-black/40 text-white opacity-0 group-hover/desktop:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-bold uppercase" title="Chọn ảnh mới">
                              Đổi ảnh
                            </button>
                          ` : `
                            <button class="upload-slide-desktop-btn absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white transition-colors bg-zinc-900 text-[8px] font-bold uppercase">
                              Chọn ảnh
                            </button>
                          `}
                        </div>
                        <div class="flex-1 min-w-0">
                          <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Desktop Image URL</label>
                          <div class="flex gap-1.5">
                            <input type="text" class="slide-img-url w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none" value="${desktopUrl}" placeholder="Đường dẫn..." />
                            <button class="upload-slide-desktop-btn px-2 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs rounded font-semibold transition-colors">Tải</button>
                          </div>
                        </div>
                      </div>

                      <!-- Mobile Image Field -->
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 border border-gray-200 rounded bg-zinc-900 relative overflow-hidden flex items-center justify-center flex-shrink-0 group/mobile">
                          ${mobileUrl ? `
                            <img class="slide-mobile-image-preview w-full h-full object-cover opacity-80 cursor-pointer hover:opacity-60 transition-all" src="${mobileUrl}" title="Bấm để tải ảnh mới" />
                            <button class="upload-slide-mobile-btn absolute inset-0 bg-black/40 text-white opacity-0 group-hover/mobile:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-bold uppercase" title="Chọn ảnh mới">
                              Đổi ảnh
                            </button>
                          ` : `
                            <button class="upload-slide-mobile-btn absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white transition-colors bg-zinc-900 text-[8px] font-bold uppercase">
                              Chọn ảnh
                            </button>
                          `}
                        </div>
                        <div class="flex-1 min-w-0">
                          <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Mobile Image URL</label>
                          <div class="flex gap-1.5">
                            <input type="text" class="slide-mobile-img-url w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none" value="${mobileUrl}" placeholder="Đường dẫn..." />
                            <button class="upload-slide-mobile-btn px-2 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs rounded font-semibold transition-colors">Tải</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  `;
                }).join('')
              }
            </div>
          </div>

        </div>

        <!-- Right Side: Real-time Live Preview Mockup -->
        <div class="lg:col-span-5 flex flex-col justify-start space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">XEM TRƯỚC GIAO DIỆN THỰC TẾ</h4>
            <button id="btn-view-preview-site" class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow transition duration-200 border-none cursor-pointer flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Xem thực tế (Tab mới)
            </button>
          </div>
          
          <div class="border border-gray-200 rounded-xl overflow-hidden shadow-md bg-white select-none relative" style="height: 580px; aspect-ratio: 9/16; margin: 0 auto; width: 100%;">
            <iframe id="mockup-iframe" src="${prefix}/index.html?preview=true" class="w-full h-full border-none m-0 p-0" style="display: block; width: 100%; height: 100%;"></iframe>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindBannerTab(container, settings, token, API_BASE, ctx) {
  const hero = getNormalizedHero(settings);
  const prefix = window.location.pathname.includes('/dong-ho-a-tuan') 
    ? '/dong-ho-a-tuan' 
    : (window.location.pathname.includes('/sly 2') || window.location.pathname.includes('/sly%202') ? '/sly%202' : '');

  // Helper to trigger live preview reload
  const triggerUpdate = () => {
    ctx.saveSettingsDraft();
    ctx.updateMockupColors();
  };

  // Bind View Preview Site Button
  const previewSiteBtn = container.querySelector('#btn-view-preview-site');
  if (previewSiteBtn) {
    previewSiteBtn.addEventListener('click', () => {
      window.open(`${prefix}/index.html?preview=true`, '_blank');
    });
  }

  // Bind Overlay Backdrop settings
  const colorPicker = container.querySelector('#hero-overlay-color-picker');
  const colorInput = container.querySelector('#hero-overlay-color-input');
  const opacitySlider = container.querySelector('#hero-overlay-opacity-slider');
  const opacityVal = container.querySelector('#hero-overlay-opacity-val');

  if (colorPicker && colorInput) {
    colorPicker.addEventListener('input', (e) => {
      hero.overlay_color = e.target.value;
      colorInput.value = e.target.value;
      triggerUpdate();
    });
    colorInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        hero.overlay_color = val;
        colorPicker.value = val;
        triggerUpdate();
      }
    });
  }

  if (opacitySlider && opacityVal) {
    opacitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      hero.overlay_opacity = val;
      opacityVal.textContent = `${Math.round(val * 100)}%`;
      triggerUpdate();
    });
  }

  // Bind Texts and Color pickers
  const bindFieldWithColor = (fieldId, colorId, inputColorId, propName, colorPropName) => {
    const field = container.querySelector(`#${fieldId}`);
    const color = container.querySelector(`#${colorId}`);
    const inputColor = container.querySelector(`#${inputColorId}`);

    if (field) {
      field.addEventListener('input', (e) => {
        hero[propName] = e.target.value.trim();
        triggerUpdate();
      });
    }

    if (color && inputColor) {
      color.addEventListener('input', (e) => {
        hero[colorPropName] = e.target.value;
        inputColor.value = e.target.value;
        triggerUpdate();
      });
      inputColor.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          hero[colorPropName] = val;
          color.value = val;
          triggerUpdate();
        }
      });
    }
  };

  bindFieldWithColor('hero-eyebrow', 'hero-eyebrow-color', 'hero-eyebrow-color-input', 'eyebrow', 'eyebrow_color');
  bindFieldWithColor('hero-title', 'hero-title-color', 'hero-title-color-input', 'title', 'title_color');
  bindFieldWithColor('hero-title-accent', 'hero-accent-color', 'hero-accent-color-input', 'title_accent', 'accent_color');
  bindFieldWithColor('hero-description', 'hero-description-color', 'hero-description-color-input', 'description', 'description_color');

  // Bind CTA Buttons
  const bindButtonFields = (prefix, labelProp, hrefProp, bgProp, colorProp) => {
    const labelInput = container.querySelector(`#hero-${prefix}-label`);
    const hrefInput = container.querySelector(`#hero-${prefix}-href`);
    const bgPicker = container.querySelector(`#hero-${prefix}-bg`);
    const bgVal = container.querySelector(`#hero-${prefix}-bg-input`);
    const colorPicker = container.querySelector(`#hero-${prefix}-color`);
    const colorVal = container.querySelector(`#hero-${prefix}-color-input`);

    labelInput?.addEventListener('input', (e) => {
      hero[labelProp] = e.target.value.trim();
      triggerUpdate();
    });

    hrefInput?.addEventListener('change', (e) => {
      hero[hrefProp] = e.target.value.trim();
      triggerUpdate();
    });

    if (bgPicker && bgVal) {
      bgPicker.addEventListener('input', (e) => {
        hero[bgProp] = e.target.value;
        bgVal.value = e.target.value;
        triggerUpdate();
      });
      bgVal.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          hero[bgProp] = val;
          bgPicker.value = val;
          triggerUpdate();
        }
      });
    }

    if (colorPicker && colorVal) {
      colorPicker.addEventListener('input', (e) => {
        hero[colorProp] = e.target.value;
        colorVal.value = e.target.value;
        triggerUpdate();
      });
      colorVal.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(val)) {
          hero[colorProp] = val;
          colorPicker.value = val;
          triggerUpdate();
        }
      });
    }
  };

  bindButtonFields('primary', 'primary_label', 'primary_href', 'primary_bg', 'primary_color');
  bindButtonFields('secondary', 'secondary_label', 'secondary_href', 'secondary_bg', 'secondary_color');

  // Bind Metrics inputs
  container.querySelectorAll('.hero-metric-value').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      hero.metrics[idx].value = e.target.value.trim();
      triggerUpdate();
    });
  });

  container.querySelectorAll('.hero-metric-label').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      hero.metrics[idx].label = e.target.value.trim();
      triggerUpdate();
    });
  });

  // Bind Background Slides items
  const slidesList = container.querySelector('#hero-slides-list');
  slidesList?.querySelectorAll('[data-slide-index]').forEach(row => {
    const index = parseInt(row.dataset.slideIndex, 10);

    // 1. Text input url edit (Desktop)
    row.querySelector('.slide-img-url')?.addEventListener('input', (e) => {
      hero.slides[index].img = e.target.value.trim();
      const preview = row.querySelector('.slide-desktop-image-preview');
      if (preview) preview.src = e.target.value.trim();
      triggerUpdate();
    });

    // 2. Text input url edit (Mobile)
    row.querySelector('.slide-mobile-img-url')?.addEventListener('input', (e) => {
      hero.slides[index].mobile_img = e.target.value.trim();
      const preview = row.querySelector('.slide-mobile-image-preview');
      if (preview) preview.src = e.target.value.trim();
      triggerUpdate();
    });

    // 3. Image Selector upload trigger (Desktop)
    row.querySelectorAll('.upload-slide-desktop-btn, .slide-desktop-image-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openImagePicker((url) => {
          hero.slides[index].img = url;
          ctx.renderUI();
          triggerUpdate();
        }, false, hero.slides[index].img);
      });
    });

    // 4. Image Selector upload trigger (Mobile)
    row.querySelectorAll('.upload-slide-mobile-btn, .slide-mobile-image-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openImagePicker((url) => {
          hero.slides[index].mobile_img = url;
          ctx.renderUI();
          triggerUpdate();
        }, false, hero.slides[index].mobile_img);
      });
    });

    // 5. Move up/down/delete actions
    row.querySelector('.move-up-slide-btn')?.addEventListener('click', () => {
      if (index === 0) return;
      const temp = hero.slides[index];
      hero.slides[index] = hero.slides[index - 1];
      hero.slides[index - 1] = temp;
      showToast(`Đã chuyển Slide #${index + 1} lên vị trí #${index}`, 'success');
      ctx.renderUI();
      triggerUpdate();
    });

    row.querySelector('.move-down-slide-btn')?.addEventListener('click', () => {
      if (index === hero.slides.length - 1) return;
      const temp = hero.slides[index];
      hero.slides[index] = hero.slides[index + 1];
      hero.slides[index + 1] = temp;
      showToast(`Đã chuyển Slide #${index + 1} xuống vị trí #${index + 2}`, 'success');
      ctx.renderUI();
      triggerUpdate();
    });

    row.querySelector('.delete-slide-btn')?.addEventListener('click', () => {
      hero.slides.splice(index, 1);
      showToast('Đã xóa slide khỏi danh sách.', 'info');
      ctx.renderUI();
      triggerUpdate();
    });
  });

  // Add Background Slide button
  container.querySelector('#add-hero-slide')?.addEventListener('click', () => {
    hero.slides.push({ img: 'public/images/slider_1.png', mobile_img: '' });
    showToast('Đã thêm hình nền slide mới.', 'success');
    ctx.renderUI();
    triggerUpdate();
  });
}
