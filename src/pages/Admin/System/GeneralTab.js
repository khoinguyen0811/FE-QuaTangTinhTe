export function renderGeneralTab(settings, packageInfo) {
  const tzVal = settings.timezone || 'UTC+7';
  const tzDisplay = tzVal.startsWith('UTC') ? tzVal.replace('UTC', '') : tzVal;
  return `
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div>
        <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Tên Website</label>
        <input type="text" id="sys-title" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-medium" placeholder="Nhập tên website..." value="${settings.website_title || ''}">
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Mô Tả Website (Meta Description)</label>
        <textarea id="sys-desc" rows="3" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-medium" placeholder="Nhập mô tả website...">${settings.website_description || ''}</textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Email Website</label>
          <input type="email" id="sys-email" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-medium" value="${settings.website_email || ''}">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Số Điện Thoại</label>
          <input type="text" id="sys-phone" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-medium" value="${settings.website_phone || ''}">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Ngôn ngữ mặc định</label>
          <select id="sys-lang" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-medium bg-white">
            <option value="vi" ${settings.default_language === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
            <option value="en" ${settings.default_language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Múi giờ</label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-gray-500 font-bold text-sm select-none pointer-events-none">UTC</span>
            <input type="text" id="sys-timezone" class="w-full pl-14 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-semibold" placeholder="+7 hoặc -5 hoặc +0" value="${tzDisplay}">
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Định dạng thời gian</label>
          <select id="sys-timeformat" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-medium bg-white">
            <option value="DD/MM/YYYY HH:mm" ${settings.time_format === 'DD/MM/YYYY HH:mm' ? 'selected' : ''}>DD/MM/YYYY HH:mm</option>
            <option value="DD/MM/YYYY HH:mm:ss" ${settings.time_format === 'DD/MM/YYYY HH:mm:ss' ? 'selected' : ''}>DD/MM/YYYY HH:mm:ss</option>
            <option value="YYYY-MM-DD HH:mm" ${settings.time_format === 'YYYY-MM-DD HH:mm' ? 'selected' : ''}>YYYY-MM-DD HH:mm</option>
            <option value="YYYY-MM-DD HH:mm:ss" ${settings.time_format === 'YYYY-MM-DD HH:mm:ss' ? 'selected' : ''}>YYYY-MM-DD HH:mm:ss</option>
            <option value="MM/DD/YYYY hh:mm A" ${settings.time_format === 'MM/DD/YYYY hh:mm A' ? 'selected' : ''}>MM/DD/YYYY hh:mm A</option>
            <option value="DD/MM/YYYY" ${settings.time_format === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
            <option value="YYYY-MM-DD" ${settings.time_format === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
            <option value="DD-MM-YYYY" ${settings.time_format === 'DD-MM-YYYY' ? 'selected' : ''}>DD-MM-YYYY</option>
            <option value="hh:mm:ss A" ${settings.time_format === 'hh:mm:ss A' ? 'selected' : ''}>hh:mm:ss A</option>
            <option value="HH:mm" ${settings.time_format === 'HH:mm' ? 'selected' : ''}>HH:mm</option>
          </select>
        </div>
      </div>

      <hr class="border-gray-100" />

      <div class="flex items-start justify-between gap-6">
        <div class="space-y-1">
          <label class="block text-sm font-bold text-gray-900">Cho phép Công cụ tìm kiếm lập chỉ mục (Search Indexing)</label>
          <p class="text-xs text-gray-500 leading-relaxed max-w-lg">
            Khi Bật, Google và các công cụ tìm kiếm khác sẽ được phép thu thập dữ liệu và hiển thị website của bạn trên kết quả tìm kiếm. 
            Khi Tắt, hệ thống sẽ tự động chặn mọi robot tìm kiếm (thích hợp khi đang chạy thử nghiệm).
          </p>
        </div>
        <div class="flex-shrink-0 pt-1">
          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" id="sys-indexing-toggle" class="sr-only peer" ${settings.search_engine_indexing !== 0 ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#C9A84C]/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C]"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- API URL Card -->
    ${packageInfo ? `
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h2 class="text-base font-bold text-gray-900">Cổng API kết nối thông tin gói</h2>
        <p class="text-xs text-gray-500 mt-1">API này cung cấp thông số kỹ thuật, giá trị bản quyền và dung lượng lưu trữ tối đa của website từ trung tâm quản lý gói MatBao WS.</p>
      </div>
      <div class="flex items-center gap-3">
        <input type="text" id="sys-package-api-url" class="flex-grow px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] font-mono text-gray-600" 
          value="${settings.package_api_url || packageInfo.api_url || ''}">
        <button id="copy-pkg-api-btn" class="bg-white hover:bg-gray-100 text-gray-700 font-bold text-[10px] px-3 py-2.5 rounded-lg border border-gray-200 shadow-sm flex-shrink-0 transition duration-200">Copy</button>
      </div>
    </div>
    ` : ''}
  `;
}

export function bindGeneralTab(container, settings, ctx) {
  const titleInput = container.querySelector('#sys-title');
  const descInput = container.querySelector('#sys-desc');
  const emailInput = container.querySelector('#sys-email');
  const phoneInput = container.querySelector('#sys-phone');
  const langInput = container.querySelector('#sys-lang');
  const timezoneInput = container.querySelector('#sys-timezone');
  const timeFormatInput = container.querySelector('#sys-timeformat');
  const indexingInput = container.querySelector('#sys-indexing-toggle');
  const packageApiUrlInput = container.querySelector('#sys-package-api-url');

  const sync = () => {
    settings.website_title = titleInput.value.trim();
    settings.website_description = descInput.value.trim();
    settings.website_email = emailInput.value.trim();
    settings.website_phone = phoneInput.value.trim();
    settings.default_language = langInput.value;
    
    let tz = timezoneInput.value.trim() || '+7';
    if (!tz.toUpperCase().startsWith('UTC')) {
      const num = parseInt(tz, 10);
      tz = 'UTC' + (isNaN(num) ? '+7' : (num >= 0 ? '+' + num : num));
    }
    settings.timezone = tz;
    settings.time_format = timeFormatInput.value;
    settings.search_engine_indexing = indexingInput.checked ? 1 : 0;
    
    if (packageApiUrlInput) {
      settings.package_api_url = packageApiUrlInput.value.trim();
    }
    ctx.saveSettingsDraft();
  };

  titleInput?.addEventListener('input', sync);
  descInput?.addEventListener('input', sync);
  emailInput?.addEventListener('input', sync);
  phoneInput?.addEventListener('input', sync);
  langInput?.addEventListener('change', sync);
  timezoneInput?.addEventListener('input', sync);
  timeFormatInput?.addEventListener('change', sync);
  indexingInput?.addEventListener('change', sync);
  packageApiUrlInput?.addEventListener('input', sync);
}
