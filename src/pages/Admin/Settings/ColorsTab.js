import { showToast } from '../shared/ui.js';
import { API_BASE } from '../../../services/config.js';

const fontSansList = [
  'Montserrat', 
  'Inter', 
  'Roboto', 
  'Outfit', 
  'Open Sans', 
  'Be Vietnam Pro',
  'Poppins', 
  'Jost', 
  'Urbanist', 
  'Lexend', 
  'Manrope',
  'Lato', 
  'Raleway', 
  'Nunito', 
  'Quicksand', 
  'Oswald', 
  'Syne',
  'Source Sans 3'
];
const fontSerifList = [
  'Cormorant Garamond', 
  'Playfair Display', 
  'Lora',
  'Merriweather', 
  'Cinzel', 
  'EB Garamond', 
  'Prata',
  'Fraunces', 
  'Cardo', 
  'Noto Serif',
  'Quicksand'
];

const layoutPresetKeys = [
  'hero_banners',
  'navigation_menu',
  'home_sections',
  'policies',
  'policies_menu',
  'contact_channels'
];

function cloneSettingValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function buildThemePreset(settings, localColors, localTypography, name) {
  const preset = {
    id: Date.now(),
    name,
    created_at: new Date().toLocaleString('vi-VN'),
    version: 2,
    scope: 'full_layout',
    theme_colors: { ...localColors },
    theme_typography: { ...localTypography },
    layout: {}
  };

  layoutPresetKeys.forEach((key) => {
    if (settings[key] !== undefined) {
      preset.layout[key] = cloneSettingValue(settings[key]);
    }
  });

  return preset;
}

function applyThemePreset(settings, localColors, localTypography, preset) {
  Object.assign(localColors, preset.theme_colors || {});
  settings.theme_colors = { ...localColors };

  Object.assign(localTypography, preset.theme_typography || {});
  settings.theme_typography = { ...localTypography };

  const layout = preset.layout || {};
  layoutPresetKeys.forEach((key) => {
    if (layout[key] !== undefined) {
      settings[key] = cloneSettingValue(layout[key]);
    }
  });
}

