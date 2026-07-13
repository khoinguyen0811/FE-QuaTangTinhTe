export function renderLanguagesPlaceholder(container, route) {
  const titles = {
    'languages': 'Quản Lý Ngôn Ngữ',
    'translations': 'Quản Lý Bản Dịch (i18n)'
  };
  const title = titles[route] || 'Quản Lý Đa Ngôn Ngữ';

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">${title}</h2>
          <p class="text-xs text-gray-500 mt-1">Cấu hình ngôn ngữ hiển thị trên website và dịch nội dung sản phẩm, danh mục, bài viết.</p>
        </div>
        <button class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition duration-200 flex items-center gap-1.5 opacity-80 cursor-not-allowed" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm Ngôn Ngữ (Đang thiết lập)
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngôn Ngữ Kích Hoạt</div>
            <div class="text-xl font-extrabold text-gray-900 mt-0.5">2 <span class="text-xs text-gray-450 font-normal">(Tiếng Việt, Tiếng Anh)</span></div>
          </div>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Từ Khóa Bản Dịch (i18n)</div>
            <div class="text-xl font-extrabold text-gray-900 mt-0.5">0</div>
          </div>
        </div>
      </div>

      <!-- Main Box -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8 text-center max-w-2xl mx-auto my-6 space-y-4">
        <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-gray-800">Tính năng đang trong lộ trình phát triển</h3>
          <p class="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Phân hệ ${title.toLowerCase()} đang được thiết lập schema database và các API endpoints dịch thuật tự động. Vui lòng quay lại sau!
          </p>
        </div>
        <div class="pt-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            PHASE 5: MULTILINGUAL & TRANSLATIONS
          </span>
        </div>
      </div>
    </div>
  `;
}
