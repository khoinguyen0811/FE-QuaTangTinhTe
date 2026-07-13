export const defaultColors = {
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

const colorFields = [
  { key: 'primary', label: 'Màu nền tối chính', desc: 'Màu nền của phần đầu trang (Header), chân trang (Footer).' },
  { key: 'primary-gold', label: 'Màu vàng nổi bật chính', desc: 'Dùng cho các nút bấm chính cần gây chú ý và các đường viền hiệu ứng.' },
  { key: 'accent-gold', label: 'Màu vàng trang trí phụ', desc: 'Dùng khi di chuột vào danh mục menu, các biểu tượng nhỏ.' },
  { key: 'primary-gold-dark', label: 'Màu vàng khi di chuột', desc: 'Màu sắc hiển thị của các nút bấm màu vàng chính khi bạn rê con trỏ chuột vào.' },
  { key: 'paper-warm', label: 'Màu nền ấm', desc: 'Màu nền ấm áp của một số khối phụ.' },
  { key: 'ink', label: 'Màu chữ chính', desc: 'Màu sắc chủ đạo cho toàn bộ chữ viết và tiêu đề chính trên trang.' },
  { key: 'sale-red', label: 'Màu thông báo giảm giá', desc: 'Màu đỏ rực rỡ dùng để hiển thị nhãn giảm giá và giá khuyến mãi.' },
  { key: 'secondary', label: 'Màu nền sáng chính', desc: 'Màu nền chủ đạo của toàn bộ trang web.' },
];

export function renderColorsForm(settings) {
  const colors = settings.theme_colors || defaultColors;
  return `
    <div class="space-y-4">
      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>Kéo bảng màu (Live Preview trực tiếp trên trang)</span>
        <button type="button" id="quick-reset-colors" class="text-[#C9A84C] hover:underline cursor-pointer font-bold bg-transparent border-0">Khôi phục gốc</button>
      </div>
      <div class="grid grid-cols-1 gap-2.5">
        ${colorFields.map(field => `
          <div class="flex items-center gap-3.5 bg-gray-50 border border-gray-100 rounded-xl p-2.5 hover:bg-gray-100/50 transition-colors">
            <input type="color" data-color-key="${field.key}" value="${colors[field.key] || defaultColors[field.key]}" 
              class="quick-color-input w-11 h-9 border-0 rounded-lg cursor-pointer bg-transparent focus:outline-none" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-gray-800">${field.label}</span>
                <span class="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider">${colors[field.key] || defaultColors[field.key]}</span>
              </div>
              <p class="text-[10px] text-gray-500 mt-0.5 leading-tight">${field.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function bindColorsEvents(modalEl, settings, renderModal) {
  const pickers = modalEl.querySelectorAll('.quick-color-input');
  pickers.forEach(picker => {
    picker.addEventListener('input', (e) => {
      const key = e.target.dataset.colorKey;
      const val = e.target.value;
      
      if (!settings.theme_colors) settings.theme_colors = {};
      settings.theme_colors[key] = val;
      
      const label = picker.nextElementSibling?.querySelector('span:last-child');
      if (label) label.textContent = val.toUpperCase();
      
      document.documentElement.style.setProperty(`--color-${key}`, val);
    });
  });

  modalEl.querySelector('#quick-reset-colors')?.addEventListener('click', () => {
    if (!confirm('Khôi phục toàn bộ bảng màu gốc của trang web?')) return;
    settings.theme_colors = { ...defaultColors };
    
    Object.entries(defaultColors).forEach(([key, val]) => {
      document.documentElement.style.setProperty(`--color-${key}`, val);
    });
    
    renderModal();
  });
}