export function renderColorsTab(settings, localColors, localTypography) {
  const prefix = window.location.pathname.includes('/dong-ho-a-tuan') 
    ? '/dong-ho-a-tuan' 
    : (window.location.pathname.includes('/sly 2') || window.location.pathname.includes('/sly%202') ? '/sly%202' : '');

  const defaultColors = {
    'brand-900': '#143944',
    'brand-800': '#245f70',
    'brand-700': '#3b92ab',
    'brand-100': '#bce6ec',
    ink: '#102126',
    muted: '#5b7076',
    surface: '#ffffff',
    'surface-soft': '#f3fbfc',
  };

  const colorFields = [
    { key: 'brand-700', label: 'Màu thương hiệu chính', desc: 'Dùng cho các nút bấm chính cần gây chú ý, tiêu đề phụ, các đường viền hiệu ứng.' },
    { key: 'brand-800', label: 'Màu thương hiệu trung bình', desc: 'Dùng cho các nút bấm hoặc biểu tượng phụ khi hover.' },
    { key: 'brand-900', label: 'Màu thương hiệu tối', desc: 'Dùng cho các tiêu đề chính, các phần nền tối hoặc chân trang đậm.' },
    { key: 'brand-100', label: 'Màu thương hiệu sáng', desc: 'Dùng làm màu nền phụ nhẹ cho các thẻ nhãn hoặc các khối thông tin.' },
    { key: 'ink', label: 'Màu chữ chính', desc: 'Màu sắc chủ đạo cho toàn bộ chữ viết và tiêu đề chính trên trang.' },
    { key: 'muted', label: 'Màu chữ phụ', desc: 'Màu chữ mô tả phụ hoặc thông tin chi tiết ít nổi bật hơn.' },
    { key: 'surface', label: 'Màu nền chính (Surface)', desc: 'Màu nền chủ đạo của toàn bộ trang web (phía sau các sản phẩm).' },
    { key: 'surface-soft', label: 'Màu nền phụ (Surface Soft)', desc: 'Màu nền của các phần nội dung xen kẽ như chân trang hoặc biểu mẫu.' },
  ];

  // Check if current fonts are custom
  const isCustomSans = localTypography.font_sans && !fontSansList.includes(localTypography.font_sans);
  const isCustomSerif = localTypography.font_serif && !fontSerifList.includes(localTypography.font_serif);

  const presets = settings.theme_presets || [];

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 class="text-base font-bold text-gray-900">Bảng Màu Sắc & Chữ Viết</h3>
          <p class="text-xs text-gray-500 mt-0.5">Thay đổi màu sắc, font chữ và kích thước toàn trang. Nhìn mockup bên phải hoặc mở Xem Trước Thực Tế để kiểm tra.</p>
        </div>
        <div class="flex gap-2">
          <button id="save-theme-preset" class="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border-none cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            Lưu Template này
          </button>
          <button id="reset-colors-default" class="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer bg-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 9.5 2.8L2.5 8m0 4.5A10 10 0 0 0 14.5 21.2l7-5.2"/></svg>
            Khôi phục mặc định
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Color Pickers & Typography & Presets -->
        <div class="lg:col-span-7 space-y-6 max-h-[550px] overflow-y-auto pr-2" id="color-pickers-container">
          
          <!-- Màu Sắc Giao Diện -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-[#C9A84C] uppercase tracking-wider border-b pb-1">Màu Sắc Giao Diện</h4>
            <div class="space-y-3">
              ${colorFields.map(field => `
                <div class="flex items-center gap-4 bg-gray-50 border rounded-xl p-3 hover:bg-gray-100/50 transition-colors">
                  <input type="color" data-color-key="${field.key}" value="${localColors[field.key] || defaultColors[field.key]}" 
                    class="color-picker-input w-12 h-10 border-0 rounded-lg cursor-pointer bg-transparent focus:outline-none" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-gray-800">${field.label}</span>
                      <span class="text-[10px] font-mono text-gray-400 uppercase select-all">${localColors[field.key] || defaultColors[field.key]}</span>
                    </div>
                    <p class="text-[11px] text-gray-500 mt-0.5 leading-relaxed">${field.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Font Chữ & Kích Thước -->
          <div class="space-y-4 pt-2 border-t border-gray-100">
            <h4 class="text-xs font-bold text-[#C9A84C] uppercase tracking-wider border-b pb-1">Font Chữ & Kích Thước</h4>
            <div class="space-y-4">
              
              <!-- Font Sans -->
              <div class="bg-gray-50 border rounded-xl p-3.5 space-y-3">
                <label class="block text-xs font-bold text-gray-800">Font chữ chính (Body Font)</label>
                
                <div class="relative font-combobox" id="combo-font-sans">
                  <div class="relative flex items-center">
                    <input type="text" id="typo-font-sans-input" 
                           value="${localTypography.font_sans || 'Montserrat'}" 
                           class="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium" 
                           placeholder="Chọn hoặc gõ tên font (ví dụ: Inter, Playwrite AU VIC Guides)..." autocomplete="off" />
                    <button type="button" class="combo-toggle-btn absolute right-2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-0 cursor-pointer flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                  <div class="combo-dropdown absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg hidden">
                    ${fontSansList.map(font => `
                      <div class="combo-option px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer text-gray-700 font-medium" data-value="${font}">${font}</div>
                    `).join('')}
                  </div>
                </div>
                
                <div id="typo-sans-css-wrapper" class="space-y-2 ${isCustomSans ? '' : 'hidden'}">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Link chi tiết Google Fonts (Tùy chọn)</label>
                  <input type="text" id="typo-font-sans-custom-css" value="${localTypography.custom_font_css || ''}" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-[10px] focus:outline-none text-zinc-500 font-mono" placeholder="Ví dụ: https://fonts.google.com/specimen/Google+Sans" />
                  <div class="text-[9px] text-[#C9A84C] font-semibold flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>Lấy link tại <a href="https://fonts.google.com" target="_blank" class="text-[#C9A84C] underline hover:text-[#C9A84C]/80 font-bold inline-flex items-center gap-0.5">Google Fonts <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg></a></span>
                  </div>
                </div>

                <!-- Tải file font Sans -->
                <div class="space-y-1.5 pt-1 border-t border-dashed border-gray-200">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase">Hoặc tải file font từ máy tính (.ttf, .otf, .woff, .woff2)</label>
                  <div class="flex items-center gap-2">
                    <input type="file" class="font-file-upload-input hidden" accept=".ttf,.otf,.woff,.woff2" data-font-type="sans" id="upload-sans-file" />
                    <button type="button" class="btn-trigger-upload-font border border-dashed border-gray-300 hover:border-[#C9A84C] hover:bg-gray-50 text-gray-600 rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center gap-1 cursor-pointer bg-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Chọn file font...
                    </button>
                    <span id="sans-filename-display" class="uploaded-font-filename text-[10px] text-gray-400 italic truncate max-w-[150px]">
                      ${localTypography.custom_font_file_url ? localTypography.custom_font_file_url.split('/').pop() : 'Chưa tải lên file nào'}
                    </span>
                    <button type="button" id="btn-delete-sans-file" class="btn-clear-uploaded-font text-red-500 hover:text-red-700 bg-transparent border-none p-0 cursor-pointer text-[10px] font-semibold ${localTypography.custom_font_file_url ? '' : 'hidden'}" data-font-type="sans">Xóa</button>
                  </div>
                </div>

                <p class="text-[10px] text-gray-500">Dùng cho toàn bộ văn bản chính, nhãn nút bấm, mô tả sản phẩm.</p>
              </div>

              <!-- Font Serif -->
              <div class="bg-gray-50 border rounded-xl p-3.5 space-y-3">
                <label class="block text-xs font-bold text-gray-800">Font tiêu đề (Heading Font)</label>

                <div class="relative font-combobox" id="combo-font-serif">
                  <div class="relative flex items-center">
                    <input type="text" id="typo-font-serif-input" 
                           value="${localTypography.font_serif || 'Cormorant Garamond'}" 
                           class="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium" 
                           placeholder="Chọn hoặc gõ tên font (ví dụ: Playfair Display, Lora)..." autocomplete="off" />
                    <button type="button" class="combo-toggle-btn absolute right-2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-0 cursor-pointer flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                  <div class="combo-dropdown absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg hidden">
                    ${fontSerifList.map(font => `
                      <div class="combo-option px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer text-gray-700 font-medium" data-value="${font}">${font}</div>
                    `).join('')}
                  </div>
                </div>

                <div id="typo-serif-css-wrapper" class="space-y-2 ${isCustomSerif ? '' : 'hidden'}">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase mb-1">Link chi tiết Google Fonts (Tùy chọn)</label>
                  <input type="text" id="typo-font-serif-custom-css" value="${localTypography.custom_font_css || ''}" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-[10px] focus:outline-none text-zinc-500 font-mono" placeholder="Ví dụ: https://fonts.google.com/specimen/Playfair+Display" />
                  <div class="text-[9px] text-[#C9A84C] font-semibold flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>Lấy link tại <a href="https://fonts.google.com" target="_blank" class="text-[#C9A84C] underline hover:text-[#C9A84C]/80 font-bold inline-flex items-center gap-0.5">Google Fonts <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg></a></span>
                  </div>
                </div>

                <!-- Tải file font Serif -->
                <div class="space-y-1.5 pt-1 border-t border-dashed border-gray-200">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase">Hoặc tải file font từ máy tính (.ttf, .otf, .woff, .woff2)</label>
                  <div class="flex items-center gap-2">
                    <input type="file" class="font-file-upload-input hidden" accept=".ttf,.otf,.woff,.woff2" data-font-type="serif" id="upload-serif-file" />
                    <button type="button" class="btn-trigger-upload-font border border-dashed border-gray-300 hover:border-[#C9A84C] hover:bg-gray-50 text-gray-600 rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center gap-1 cursor-pointer bg-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Chọn file font...
                    </button>
                    <span id="serif-filename-display" class="uploaded-font-filename text-[10px] text-gray-400 italic truncate max-w-[150px]">
                      ${localTypography.custom_font_file_url_serif ? localTypography.custom_font_file_url_serif.split('/').pop() : 'Chưa tải lên file nào'}
                    </span>
                    <button type="button" id="btn-delete-serif-file" class="btn-clear-uploaded-font text-red-500 hover:text-red-700 bg-transparent border-none p-0 cursor-pointer text-[10px] font-semibold ${localTypography.custom_font_file_url_serif ? '' : 'hidden'}" data-font-type="serif">Xóa</button>
                  </div>
                </div>

                <p class="text-[10px] text-gray-500">Dùng cho tiêu đề trang, tên sản phẩm và logo thương hiệu.</p>
              </div>

              <!-- Base Font Size -->
              <div class="bg-gray-50 border rounded-xl p-3 space-y-1.5">
                <label class="block text-xs font-bold text-gray-800">Kích thước chữ cơ bản (Base Size)</label>
                <div class="flex items-center gap-2">
                  <input type="number" step="0.1" min="10" max="24" id="typo-font-size" 
                         value="${parseFloat(localTypography.font_size_base) || 15}" 
                         class="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-mono" />
                  <span class="text-xs text-zinc-500 font-bold uppercase">px</span>
                </div>
                <p class="text-[10px] text-gray-500">Nhập số tự do (hỗ trợ số thập phân như 15.5). Tăng/giảm kích thước chữ toàn trang web để tối ưu hiển thị.</p>
              </div>

              <!-- Đường Viền & Khung Giao Diện -->
              <div class="space-y-4 pt-2 border-t border-gray-100">
                <h4 class="text-xs font-bold text-[#C9A84C] uppercase tracking-wider border-b pb-1">Đường Viền & Khung Giao Diện</h4>
                <div class="space-y-4">
                  
                  <!-- Kiểu viền & Độ dày -->
                  <div class="bg-gray-50 border rounded-xl p-3.5 space-y-3">
                    <label class="block text-xs font-bold text-gray-800">Kiểu viền & Độ dày</label>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kiểu viền</span>
                        <select id="frame-border-style" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                          <option value="none" ${localTypography.card_border_style === 'none' ? 'selected' : ''}>Không viền (Flat)</option>
                          <option value="solid" ${localTypography.card_border_style === 'solid' ? 'selected' : ''}>Nét liền (Solid)</option>
                          <option value="dashed" ${localTypography.card_border_style === 'dashed' ? 'selected' : ''}>Nét đứt (Dashed)</option>
                          <option value="dotted" ${localTypography.card_border_style === 'dotted' ? 'selected' : ''}>Chấm chấm (Dotted)</option>
                          <option value="double" ${localTypography.card_border_style === 'double' ? 'selected' : ''}>Nét đôi (Double)</option>
                        </select>
                      </div>
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Độ dày viền</span>
                        <select id="frame-border-width" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                          <option value="0px" ${localTypography.card_border_width === '0px' ? 'selected' : ''}>0px (Mặc định)</option>
                          <option value="1px" ${localTypography.card_border_width === '1px' ? 'selected' : ''}>1px</option>
                          <option value="2px" ${localTypography.card_border_width === '2px' ? 'selected' : ''}>2px</option>
                          <option value="3px" ${localTypography.card_border_width === '3px' ? 'selected' : ''}>3px</option>
                          <option value="4px" ${localTypography.card_border_width === '4px' ? 'selected' : ''}>4px</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Màu sắc viền & Màu nền khung -->
                  <div class="bg-gray-50 border rounded-xl p-3.5 space-y-3">
                    <label class="block text-xs font-bold text-gray-800">Màu sắc viền & Màu nền khung</label>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Màu đường viền</span>
                        <div class="flex items-center gap-2">
                          <input type="color" id="frame-border-color" value="${localTypography.card_border_color || '#e8e8e8'}" class="w-10 h-8 border border-gray-300 rounded cursor-pointer bg-transparent" />
                          <span id="frame-border-color-text" class="text-[10px] font-mono uppercase">${localTypography.card_border_color || '#e8e8e8'}</span>
                        </div>
                      </div>
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Màu nền trong khung</span>
                        <div class="flex items-center gap-2">
                          <input type="color" id="frame-bg-color" value="${localTypography.card_bg_color || '#ffffff'}" class="w-10 h-8 border border-gray-300 rounded cursor-pointer bg-transparent" />
                          <span id="frame-bg-color-text" class="text-[10px] font-mono uppercase">${localTypography.card_bg_color || '#ffffff'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Bo góc viền & Khoảng đệm (Padding) -->
                  <div class="bg-gray-50 border rounded-xl p-3.5 space-y-3">
                    <label class="block text-xs font-bold text-gray-800">Bo góc & Khoảng đệm (Padding)</label>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Độ bo góc</span>
                        <select id="frame-border-radius" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                          <option value="0px" ${localTypography.card_border_radius === '0px' ? 'selected' : ''}>0px (Vuông vức)</option>
                          <option value="4px" ${localTypography.card_border_radius === '4px' ? 'selected' : ''}>4px</option>
                          <option value="8px" ${localTypography.card_border_radius === '8px' ? 'selected' : ''}>8px (Bo nhẹ)</option>
                          <option value="12px" ${localTypography.card_border_radius === '12px' ? 'selected' : ''}>12px</option>
                          <option value="16px" ${localTypography.card_border_radius === '16px' ? 'selected' : ''}>16px (Bo tròn)</option>
                        </select>
                      </div>
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lề trong (Padding)</span>
                        <select id="frame-padding" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                          <option value="0px" ${localTypography.card_padding === '0px' ? 'selected' : ''}>0px (Mặc định)</option>
                          <option value="8px" ${localTypography.card_padding === '8px' ? 'selected' : ''}>8px (Nhỏ)</option>
                          <option value="12px" ${localTypography.card_padding === '12px' ? 'selected' : ''}>12px (Vừa)</option>
                          <option value="16px" ${localTypography.card_padding === '16px' ? 'selected' : ''}>16px (Rộng)</option>
                          <option value="20px" ${localTypography.card_padding === '20px' ? 'selected' : ''}>20px</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Hiệu ứng đổ bóng (Box Shadow) -->
                  <div class="bg-gray-50 border rounded-xl p-3.5 space-y-1.5">
                    <label class="block text-xs font-bold text-gray-800">Hiệu ứng đổ bóng (Box Shadow)</label>
                    <select id="frame-shadow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                      <option value="none" ${localTypography.card_shadow === 'none' ? 'selected' : ''}>Không đổ bóng</option>
                      <option value="0 2px 8px rgba(0,0,0,0.04)" ${localTypography.card_shadow === '0 2px 8px rgba(0,0,0,0.04)' ? 'selected' : ''}>Bóng mờ siêu nhẹ (sm)</option>
                      <option value="0 4px 12px rgba(0,0,0,0.06)" ${localTypography.card_shadow === '0 4px 12px rgba(0,0,0,0.06)' ? 'selected' : ''}>Bóng vừa (md)</option>
                      <option value="0 8px 24px rgba(0,0,0,0.08)" ${localTypography.card_shadow === '0 8px 24px rgba(0,0,0,0.08)' ? 'selected' : ''}>Bóng đổ rõ (lg)</option>
                    </select>
                    <p class="text-[10px] text-gray-500">Tạo chiều sâu 3D cho các khung sản phẩm và thông tin sản phẩm.</p>
                  </div>

                  <!-- Khoảng cách & Căn lề (Spacing & Alignment) -->
                  <div class="bg-gray-50 border rounded-xl p-3.5 space-y-3">
                    <label class="block text-xs font-bold text-gray-800">Khoảng cách & Căn lề sản phẩm</label>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cự ly Desktop (Gap)</span>
                        <select id="grid-gap-desktop" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                          <option value="12px" ${localTypography.product_grid_gap_desktop === '12px' ? 'selected' : ''}>12px (Hẹp)</option>
                          <option value="16px" ${localTypography.product_grid_gap_desktop === '16px' ? 'selected' : ''}>16px</option>
                          <option value="24px" ${localTypography.product_grid_gap_desktop === '24px' || !localTypography.product_grid_gap_desktop ? 'selected' : ''}>24px (Vừa)</option>
                          <option value="32px" ${localTypography.product_grid_gap_desktop === '32px' ? 'selected' : ''}>32px (Rộng)</option>
                          <option value="40px" ${localTypography.product_grid_gap_desktop === '40px' ? 'selected' : ''}>40px</option>
                        </select>
                      </div>
                      <div>
                        <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cự ly Mobile (Gap)</span>
                        <select id="grid-gap-mobile" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                          <option value="8px" ${localTypography.product_grid_gap_mobile === '8px' ? 'selected' : ''}>8px (Siêu hẹp)</option>
                          <option value="12px" ${localTypography.product_grid_gap_mobile === '12px' ? 'selected' : ''}>12px</option>
                          <option value="16px" ${localTypography.product_grid_gap_mobile === '16px' || !localTypography.product_grid_gap_mobile ? 'selected' : ''}>16px (Vừa)</option>
                          <option value="20px" ${localTypography.product_grid_gap_mobile === '20px' ? 'selected' : ''}>20px</option>
                          <option value="24px" ${localTypography.product_grid_gap_mobile === '24px' ? 'selected' : ''}>24px (Rộng)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <span class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Căn lề thông tin sản phẩm</span>
                      <select id="card-align" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none bg-white font-medium">
                        <option value="center" ${localTypography.product_card_align === 'center' || !localTypography.product_card_align ? 'selected' : ''}>Căn giữa (Center)</option>
                        <option value="left" ${localTypography.product_card_align === 'left' ? 'selected' : ''}>Căn trái (Left)</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>


            </div>
          </div>

          <!-- Danh sách Templates Presets đã lưu -->
          <div class="space-y-4 pt-4 border-t border-gray-100">
            <h4 class="text-xs font-bold text-[#C9A84C] uppercase tracking-wider border-b pb-1">Các Phiên Bản Templates Đã Lưu</h4>
            ${presets.length === 0 
              ? `<div class="text-center py-6 text-gray-400 text-xs">Chưa có template nào được lưu. Hãy bấm "Lưu Template này" phía trên.</div>`
              : `<div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="templates-presets-list">
                  ${presets.map((p, idx) => `
                    <div class="border border-gray-200 rounded-xl p-3 bg-zinc-50/50 flex items-center justify-between hover:bg-gray-100/50 transition-colors" data-preset-idx="${idx}">
                      <div>
                        <div class="text-xs font-bold text-zinc-800">${p.name}</div>
                        <div class="text-[9px] text-gray-400 mt-0.5">${p.created_at || 'Đã lưu'} · ${p.layout ? 'Full layout' : 'Màu & font'}</div>
                      </div>
                      <div class="flex gap-1.5">
                        <button class="apply-preset-btn bg-zinc-950 hover:bg-zinc-850 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition-colors cursor-pointer border-none" data-preset-idx="${idx}">Áp dụng</button>
                        <button class="delete-preset-btn border border-red-100 hover:bg-red-50 text-red-500 rounded p-1 transition-colors cursor-pointer bg-white" title="Xóa template" data-preset-idx="${idx}">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>`
            }
          </div>

        </div>

        <!-- Right Live Preview Mockup -->
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

export function bindColorsTab(container, settings, localColors, localTypography, ctx) {
  // Bind Color Pickers
  const pickers = container.querySelectorAll('.color-picker-input');
  pickers.forEach(picker => {
    picker.addEventListener('input', (e) => {
      const key = e.target.dataset.colorKey;
      const val = e.target.value;
      picker.nextElementSibling.querySelector('span:last-child').textContent = val.toUpperCase();
      localColors[key] = val;
      settings.theme_colors[key] = val;
      ctx.updateMockupColors();
    });
  });

  // Helper to setup Combobox
  function setupCombobox(comboId, listFont, inputId, wrapperId, customCssId, key, defaultValue) {
    const combo = container.querySelector(comboId);
    if (!combo) return;
    const input = combo.querySelector(inputId);
    const toggleBtn = combo.querySelector('.combo-toggle-btn');
    const dropdown = combo.querySelector('.combo-dropdown');
    const options = dropdown.querySelectorAll('.combo-option');
    const cssWrapper = container.querySelector(wrapperId);

    // Toggle dropdown khi click button
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdown.classList.contains('hidden');
      document.querySelectorAll('.combo-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.add('hidden');
      });
      if (isHidden) {
        dropdown.classList.remove('hidden');
        options.forEach(opt => opt.classList.remove('hidden'));
      } else {
        dropdown.classList.add('hidden');
      }
    });

    // Mở dropdown khi focus input
    input?.addEventListener('focus', () => {
      document.querySelectorAll('.combo-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.add('hidden');
      });
      dropdown.classList.remove('hidden');
      options.forEach(opt => opt.classList.remove('hidden'));
    });

    // Lọc khi người dùng gõ
    input?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const valLower = val.toLowerCase();
      
      localTypography[key] = val || defaultValue;
      settings.theme_typography[key] = val || defaultValue;

      if (listFont.includes(val)) {
        cssWrapper?.classList.add('hidden');
      } else {
        cssWrapper?.classList.remove('hidden');
      }
      ctx.updateMockupColors();

      // Mở dropdown và lọc
      dropdown.classList.remove('hidden');
      let hasMatch = false;
      options.forEach(opt => {
        const text = opt.dataset.value.toLowerCase();
        if (text.includes(valLower)) {
          opt.classList.remove('hidden');
          hasMatch = true;
        } else {
          opt.classList.add('hidden');
        }
      });
      
      if (!hasMatch) {
        dropdown.classList.add('hidden');
      }
    });

    // Chọn option từ dropdown
    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        input.value = val;
        
        localTypography[key] = val;
        settings.theme_typography[key] = val;
        
        cssWrapper?.classList.add('hidden');
        dropdown.classList.add('hidden');
        ctx.updateMockupColors();
      });
    });
  }

  // Khởi tạo các Combobox
  setupCombobox(
    '#combo-font-sans', 
    fontSansList, 
    '#typo-font-sans-input', 
    '#typo-sans-css-wrapper', 
    '#typo-font-sans-custom-css', 
    'font_sans', 
    'Montserrat'
  );

  setupCombobox(
    '#combo-font-serif', 
    fontSerifList, 
    '#typo-font-serif-input', 
    '#typo-serif-css-wrapper', 
    '#typo-font-serif-custom-css', 
    'font_serif', 
    'Cormorant Garamond'
  );

  // Lắng nghe thay đổi link chi tiết Google Fonts
  const sansCustomCss = container.querySelector('#typo-font-sans-custom-css');
  const serifCustomCss = container.querySelector('#typo-font-serif-custom-css');

  const parseGoogleFontSpecimen = (url) => {
    const match = url.match(/fonts\.google\.com\/specimen\/([a-zA-Z0-9+_\-]+)/);
    if (match && match[1]) {
      const rawName = decodeURIComponent(match[1]);
      return rawName.replace(/[+_]/g, ' ');
    }
    return null;
  };

  sansCustomCss?.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    const specimenName = parseGoogleFontSpecimen(val);
    if (specimenName) {
      localTypography.font_sans = specimenName;
      settings.theme_typography.font_sans = specimenName;
      const inputEl = container.querySelector('#typo-font-sans-input');
      if (inputEl) inputEl.value = specimenName;

      const sansFamily = specimenName.replace(/ /g, '+');
      val = `https://fonts.googleapis.com/css2?family=${sansFamily}&display=swap`;
      localTypography.custom_font_css = val;
      settings.theme_typography.custom_font_css = val;
      showToast(`Tự động nhận diện font: "${specimenName}"`, 'success');
    } else {
      localTypography.custom_font_css = val;
      settings.theme_typography.custom_font_css = val;
    }
    loadExternalFontCSS(val);
    ctx.updateMockupColors();
  });

  serifCustomCss?.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    const specimenName = parseGoogleFontSpecimen(val);
    if (specimenName) {
      localTypography.font_serif = specimenName;
      settings.theme_typography.font_serif = specimenName;
      const inputEl = container.querySelector('#typo-font-serif-input');
      if (inputEl) inputEl.value = specimenName;

      const serifFamily = specimenName.replace(/ /g, '+');
      val = `https://fonts.googleapis.com/css2?family=${serifFamily}&display=swap`;
      localTypography.custom_font_css = val;
      settings.theme_typography.custom_font_css = val;
      showToast(`Tự động nhận diện font: "${specimenName}"`, 'success');
    } else {
      localTypography.custom_font_css = val;
      settings.theme_typography.custom_font_css = val;
    }
    loadExternalFontCSS(val);
    ctx.updateMockupColors();
  });

  // Xử lý upload file font
  const triggerBtns = container.querySelectorAll('.btn-trigger-upload-font');
  triggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.previousElementSibling.click();
    });
  });

  const fileInputs = container.querySelectorAll('.font-file-upload-input');
  fileInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const type = input.dataset.fontType;
      const formData = new FormData();
      formData.append('font', file);

      showToast(`Đang tải file font ${file.name} lên...`, 'info');

      try {
        const token = localStorage.getItem('sly_admin_auth_token') || localStorage.getItem('sly_admin_auth_token_key');
        const res = await fetch(`${API_BASE}/api/admin/settings/upload-font`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const json = await res.json();
        if (res.ok && json.success) {
          const fontUrl = json.data.url;
          const fontName = json.data.font_name;

          if (type === 'sans') {
            localTypography.custom_font_file_url = fontUrl;
            settings.theme_typography.custom_font_file_url = fontUrl;
            
            localTypography.font_sans = fontName;
            settings.theme_typography.font_sans = fontName;
            const inputEl = container.querySelector('#typo-font-sans-input');
            if (inputEl) inputEl.value = fontName;

            const nameEl = container.querySelector('#sans-filename-display');
            if (nameEl) nameEl.textContent = fontUrl.split('/').pop();
            container.querySelector('#btn-delete-sans-file')?.classList.remove('hidden');
          } else {
            localTypography.custom_font_file_url_serif = fontUrl;
            settings.theme_typography.custom_font_file_url_serif = fontUrl;

            localTypography.font_serif = fontName;
            settings.theme_typography.font_serif = fontName;
            const inputEl = container.querySelector('#typo-font-serif-input');
            if (inputEl) inputEl.value = fontName;

            const nameEl = container.querySelector('#serif-filename-display');
            if (nameEl) nameEl.textContent = fontUrl.split('/').pop();
            container.querySelector('#btn-delete-serif-file')?.classList.remove('hidden');
          }

          showToast(`Đã tải lên và áp dụng font "${fontName}" thành công!`, 'success');
          ctx.updateMockupColors();
        } else {
          showToast(json.error || 'Tải file font thất bại.', 'error');
        }
      } catch (err) {
        console.error('[ColorsTab] Font upload error:', err);
        showToast('Lỗi kết nối máy chủ khi tải font.', 'error');
      } finally {
        input.value = '';
      }
    });
  });

  // Xử lý nút xóa file font tải lên
  const deleteBtns = container.querySelectorAll('.btn-clear-uploaded-font');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.dataset.fontType;
      if (type === 'sans') {
        localTypography.custom_font_file_url = '';
        settings.theme_typography.custom_font_file_url = '';
        
        localTypography.font_sans = 'Montserrat';
        settings.theme_typography.font_sans = 'Montserrat';
        const sansInputEl = container.querySelector('#typo-font-sans-input');
        if (sansInputEl) sansInputEl.value = 'Montserrat';

        const nameEl = container.querySelector('#sans-filename-display');
        if (nameEl) nameEl.textContent = 'Chưa tải lên file nào';
        btn.classList.add('hidden');
      } else {
        localTypography.custom_font_file_url_serif = '';
        settings.theme_typography.custom_font_file_url_serif = '';

        localTypography.font_serif = 'Cormorant Garamond';
        settings.theme_typography.font_serif = 'Cormorant Garamond';
        const serifInputEl = container.querySelector('#typo-font-serif-input');
        if (serifInputEl) serifInputEl.value = 'Cormorant Garamond';

        const nameEl = container.querySelector('#serif-filename-display');
        if (nameEl) nameEl.textContent = 'Chưa tải lên file nào';
        btn.classList.add('hidden');
      }
      showToast('Đã xóa file font tải lên, khôi phục về mặc định!', 'info');
      ctx.updateMockupColors();
    });
  });

  // Đóng tất cả dropdown khi click ra ngoài
  const closeComboDropdowns = () => {
    document.querySelectorAll('.combo-dropdown').forEach(d => d.classList.add('hidden'));
  };
  document.addEventListener('click', closeComboDropdowns);

  window.adminCleanups = window.adminCleanups || [];
  window.adminCleanups.push(() => {
    document.removeEventListener('click', closeComboDropdowns);
  });


  // Helper to load custom CSS dynamically on admin page for preview
  function loadExternalFontCSS(url) {
    if (!url) return;
    let linkEl = document.getElementById('admin-custom-fonts-preview');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = 'admin-custom-fonts-preview';
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }
    linkEl.href = url;
  }

  // Khởi chạy nạp font ngoài lúc mở tab (nếu đã có sẵn link)
  if (localTypography.custom_font_css) {
    loadExternalFontCSS(localTypography.custom_font_css);
  }

  // Bind Font size input tự do (step=0.1)
  const sizeInput = container.querySelector('#typo-font-size');
  sizeInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 10 && val <= 24) {
      localTypography.font_size_base = val + 'px';
      settings.theme_typography.font_size_base = val + 'px';
      ctx.updateMockupColors();
    }
  });

  // Bind Card Border / Frame settings
  container.querySelector('#frame-border-style')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.card_border_style = val;
    settings.theme_typography.card_border_style = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#frame-border-width')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.card_border_width = val;
    settings.theme_typography.card_border_width = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#frame-border-color')?.addEventListener('input', (e) => {
    const val = e.target.value;
    const txt = container.querySelector('#frame-border-color-text');
    if (txt) txt.textContent = val.toUpperCase();
    localTypography.card_border_color = val;
    settings.theme_typography.card_border_color = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#frame-bg-color')?.addEventListener('input', (e) => {
    const val = e.target.value;
    const txt = container.querySelector('#frame-bg-color-text');
    if (txt) txt.textContent = val.toUpperCase();
    localTypography.card_bg_color = val;
    settings.theme_typography.card_bg_color = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#frame-border-radius')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.card_border_radius = val;
    settings.theme_typography.card_border_radius = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#frame-padding')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.card_padding = val;
    settings.theme_typography.card_padding = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#frame-shadow')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.card_shadow = val;
    settings.theme_typography.card_shadow = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#grid-gap-desktop')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.product_grid_gap_desktop = val;
    settings.theme_typography.product_grid_gap_desktop = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#grid-gap-mobile')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.product_grid_gap_mobile = val;
    settings.theme_typography.product_grid_gap_mobile = val;
    ctx.updateMockupColors();
  });

  container.querySelector('#card-align')?.addEventListener('change', (e) => {
    const val = e.target.value;
    localTypography.product_card_align = val;
    settings.theme_typography.product_card_align = val;
    ctx.updateMockupColors();
  });


  // Nút XEM TRƯỚC GIAO DIỆN THỰC TẾ (Mở tab mới /admin/template)
  container.querySelector('#btn-view-preview-site')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Đóng gói state hiện tại
    const previewSettings = {
      ...settings,
      theme_colors: { ...localColors },
      theme_typography: { ...localTypography }
    };
    
    // Lưu vào LocalStorage
    localStorage.setItem('sly_preview_settings', JSON.stringify(previewSettings));
    
    const prefix = window.location.pathname.includes('/dong-ho-a-tuan') 
      ? '/dong-ho-a-tuan' 
      : (window.location.pathname.includes('/sly 2') || window.location.pathname.includes('/sly%202') ? '/sly%202' : '');
    window.open(`${prefix}/index.html?preview=true`, '_blank');
    showToast('Đã mở trang xem trước thực tế trong tab mới!', 'success');
  });

  // Nút LƯU PHIÊN BẢN TEMPLATE (Theme Presets)
  container.querySelector('#save-theme-preset')?.addEventListener('click', async () => {
    const name = prompt('Nhập tên phiên bản Template muốn lưu (ví dụ: Giao diện mùa đông, Theme Giáng Sinh):');
    if (name === null) return; // Hủy
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('Tên template không được để trống!', 'warning');
      return;
    }

    if (!settings.theme_presets) settings.theme_presets = [];
    
    const newPreset = buildThemePreset(settings, localColors, localTypography, trimmedName);

    settings.theme_presets.push(newPreset);
    
    showToast('Đang lưu template...', 'info');
    const success = await ctx.saveSettingsToServer();
    if (success) {
      showToast(`Đã lưu và đồng bộ Template "${trimmedName}" lên Database thành công!`, 'success');
    } else {
      showToast('Lưu template thất bại. Vui lòng thử lại.', 'error');
    }
    ctx.renderUI();
  });

  // Bind các sự kiện cho danh sách Templates Presets (Áp dụng & Xóa)
  const presetsList = container.querySelector('#templates-presets-list');
  
  presetsList?.querySelectorAll('.apply-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.presetIdx, 10);
      const preset = settings.theme_presets[idx];
      if (!preset) return;

      if (!confirm(`Áp dụng phiên bản giao diện "${preset.name}"? (Bạn cần nhấn "Lưu Tất Cả" để áp dụng chính thức lên website)`)) return;

      applyThemePreset(settings, localColors, localTypography, preset);

      showToast(`Đã áp dụng template "${preset.name}" lên trang soạn thảo! Hãy nhấn "Lưu Tất Cả" ở góc trên bên phải để lưu cấu hình này lên trang chủ.`, 'success');
      ctx.renderUI();
    });
  });

  presetsList?.querySelectorAll('.delete-preset-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const btnEl = e.currentTarget;
      const idx = parseInt(btnEl.dataset.presetIdx, 10);
      const preset = settings.theme_presets[idx];
      if (!preset) return;

      if (!confirm(`Xóa phiên bản template "${preset.name}"?`)) return;

      settings.theme_presets.splice(idx, 1);
      
      showToast('Đang xóa template...', 'info');
      const success = await ctx.saveSettingsToServer();
      if (success) {
        showToast(`Đã xóa template "${preset.name}" khỏi Database thành công!`, 'success');
      } else {
        showToast('Xóa template thất bại. Vui lòng thử lại.', 'error');
      }
      ctx.renderUI();
    });
  });

  // Reset Colors & Typography to default values
  container.querySelector('#reset-colors-default')?.addEventListener('click', () => {
    if (!confirm(`Khôi phục toàn bộ bảng màu và cấu hình chữ mặc định của ${settings.brand_name || window.APP_SETTINGS?.brand_name || 'Mắt Bão WS'} Clothing?`)) return;
    
    const defaults = {
      primary: '#1a1a1a',
      secondary: '#ffffff',
      'accent-gold': '#C9A84C',
      'accent-dark': '#2d2d2d',
      'text-muted': '#888888',
      'border-color': '#e8e8e8',
      'sale-red': '#c0392b',
      'primary-gold': '#C9A961',
      'primary-gold-dark': '#A88840',
      ink: '#0A0A0A',
      'ink-soft': '#1F1F1F',
      paper: '#FFFFFF',
      'paper-warm': '#FAF8F3',
      line: '#E8E4DC',
    };

    const defaultsTypo = {
      font_sans: 'Source Sans 3',
      font_serif: 'Quicksand',
      font_size_base: '15px',
      custom_font_css: ''
    };

    Object.assign(localColors, defaults);
    settings.theme_colors = { ...localColors };

    Object.assign(localTypography, defaultsTypo);
    settings.theme_typography = { ...localTypography };

    showToast('Đã khôi phục bảng màu và font chữ mặc định. Nhớ nhấn "Lưu Tất Cả" để áp dụng!', 'info');
    ctx.renderUI();
  });
}
