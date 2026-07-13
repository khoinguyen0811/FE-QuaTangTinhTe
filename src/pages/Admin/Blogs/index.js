export function renderBlogsPlaceholder(container, route) {
  const titles = {
    'blogs': 'Quản Lý Bài Viết & Tin Tức',
    'blog_categories': 'Danh Mục Bài Viết',
    'blog_tags': 'Thẻ Bài Viết'
  };
  const title = titles[route] || 'Quản Lý Bài Viết & Tin Tức';

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">${title}</h2>
          <p class="text-xs text-gray-500 mt-1">Quản lý nội dung bài viết, tin tức và chia sẻ kinh nghiệm trên website.</p>
        </div>
        <button class="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition duration-200 flex items-center gap-1.5 opacity-80 cursor-not-allowed" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm Mới (Đang thiết lập)
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3a2.5 2.5 0 0 1 2.5-2.5H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bài Viết</div>
            <div class="text-xl font-extrabold text-gray-900 mt-0.5">0</div>
          </div>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh Mục</div>
            <div class="text-xl font-extrabold text-gray-900 mt-0.5">0</div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thẻ Bài Viết</div>
            <div class="text-xl font-extrabold text-gray-900 mt-0.5">0</div>
          </div>
        </div>
      </div>

      <!-- Main Box -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8 text-center max-w-2xl mx-auto my-6 space-y-4">
        <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-gray-800">Tính năng đang trong lộ trình phát triển</h3>
          <p class="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Phân hệ quản lý ${title.toLowerCase()} đang được thiết lập schema database và tích hợp API. Vui lòng quay lại sau!
          </p>
        </div>
        <div class="pt-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            PHASE 4: BLOGS & CONTENTS
          </span>
        </div>
      </div>
    </div>
  `;
}
