import { showToast } from '../../pages/Admin/shared/ui.js';

export function renderSectionsForm(settings) {
  if (!settings.home_sections) settings.home_sections = {};
  if (!settings.home_sections.announcement_bar) settings.home_sections.announcement_bar = { messages: [] };
  if (!settings.home_sections.footer) {
    settings.home_sections.footer = {
      business_name: 'HỘ KINH DOANH MẮT BÃO WS',
      address: 'Trụ sở: 182/13A Lê Văn Sỹ, Phường 10, Quận Phú Nhuận, Thành phố Hồ Chí Minh',
      business_code: 'Mã số hộ kinh doanh: 8116645121-001',
      socials: {
        facebook: 'https://facebook.com',
        shopee: 'https://shopee.vn',
        tiktok: 'https://tiktok.com',
        instagram: 'https://instagram.com'
      }
    };
  }
  if (!settings.home_sections.trust_badges) {
    settings.home_sections.trust_badges = [
      { title: 'GIAO HÀNG TOÀN QUỐC', desc: 'Nhận hàng trong 2-4 ngày', icon: 'truck' },
      { title: '7 NGÀY ĐỔI TRẢ', desc: 'Dễ dàng đổi trả sản phẩm', icon: 'rotate-ccw' },
      { title: '100% CHÍNH HÃNG', desc: 'Cam kết chất lượng sản phẩm', icon: 'shield' },
      { title: 'TÍCH ĐIỂM THÀNH VIÊN', desc: 'Đổi nhiều ưu đãi đặc quyền', icon: 'star' }
    ];
  }

  const sec = settings.home_sections;
  const ab = sec.announcement_bar;
  const footer = sec.footer;
  const socials = footer.socials || {};

  return `
    <div class="space-y-6 font-sans text-xs">
      <!-- 1. Announcement Bar -->
      <div id="quick-sec-announcement_bar" class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-3 scroll-mt-2 transition-all duration-300">
        <div class="flex items-center justify-between border-b pb-2 border-gray-200">
          <span class="font-bold text-gray-800">1. Dòng chạy thông báo</span>
          <button type="button" id="quick-add-announcement-msg" class="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-[9px] px-2 py-1 rounded transition-colors border-0 cursor-pointer">
            + Thêm tin
          </button>
        </div>
        <div class="space-y-2" id="quick-announcement-msgs-list">
          ${ab.messages.map((msg, i) => `
            <div class="quick-announcement-msg-row flex items-center gap-1.5" data-msg-index="${i}">
              <input type="text" class="quick-announcement-input w-full px-2.5 py-1 border border-gray-300 rounded text-[11px] focus:outline-none" value="${msg}" />
              <button type="button" class="quick-delete-announcement-msg-btn p-1 border border-red-50 text-red-500 rounded bg-white cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 2. Footer Section -->
      <div id="quick-sec-footer" class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-3 scroll-mt-2 transition-all duration-300">
        <div class="flex items-center justify-between border-b pb-2 border-gray-200">
          <span class="font-bold text-gray-800">2. Thông tin chân trang (Footer)</span>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tên Hộ Kinh Doanh / Công Ty</label>
            <input type="text" id="quick-footer-biz-name" value="${footer.business_name || ''}" class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Địa chỉ trụ sở</label>
            <input type="text" id="quick-footer-address" value="${footer.address || ''}" class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mã số đăng ký kinh doanh</label>
            <input type="text" id="quick-footer-biz-code" value="${footer.business_code || ''}" class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-[11px] focus:outline-none" />
          </div>
          <div class="border-t border-gray-200 pt-2.5 space-y-2">
            <span class="block font-bold text-gray-700">Mạng xã hội (Social Links)</span>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Facebook</label>
                <input type="text" id="quick-footer-fb" value="${socials.facebook || ''}" class="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none" />
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Shopee</label>
                <input type="text" id="quick-footer-shopee" value="${socials.shopee || ''}" class="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none" />
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Tiktok</label>
                <input type="text" id="quick-footer-tiktok" value="${socials.tiktok || ''}" class="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none" />
              </div>
              <div>
                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Instagram</label>
                <input type="text" id="quick-footer-insta" value="${socials.instagram || ''}" class="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Cam kết & Chính sách (Trust Badges) -->
      <div id="quick-sec-trust_badges" class="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-3 scroll-mt-2 transition-all duration-300">
        <div class="flex items-center justify-between border-b pb-2 border-gray-200">
          <span class="font-bold text-gray-800">3. Cam kết & Chính sách (Trust Badges)</span>
        </div>
        <div class="space-y-3">
          ${sec.trust_badges.map((badge, idx) => `
            <div class="quick-trust-badge-row p-3 bg-white border border-gray-100 rounded-xl space-y-2" data-badge-index="${idx}">
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 flex items-center justify-center bg-zinc-950 text-white rounded-full text-[9px] font-bold">${idx + 1}</span>
                <div class="flex-1">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tiêu đề chính</label>
                  <input type="text" class="quick-badge-title w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A84C] font-semibold text-gray-800" value="${badge.title || ''}" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 pl-8">
                <div>
                  <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Mô tả phụ</label>
                  <input type="text" class="quick-badge-desc w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" value="${badge.desc || ''}" />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Biểu tượng</label>
                  <select class="quick-badge-icon w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C] font-medium text-gray-700">
                    <option value="truck" ${badge.icon === 'truck' ? 'selected' : ''}>Xe vận chuyển (Truck)</option>
                    <option value="rotate-ccw" ${badge.icon === 'rotate-ccw' ? 'selected' : ''}>Đổi trả hàng (Rotate)</option>
                    <option value="shield" ${badge.icon === 'shield' ? 'selected' : ''}>Chính hãng/Khiên (Shield)</option>
                    <option value="star" ${badge.icon === 'star' ? 'selected' : ''}>Tích điểm/Ngôi sao (Star)</option>
                  </select>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindSectionsEvents(modalEl, settings, renderModal) {
  const sec = settings.home_sections;

  // 1. Announcement Bar
  const abMsgsList = modalEl.querySelector('#quick-announcement-msgs-list');
  abMsgsList?.querySelectorAll('.quick-announcement-msg-row').forEach(msgRow => {
    const idx = parseInt(msgRow.dataset.msgIndex, 10);
    msgRow.querySelector('.quick-announcement-input')?.addEventListener('input', (e) => {
      sec.announcement_bar.messages[idx] = e.target.value.trim();
    });
    msgRow.querySelector('.quick-delete-announcement-msg-btn')?.addEventListener('click', () => {
      sec.announcement_bar.messages.splice(idx, 1);
      showToast('Đã xóa dòng thông báo.', 'info');
      renderModal();
    });
  });

  modalEl.querySelector('#quick-add-announcement-msg')?.addEventListener('click', () => {
    sec.announcement_bar.messages.push('Thông báo mới');
    showToast('Đã thêm thông báo.', 'success');
    renderModal();
  });

  // 2. Footer Section
  const bizNameInput = modalEl.querySelector('#quick-footer-biz-name');
  const addressInput = modalEl.querySelector('#quick-footer-address');
  const bizCodeInput = modalEl.querySelector('#quick-footer-biz-code');
  const fbInput = modalEl.querySelector('#quick-footer-fb');
  const shopeeInput = modalEl.querySelector('#quick-footer-shopee');
  const tiktokInput = modalEl.querySelector('#quick-footer-tiktok');
  const instaInput = modalEl.querySelector('#quick-footer-insta');

  if (!sec.footer) sec.footer = {};
  if (!sec.footer.socials) sec.footer.socials = {};

  bizNameInput?.addEventListener('input', (e) => { sec.footer.business_name = e.target.value.trim(); });
  addressInput?.addEventListener('input', (e) => { sec.footer.address = e.target.value.trim(); });
  bizCodeInput?.addEventListener('input', (e) => { sec.footer.business_code = e.target.value.trim(); });
  
  fbInput?.addEventListener('input', (e) => { sec.footer.socials.facebook = e.target.value.trim(); });
  shopeeInput?.addEventListener('input', (e) => { sec.footer.socials.shopee = e.target.value.trim(); });
  tiktokInput?.addEventListener('input', (e) => { sec.footer.socials.tiktok = e.target.value.trim(); });
  instaInput?.addEventListener('input', (e) => { sec.footer.socials.instagram = e.target.value.trim(); });

  // 3. Trust Badges
  modalEl.querySelectorAll('.quick-trust-badge-row').forEach(row => {
    const idx = parseInt(row.dataset.badgeIndex, 10);
    const badge = sec.trust_badges?.[idx];
    if (!badge) return;

    row.querySelector('.quick-badge-title')?.addEventListener('input', (e) => {
      badge.title = e.target.value.trim();
    });
    row.querySelector('.quick-badge-desc')?.addEventListener('input', (e) => {
      badge.desc = e.target.value.trim();
    });
    row.querySelector('.quick-badge-icon')?.addEventListener('change', (e) => {
      badge.icon = e.target.value;
    });
  });
}
