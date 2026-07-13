export function renderAnalytics(container) {
  container.innerHTML = `
    <div class="max-w-[800px] mx-auto p-4 md:p-6">
      <div class="flex items-start gap-4 p-5 rounded-2xl bg-[#5d58f0]/10 border border-[#5d58f0]/20 text-white shadow-lg relative overflow-hidden">
        <!-- Subtle background glow -->
        <div class="absolute -top-12 -left-12 w-24 h-24 bg-[#5d58f0]/15 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Info Icon -->
        <div class="p-2 rounded-xl bg-[#5d58f0]/25 text-[#7f7bf8] flex-shrink-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold mb-1 text-black">Thông báo hệ thống</h3>
          <p class="text-xs leading-relaxed text-black">
            Hệ thống thống kê tự quản (Self-hosted Tracking) đã được gỡ bỏ để tối ưu hiệu năng máy chủ. Lưu lượng truy cập hiện được theo dõi trực tiếp qua tài khoản Google Analytics bên ngoài của cửa hàng.
          </p>
          <div class="mt-3">
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-[#7f7bf8] hover:text-white font-bold transition-colors">
              Truy cập Google Analytics
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
