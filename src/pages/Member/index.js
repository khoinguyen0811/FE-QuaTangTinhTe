import { hasAdminPermission } from '../../utils/adminAuth.js';

export default class MemberPage {
  constructor(params = {}) {
    this._tab = params.tab || 'system';
    this._activeCount = Math.floor(Math.random() * 20) + 12;
  }

  async render() {
    const wrap = document.createElement('div');
    // Changed py-16 to pt-28 pb-16 to clear the fixed navigation bar
    wrap.className = 'min-h-[60vh] pt-32 md:pt-40 pb-16 px-6 sm:px-12 max-w-4xl mx-auto font-sans text-black';

    const canEditSettings = hasAdminPermission('settings:write');

    if (this._tab === 'online' || window.location.pathname.includes('online')) {
      await this._renderOnline(wrap);
    } else {
      this._renderSystem(wrap, canEditSettings);
    }

    return wrap;
  }

  _renderSystem(wrap, canEditSettings = false) {
    const policySlug = 'member-system';

    const brand = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';

    // Check database settings first
    const policyData = window.APP_SETTINGS?.policies?.[policySlug] || {
      title: `HỆ THỐNG THÀNH VIÊN ${brand.toUpperCase()}`,
      content: `
        <p class="font-bold text-base text-[#ff3b30] tracking-wider uppercase">Chương trình Khách hàng Thân Thiết ${brand} Loyalty Program</p>
        <p>Khi đăng ký tài khoản mua hàng tại ${brand} Clothing, bạn sẽ tự động tham gia tích lũy điểm thưởng để thăng hạng thành viên với các ưu đãi đặc quyền dài hạn.</p>
 
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div class="border border-zinc-200 p-6 rounded-lg bg-zinc-50">
            <h3 class="font-black text-black text-lg mb-2">SILVER MEMBER</h3>
            <p class="text-xs text-[#ff3b30] font-bold uppercase mb-4">Chi tiêu từ 1,000,000 VND</p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Giảm giá 5% cho tất cả đơn hàng sau.</li>
              <li>Quà tặng sinh nhật trị giá 100,000 VND.</li>
              <li>Nhận trước thông tin về các bộ sưu tập mới.</li>
            </ul>
          </div>
          <div class="border border-zinc-200 p-6 rounded-lg bg-zinc-50">
            <h3 class="font-black text-black text-lg mb-2">GOLD MEMBER</h3>
            <p class="text-xs text-[#ff3b30] font-bold uppercase mb-4">Chi tiêu từ 5,000,000 VND</p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Giảm giá 10% cho tất cả đơn hàng sau.</li>
              <li>Quà tặng sinh nhật trị giá 300,000 VND.</li>
              <li>Miễn phí vận chuyển toàn quốc không giới hạn đơn hàng.</li>
            </ul>
          </div>
          <div class="border border-zinc-200 p-6 rounded-lg bg-zinc-50">
            <h3 class="font-black text-black text-lg mb-2">PLATINUM</h3>
            <p class="text-xs text-[#ff3b30] font-bold uppercase mb-4">Chi tiêu từ 10,000,000 VND</p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Giảm giá 15% cho tất cả đơn hàng sau.</li>
              <li>Quà tặng sinh nhật trị giá 500,000 VND.</li>
              <li>Đặc quyền tham gia các Private Sale đặc biệt từ ${brand}.</li>
            </ul>
          </div>
        </div>
      `
    };

    wrap.innerHTML = `
      <h1 class="text-2xl sm:text-3xl font-black uppercase tracking-widest border-b border-black pb-4 mb-8 text-left flex items-center justify-between gap-4">
        <span>${policyData.title}</span>
        ${canEditSettings ? `
          <button id="quick-edit-member-btn" class="shrink-0 p-1.5 bg-black hover:bg-zinc-800 text-[#C9A84C] hover:text-white rounded-lg border border-white/20 shadow-md transition cursor-pointer select-none border-none flex items-center justify-center" title="Chỉnh sửa nội dung trang này">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        ` : ''}
      </h1>
      <div class="space-y-8 text-sm text-zinc-800">
        ${policyData.content}
      </div>
    `;

    if (canEditSettings) {
      wrap.querySelector('#quick-edit-member-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { openQuickSettings } = await import('../../components/QuickSettingsModal.js?v=1.0.24');
        openQuickSettings('policies', policySlug);
      });
    }
  }

  async _renderOnline(wrap) {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/active`);
      if (res.ok) {
        const data = await res.json();
        const count = data.active_users || data.count || data.total || null;
        if (count && typeof count === 'number') {
          this._activeCount = count;
        }
      }
    } catch { }

    const brand = window.APP_SETTINGS?.brand_name || 'Mắt Bão WS';

    wrap.innerHTML = `
      <h1 class="text-2xl sm:text-3xl font-black uppercase tracking-widest border-b border-black pb-4 mb-8 text-left">
        ${brand.toUpperCase()} COMMUNITY — ONLINE
      </h1>
      <div class="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-xl max-w-xl mx-auto space-y-6">
        <p class="text-xs uppercase font-extrabold tracking-widest text-zinc-500">Số lượng thành viên đang trực tuyến</p>
        <div class="flex items-center justify-center gap-3">
          <span class="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span class="text-5xl font-black tracking-tight text-zinc-950">${this._activeCount}</span>
        </div>
        <p class="text-xs font-bold text-zinc-600 max-w-sm mx-auto px-4 uppercase tracking-wider leading-relaxed">
          Cảm ơn bạn đã lựa chọn ${brand}. Cộng đồng mua sắm trực tuyến thời trang thiết kế độc quyền.
        </p>
      </div>
    `;
  }


}
